"""
Contracts API routes: upload, list, retrieve, analyze, compare.
"""
import json
import logging
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.core.config import settings
from app.core.database import get_db
from app.models.contract import Contract, ContractStatus, RiskLevel
from app.models.clause import Clause
from app.services.extraction import extract_text
from app.services.ai_analysis import analyze_contract, compare_contracts
from app.services.vector_store import index_contract, delete_contract_index

router = APIRouter(prefix="/contracts", tags=["Contracts"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
    "text/plain": "txt",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/tiff": "tiff",
}


async def process_contract_background(contract_id: str, file_path: str, file_type: str):
    """Background task: extract text, analyze with AI, index for RAG."""
    from app.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        # Fetch contract
        result = await db.execute(select(Contract).where(Contract.id == contract_id))
        contract = result.scalar_one_or_none()
        if not contract:
            return

        try:
            # Step 1: Extract text
            contract.status = ContractStatus.PROCESSING
            await db.commit()

            raw_text = extract_text(file_path, file_type)
            contract.raw_text = raw_text

            # Step 2: AI analysis
            if settings.OPENAI_API_KEY:
                analysis = await analyze_contract(raw_text)

                contract.title = analysis.get("title", contract.title)
                contract.contract_type = analysis.get("contract_type", "")
                contract.summary = analysis.get("summary", "")
                contract.risk_score = float(analysis.get("risk_score", 0))
                contract.risk_level = analysis.get("risk_level", RiskLevel.UNKNOWN)
                contract.effective_date = analysis.get("effective_date", "")
                contract.expiry_date = analysis.get("expiry_date", "")
                contract.parties = json.dumps(analysis.get("parties", []))
                contract.obligations = json.dumps(analysis.get("obligations", []))
                contract.key_terms = json.dumps(analysis.get("key_terms", []))

                # Step 3: Save clauses
                clauses_data = analysis.get("clauses", [])
                for clause_data in clauses_data:
                    clause = Clause(
                        contract_id=contract.id,
                        clause_type=clause_data.get("clause_type", "Other"),
                        title=clause_data.get("title", ""),
                        content=clause_data.get("content", ""),
                        risk_level=clause_data.get("risk_level", "unknown"),
                        risk_score=float(clause_data.get("risk_score", 0)),
                        explanation=clause_data.get("explanation", ""),
                        suggestion=clause_data.get("suggestion", ""),
                    )
                    db.add(clause)

                # Step 4: Index for RAG
                await index_contract(contract.id, raw_text)

            contract.status = ContractStatus.READY
            await db.commit()

        except Exception as e:
            logger.error("Contract processing failed for %s: %s", contract_id, e)
            contract.status = ContractStatus.FAILED
            await db.commit()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_contract(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
):
    """Upload a contract file (PDF, DOCX, image)."""
    if file.content_type not in ALLOWED_TYPES and not any(
        file.filename.lower().endswith(ext) for ext in [".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg"]
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}",
        )

    # Check file size
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE_MB}MB",
        )

    # Save file to disk
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_extension = Path(file.filename).suffix.lower() if file.filename else ".pdf"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Determine file type
    file_type = file.content_type or file_extension.lstrip(".")

    # Create contract record
    contract = Contract(
        title=title or Path(file.filename).stem if file.filename else "Untitled Contract",
        file_name=file.filename or unique_filename,
        file_path=file_path,
        file_type=file_type,
        file_size=len(contents),
        status=ContractStatus.UPLOADING,
    )
    db.add(contract)
    await db.commit()
    await db.refresh(contract)

    # Trigger background processing
    background_tasks.add_task(
        process_contract_background, contract.id, file_path, file_type
    )

    return {
        "id": contract.id,
        "title": contract.title,
        "status": contract.status,
        "message": "Contract uploaded successfully. Analysis in progress.",
    }


@router.get("/")
async def list_contracts(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    """List all contracts."""
    result = await db.execute(
        select(Contract).order_by(desc(Contract.created_at)).offset(skip).limit(limit)
    )
    contracts = result.scalars().all()
    return [_serialize_contract(c) for c in contracts]


@router.get("/{contract_id}")
async def get_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Get detailed contract information including clauses."""
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Load clauses
    clauses_result = await db.execute(
        select(Clause).where(Clause.contract_id == contract_id)
    )
    clauses = clauses_result.scalars().all()

    data = _serialize_contract(contract)
    data["clauses"] = [_serialize_clause(c) for c in clauses]
    return data


@router.get("/{contract_id}/status")
async def get_contract_status(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Poll contract processing status."""
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"id": contract.id, "status": contract.status, "title": contract.title}


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contract(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a contract and its data."""
    result = await db.execute(select(Contract).where(Contract.id == contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Delete file
    if os.path.exists(contract.file_path):
        os.remove(contract.file_path)

    # Delete vector index
    delete_contract_index(contract_id)

    await db.delete(contract)
    await db.commit()


class CompareRequest(BaseModel):
    contract_id_1: str
    contract_id_2: str


@router.post("/compare")
async def compare_two_contracts(data: CompareRequest, db: AsyncSession = Depends(get_db)):
    """Compare two contracts and highlight differences."""
    result1 = await db.execute(select(Contract).where(Contract.id == data.contract_id_1))
    contract1 = result1.scalar_one_or_none()

    result2 = await db.execute(select(Contract).where(Contract.id == data.contract_id_2))
    contract2 = result2.scalar_one_or_none()

    if not contract1 or not contract2:
        raise HTTPException(status_code=404, detail="One or both contracts not found")

    if not contract1.raw_text or not contract2.raw_text:
        raise HTTPException(
            status_code=400,
            detail="Both contracts must be fully processed before comparison",
        )

    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    comparison = await compare_contracts(
        contract1.raw_text,
        contract2.raw_text,
        contract1.title,
        contract2.title,
    )
    return {
        "contract1": {"id": contract1.id, "title": contract1.title},
        "contract2": {"id": contract2.id, "title": contract2.title},
        "comparison": comparison,
    }


def _serialize_contract(c: Contract) -> dict:
    return {
        "id": c.id,
        "title": c.title,
        "file_name": c.file_name,
        "file_type": c.file_type,
        "file_size": c.file_size,
        "status": c.status,
        "risk_score": c.risk_score,
        "risk_level": c.risk_level,
        "summary": c.summary,
        "contract_type": c.contract_type,
        "parties": json.loads(c.parties) if c.parties else [],
        "effective_date": c.effective_date,
        "expiry_date": c.expiry_date,
        "obligations": json.loads(c.obligations) if c.obligations else [],
        "key_terms": json.loads(c.key_terms) if c.key_terms else [],
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
    }


def _serialize_clause(c: Clause) -> dict:
    return {
        "id": c.id,
        "clause_type": c.clause_type,
        "title": c.title,
        "content": c.content,
        "risk_level": c.risk_level,
        "risk_score": c.risk_score,
        "explanation": c.explanation,
        "suggestion": c.suggestion,
    }
