"""HTTP routes for RAG chat."""

from fastapi import APIRouter, Depends

from models.repository import GraphRepository
from modules.chat.schemas import ChatRequest, ChatResponse
from modules.chat.service import ChatService
from modules.graph.dependencies import get_graph_repository

router = APIRouter(prefix="/graph", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    repo: GraphRepository = Depends(get_graph_repository),
):
    service = ChatService(repo)
    return await service.chat(req)

