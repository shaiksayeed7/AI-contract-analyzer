"""
Vector store service for RAG-based contract chatbot.
Uses ChromaDB to store and retrieve contract embeddings.
"""
import logging
import os
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def get_chroma_collection(contract_id: str):
    """Get or create a ChromaDB collection for a specific contract."""
    try:
        import chromadb
        chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        collection_name = f"contract_{contract_id.replace('-', '_')}"
        return chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
    except Exception as e:
        logger.error("Failed to get ChromaDB collection for contract %s: %s", contract_id, e)
        return None


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)
        chunk = text[start:end]
        if chunk.strip():
            chunks.append(chunk)
        start = end - overlap

    return chunks


async def get_embedding(text: str) -> list[float]:
    """Get OpenAI embedding for a text string."""
    response = await client.embeddings.create(
        input=text,
        model=settings.OPENAI_EMBEDDING_MODEL,
    )
    return response.data[0].embedding


async def index_contract(contract_id: str, raw_text: str) -> bool:
    """
    Index a contract's text into the vector store for RAG retrieval.
    Returns True on success, False on failure.
    """
    try:
        collection = get_chroma_collection(contract_id)
        if collection is None:
            return False

        chunks = chunk_text(raw_text)
        if not chunks:
            return False

        # Generate embeddings for all chunks
        embeddings = []
        for chunk in chunks:
            embedding = await get_embedding(chunk)
            embeddings.append(embedding)

        ids = [f"{contract_id}_chunk_{i}" for i in range(len(chunks))]

        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
        )
        return True
    except Exception as e:
        logger.error("Failed to index contract %s: %s", contract_id, e)
        return False


async def search_contract(contract_id: str, query: str, n_results: int = 5) -> Optional[str]:
    """
    Search the vector store for relevant contract sections.
    Returns concatenated relevant text or None.
    """
    try:
        collection = get_chroma_collection(contract_id)
        if collection is None:
            return None

        query_embedding = await get_embedding(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=min(n_results, collection.count()),
        )

        if not results or not results.get("documents"):
            return None

        documents = results["documents"][0]
        return "\n\n---\n\n".join(documents)
    except Exception as e:
        logger.error("Failed to search contract %s: %s", contract_id, e)
        return None


def delete_contract_index(contract_id: str) -> bool:
    """Delete the vector store index for a contract."""
    try:
        import chromadb
        chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        collection_name = f"contract_{contract_id.replace('-', '_')}"
        chroma_client.delete_collection(collection_name)
        return True
    except Exception as e:
        logger.error("Failed to delete index for contract %s: %s", contract_id, e)
        return False
