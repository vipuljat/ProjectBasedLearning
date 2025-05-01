from fastapi import APIRouter, HTTPException, Depends
from typing import List
from services import get_project_modules
from models import ProjectModule
from database import get_db
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

router = APIRouter()

@router.get("/modules/{project_title}", response_model=List[ProjectModule])
async def fetch_project_modules(project_title: str, db: AsyncIOMotorClient = Depends(get_db)):
    try:
        collection = db["projectModules"]
        preferences_collection = db["UserPreferences"]

        # Example: Fetch user preferences for studentId "008"
        user_prefs = await preferences_collection.find_one({"studentId": "008"})
        if not user_prefs:
            raise HTTPException(status_code=404, detail="User preferences not found for studentId: 008")

        total_weeks = user_prefs.get("totalWeeks", 4)
        hours_per_day = user_prefs.get("hoursPerDay", 3)

        existing = await collection.find_one({"project_title": project_title})
        if existing:
            return existing["modules"]

        # Generate a unique project ID
        project_id = str(uuid.uuid4())

        modules = get_project_modules(
            project_title=project_title,
            total_weeks=total_weeks,
            hours_per_day=hours_per_day,
            project_id=project_id
        )

        # Save modules with project_id mapping
        await collection.insert_one({
            "project_title": project_title,
            "project_id": project_id,
            "modules": [module.dict() for module in modules],
            "stored_at": datetime.utcnow()
        })

        return modules

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
