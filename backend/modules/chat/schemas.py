"""RAG chat API schemas."""

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000, description="User's question")
    history: list[ChatMessage] = Field(default_factory=list, description="Previous conversation messages")


class NodeRef(BaseModel):
    """A reference to a graph node cited in the answer."""

    id: str
    name: str
    node_type: str
    summary_zh: str = ""


class ChatResponse(BaseModel):
    answer: str
    references: list[NodeRef] = Field(default_factory=list)
    nodes_consulted: int = 0

