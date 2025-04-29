from fastapi import APIRouter, Body, Depends, HTTPException
from models import ProjectResourceRequest, ProjectResources
from services import get_project_resources
from database import get_db
from datetime import datetime

router = APIRouter()

@router.post("/projectResources", response_model=ProjectResources)
async def project_resources(request: ProjectResourceRequest = Body(...), db=Depends(get_db)):
    """Returns a list of resources for the selected project and saves them if not already stored."""
    try:
        collection = db["projectResources"]

        # Check if already stored
        existing = await collection.find_one({"title": request.title, "overview": request.overview})
        if existing:
            return {"resources": existing["resources"]}

        # Fetch fresh data (this returns a dict)
        resources = get_project_resources(request.title, request.overview)

        # Save to DB
        await collection.insert_one({
            "title": request.title,
            "overview": request.overview,
            "resources": resources["resources"],
            "stored_at": datetime.utcnow()
        })

        return resources

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch or save resources.")
