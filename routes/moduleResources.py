from typing import Dict, List
from fastapi import APIRouter, Body, Depends, HTTPException, logger
from motor.motor_asyncio import AsyncIOMotorClient
from database import get_db


router = APIRouter()

@router.get("/moduleDetails/project/{project_id}/resources", response_model=List[Dict])
async def get_project_resources(project_id: str, db: AsyncIOMotorClient = Depends(get_db)):
    """
    Fetch all resources from the moduleDetails collection for a given project_id.
    Returns a list of all resources aggregated from all steps across all modules.
    """
    try:            

        collection = db["moduleDetails"]
        # Find all modules for the given project_id
        modules_cursor = collection.find({"project_id": project_id})

        resources = []
        async for module_details in modules_cursor:
            details = module_details.get("details", {})
            steps = details.get("steps", [])

            # Aggregate resources from all steps in this module
            for step in steps:
                step_resources = step.get("resources", [])
                if step_resources and isinstance(step_resources, list):
                    for resource in step_resources:
                        if isinstance(resource, str) and resource.strip():
                            resources.append({
                                "url": resource,
                                "type": "article",  # Default type; can be adjusted if type is available
                                "title": resource.split("/")[-1] or "Resource",  # Extract a simple title from URL
                                "description": f"Resource related to {details.get('title', 'this module')}"  # Use module title for context
                            })

        if not resources:
            return []

        
        return resources

    except HTTPException as e:
        raise e
        