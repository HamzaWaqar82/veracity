import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://localhost:5432/veracity")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
LANGSMITH_API_KEY = os.getenv("LANGSMITH_API_KEY", "")
EMBEDDING_MODEL = "text-embedding-3-small"
LLM_MODEL = "mistralai/mistral-7b-instruct"
