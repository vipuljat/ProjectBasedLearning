from fastapi import APIRouter
from models import StudentParams, ProjectSuggestion
from services import generate_project_suggestions
from typing import List

router = APIRouter()

@router.post("/suggest-projects", response_model=List[ProjectSuggestion])
async def suggest_projects(params: StudentParams):
    """Returns project suggestions based on user input."""
    try:
        suggestions = generate_project_suggestions(params)
        return suggestions if suggestions else [{"title": "No suggestions", "description": "Try again later.", "difficulty": "N/A"}]
    except Exception as e:
        return [{"title": "Error", "description": f"Failed to generate suggestions: {str(e)}", "difficulty": "N/A"}]
