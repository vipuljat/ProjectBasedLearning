from fastapi import APIRouter, HTTPException, Depends
from database import get_db

router = APIRouter()

@router.get("/projects")
async def get_all_stored_projects(db=Depends(get_db)):
    try:
        collection = db["projectModules"]
        # Fetch all project entries
        cursor = collection.find({})
        projects = []
        async for doc in cursor:
            projects.append({
                "project_title": doc["project_title"],
                "modules": doc.get("modules", [])
            })
        return projects

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
