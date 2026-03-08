from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id = Column(String, ForeignKey("contracts.id"), nullable=False)

    role = Column(String(20), nullable=False)    # "user" or "assistant"
    content = Column(Text, nullable=False)
    risk_level = Column(String(20), nullable=True)   # for assistant messages
    cited_clauses = Column(Text, nullable=True)      # JSON string of referenced clause IDs

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    contract = relationship("Contract", back_populates="chat_messages")
