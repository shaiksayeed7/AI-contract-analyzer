from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Clause(Base):
    __tablename__ = "clauses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)

    clause_type = Column(String(100), nullable=False)   # e.g., "Termination", "Payment"
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    risk_level = Column(String(20), default="unknown")  # low, medium, high
    risk_score = Column(Float, default=0.0)

    explanation = Column(Text, nullable=True)           # AI explanation
    suggestion = Column(Text, nullable=True)            # AI suggested change

    position_start = Column(Integer, default=0)         # character position in raw text
    position_end = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    contract = relationship("Contract", back_populates="clauses")
