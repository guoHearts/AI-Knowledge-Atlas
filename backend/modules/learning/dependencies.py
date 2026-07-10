"""FastAPI dependencies for learning module."""

from collections.abc import Iterator

from modules.learning.db import get_learning_connection
from modules.learning.repository import LearningRepository
from modules.learning.service import LearningService


def get_learning_service() -> Iterator[LearningService]:
    with get_learning_connection() as conn:
        yield LearningService(LearningRepository(conn))
