"""
AI analysis service for contract processing using OpenAI GPT.
"""
import json
import re
from typing import Optional
from openai import AsyncOpenAI
from app.core.config import settings

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


ANALYSIS_SYSTEM_PROMPT = """You are LexiScan AI, an expert contract lawyer assistant.
Analyze legal contracts thoroughly and extract structured information.
Always respond with valid JSON only — no markdown, no explanation outside JSON.
Be precise, thorough, and professional."""

CLAUSE_TYPES = [
    "Payment Terms",
    "Termination",
    "Liability / Indemnification",
    "Confidentiality / NDA",
    "IP Ownership",
    "Data Ownership",
    "Governing Law",
    "Dispute Resolution",
    "Auto-Renewal",
    "Notice Period",
    "Force Majeure",
    "Non-Compete",
    "Warranties",
    "Representations",
    "Obligations",
]


async def analyze_contract(raw_text: str) -> dict:
    """
    Full contract analysis: summary, risk score, parties, clauses.
    Returns a structured dict with all analysis results.
    """
    # Truncate text to fit within token limits (roughly 12000 chars ~ 3000 tokens)
    text_excerpt = raw_text[:settings.AI_ANALYSIS_CONTEXT_CHARS] if len(raw_text) > settings.AI_ANALYSIS_CONTEXT_CHARS else raw_text

    prompt = f"""Analyze this contract and return a JSON object with EXACTLY this structure:

{{
  "title": "contract title or best guess",
  "contract_type": "e.g. Vendor Agreement, Employment Contract, NDA, etc.",
  "summary": "2-3 sentence plain-English summary of what this contract is about",
  "risk_score": <number 0-100, where 100 is highest risk>,
  "risk_level": "low" | "medium" | "high",
  "parties": [
    {{"name": "Party Name", "role": "e.g. Vendor, Client, Employee"}}
  ],
  "effective_date": "date string or null",
  "expiry_date": "date string or null",
  "key_terms": [
    {{"term": "term name", "value": "term value", "risk": "low|medium|high"}}
  ],
  "obligations": [
    {{"party": "party name", "obligation": "what they must do", "deadline": "deadline or null"}}
  ],
  "clauses": [
    {{
      "clause_type": "one of the standard types",
      "title": "short title",
      "content": "the relevant text excerpt (max 500 chars)",
      "risk_level": "low" | "medium" | "high",
      "risk_score": <0-100>,
      "explanation": "plain English explanation of what this means and why it's risky",
      "suggestion": "suggested improvement if risky, or null if safe"
    }}
  ],
  "risk_breakdown": {{
    "Payment Terms": {{"risk": "low|medium|high", "score": 0}},
    "Termination": {{"risk": "low|medium|high", "score": 0}},
    "Liability / Indemnification": {{"risk": "low|medium|high", "score": 0}},
    "Confidentiality / NDA": {{"risk": "low|medium|high", "score": 0}},
    "IP Ownership": {{"risk": "low|medium|high", "score": 0}},
    "Data Ownership": {{"risk": "low|medium|high", "score": 0}}
  }}
}}

CONTRACT TEXT:
{text_excerpt}"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)


async def generate_summary(raw_text: str) -> str:
    """Generate a concise executive summary of the contract."""
    text_excerpt = raw_text[:settings.AI_SUMMARY_CONTEXT_CHARS] if len(raw_text) > settings.AI_SUMMARY_CONTEXT_CHARS else raw_text

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a legal expert. Summarize contracts in plain English for non-lawyers. Be concise and highlight the most important points.",
            },
            {
                "role": "user",
                "content": f"Summarize this contract in 3-5 bullet points:\n\n{text_excerpt}",
            },
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content


async def chat_with_contract(
    question: str,
    contract_text: str,
    contract_title: str,
    conversation_history: list[dict],
    relevant_clauses: Optional[str] = None,
) -> dict:
    """
    Answer a user question about a contract using RAG context.

    Returns:
        dict with keys: answer, risk_level, cited_clauses
    """
    # Build context from relevant clauses (RAG) or full text excerpt
    if relevant_clauses:
        context = f"Relevant contract sections:\n{relevant_clauses}"
    else:
        context = contract_text[:settings.AI_CHAT_CONTEXT_CHARS]

    system_message = f"""You are LexiScan AI, a smart contract assistant.
You are analyzing: "{contract_title}"

Use the contract context provided to answer questions accurately.
Always cite specific clauses when possible.
Assess risk level (low/medium/high) for each answer.

Respond in JSON format:
{{
  "answer": "your detailed answer here",
  "risk_level": "low" | "medium" | "high" | "neutral",
  "cited_clauses": ["clause reference 1", "clause reference 2"],
  "confidence": "high" | "medium" | "low"
}}

Contract context:
{context}"""

    messages = [{"role": "system", "content": system_message}]

    # Add conversation history (last 6 messages)
    for msg in conversation_history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "answer": content,
            "risk_level": "neutral",
            "cited_clauses": [],
            "confidence": "low",
        }


async def compare_contracts(text1: str, text2: str, title1: str, title2: str) -> dict:
    """Compare two contracts and highlight key differences."""
    excerpt1 = text1[:settings.AI_COMPARE_CONTEXT_CHARS] if len(text1) > settings.AI_COMPARE_CONTEXT_CHARS else text1
    excerpt2 = text2[:settings.AI_COMPARE_CONTEXT_CHARS] if len(text2) > settings.AI_COMPARE_CONTEXT_CHARS else text2

    prompt = f"""Compare these two contracts and return a JSON object:

{{
  "summary": "brief overall comparison",
  "risk_change": "improved" | "worsened" | "neutral",
  "differences": [
    {{
      "section": "section name (e.g., Payment Terms)",
      "version1": "what version 1 says",
      "version2": "what version 2 says",
      "impact": "explanation of impact",
      "risk_change": "better" | "worse" | "neutral"
    }}
  ],
  "version1_advantages": ["advantage 1", "advantage 2"],
  "version2_advantages": ["advantage 1", "advantage 2"],
  "recommendation": "which version is better and why"
}}

CONTRACT 1 ({title1}):
{excerpt1}

CONTRACT 2 ({title2}):
{excerpt2}"""

    response = await client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    return json.loads(content)
