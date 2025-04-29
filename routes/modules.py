from fastapi import APIRouter, HTTPException, Depends
from typing import List
from services import get_project_modules
from models import ProjectModule
from database import get_db
from datetime import datetime

router = APIRouter()

@router.get("/modules/{project_title}", response_model=List[ProjectModule])
async def fetch_project_modules(project_title: str, db=Depends(get_db)):
    try:
        collection = db["projectModules"]

        # Check if already stored
        existing = await collection.find_one({"project_title": project_title})
        if existing:
            return existing["modules"]

        # Fetch fresh data
        modules = get_project_modules(project_title)

        if isinstance(modules, list):
            for module in modules:
                if hasattr(module, "error"):
                    raise HTTPException(status_code=500, detail=module)

        # Save plain modules to DB
        await collection.insert_one({
            "project_title": project_title,
            "modules": [module.dict() for module in  modules],
            "stored_at": datetime.utcnow()
        })

        return modules

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
