from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum
import uuid


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    UNKNOWN = "unknown"


class ContractStatus(str, enum.Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, default=0)

    # Extracted content
    raw_text = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)

    # Analysis results
    risk_score = Column(Float, default=0.0)
    risk_level = Column(String(20), default=RiskLevel.UNKNOWN)
    status = Column(String(20), default=ContractStatus.UPLOADING)

    # Key entities
    parties = Column(Text, nullable=True)       # JSON string
    effective_date = Column(String(100), nullable=True)
    expiry_date = Column(String(100), nullable=True)
    contract_type = Column(String(100), nullable=True)

    # Obligations & key terms (JSON strings)
    obligations = Column(Text, nullable=True)
    key_terms = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    clauses = relationship("Clause", back_populates="contract", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="contract", cascade="all, delete-orphan")
    user = relationship("User", back_populates="contracts")
