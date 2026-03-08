"""
Chat API routes for contract chatbot.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db
from app.models.contract import Contract
from app.models.chat import ChatMessage
from app.services.ai_analysis import chat_with_contract
from app.services.vector_store import search_contract

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    contract_id: str
    message: str


@router.post("/")
async def send_message(data: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a message to the contract chatbot."""
    # Validate contract exists
    result = await db.execute(select(Contract).where(Contract.id == data.contract_id))
    contract = result.scalar_one_or_none()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.status != "ready":
        raise HTTPException(
            status_code=400,
            detail="Contract is still being processed. Please wait.",
        )

    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="AI service not configured")

    # Get conversation history
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.contract_id == data.contract_id)
        .order_by(ChatMessage.created_at)
        .limit(20)
    )
    history = history_result.scalars().all()
    conversation_history = [
        {"role": msg.role, "content": msg.content} for msg in history
    ]

    # RAG: search relevant contract sections
    relevant_clauses = await search_contract(data.contract_id, data.message)

    # Save user message
    user_msg = ChatMessage(
        contract_id=data.contract_id,
        role="user",
        content=data.message,
    )
    db.add(user_msg)
    await db.commit()

    # Get AI response
    ai_response = await chat_with_contract(
        question=data.message,
        contract_text=contract.raw_text or "",
        contract_title=contract.title,
        conversation_history=conversation_history,
        relevant_clauses=relevant_clauses,
    )

    # Save assistant message
    assistant_msg = ChatMessage(
        contract_id=data.contract_id,
        role="assistant",
        content=ai_response.get("answer", ""),
        risk_level=ai_response.get("risk_level", "neutral"),
        cited_clauses=str(ai_response.get("cited_clauses", [])),
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(assistant_msg)

    return {
        "id": assistant_msg.id,
        "role": "assistant",
        "content": assistant_msg.content,
        "risk_level": assistant_msg.risk_level,
        "cited_clauses": ai_response.get("cited_clauses", []),
        "confidence": ai_response.get("confidence", "medium"),
    }


@router.get("/{contract_id}/history")
async def get_chat_history(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Get chat history for a contract."""
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.contract_id == contract_id)
        .order_by(ChatMessage.created_at)
    )
    messages = result.scalars().all()
    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "risk_level": msg.risk_level,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }
        for msg in messages
    ]


@router.delete("/{contract_id}/history")
async def clear_chat_history(contract_id: str, db: AsyncSession = Depends(get_db)):
    """Clear chat history for a contract."""
    result = await db.execute(
        select(ChatMessage).where(ChatMessage.contract_id == contract_id)
    )
    messages = result.scalars().all()
    for msg in messages:
        await db.delete(msg)
    await db.commit()
    return {"message": "Chat history cleared"}
