from fastapi import APIRouter, Body
from models import ProjectResourceRequest, ProjectResources
from services import get_project_resources  # Assuming a new model for resources only

router = APIRouter()


@router.post("/projectResources", response_model=ProjectResources)
async def project_resources(request: ProjectResourceRequest = Body(...)):
    """Returns a list of resources for the selected project from multiple platforms based on the provided title and overview."""
    try:
        return get_project_resources(request.title, request.overview)
    except Exception as e:
        return {"resources": []}
