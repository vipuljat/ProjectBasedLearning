from fastapi import APIRouter
from models import ProjectDetails
from services import get_project_details

router = APIRouter()

@router.get("/project-details/{project_title}", response_model=ProjectDetails)
async def project_details(project_title: str):
    """Returns detailed information about the selected project."""
    try:
        return get_project_details(project_title)
    except Exception as e:
        return {"title": project_title, "roadmap": [], "tech_stack": {}, "diagrams": {}}
