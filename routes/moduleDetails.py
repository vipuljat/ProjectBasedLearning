import re
from fastapi import APIRouter, HTTPException, Depends
from models import Module, ModuleDetails
from services import generate_module_details
from database import get_db
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/moduleDetails", response_model=ModuleDetails)
async def get_module_details(module: Module, db: AsyncIOMotorClient = Depends(get_db)):
    try:
        collection = db["moduleDetails"]
        preferences_collection = db["UserPreferences"]
        print(module)

        # Fetch user preferences (duration and timeCommitment)
        user_prefs = await preferences_collection.find_one({"studentId": "008"})
        if not user_prefs:
            raise HTTPException(status_code=400, detail="User preferences not found")
        
        def extract_number(value: str) -> int:
            match = re.search(r'\d+', value)
            return int(match.group()) if match else 2  # default to 2 if nothing found

        total_weeks = extract_number(user_prefs.get("totalWeeks", "2 weeks"))
        hours_per_day = extract_number(user_prefs.get("hoursPerDay", "2 hours/day"))

        module_id = module.__dict__.get("module_id", str(uuid.uuid4()))
        project_id = module.__dict__.get("project_id", str(uuid.uuid4()))

        existing = await collection.find_one({
            "title": module.title,
            "summary": module.summary,
            #"projectId": project_id,
            #"moduleId": module_id
        })
        if existing:
            logger.info(f"Returning existing module details: {existing['details']}")
            return existing["details"]

        details = generate_module_details(
            module=module,
            total_weeks=total_weeks,
            hours_per_day=hours_per_day,
            project_id=project_id,
            module_id=module_id
        )

        # Log the full response data for inspection
        logger.info(f"Generated module details: {details.dict()}")

        await collection.insert_one({
            "title": module.title,
            "summary": module.summary,
            "details": details.dict(),
            "project_id": details.project_id,
            "module_id": details.module_id,
            "total_weeks": details.total_weeks,
            "hours_per_day": details.hours_per_day,
            "module_total_hours": details.module_total_hours,
            "stored_at": details.stored_at,
            "days": details.days  # Will be empty based on current service logic
        })

        return details

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))