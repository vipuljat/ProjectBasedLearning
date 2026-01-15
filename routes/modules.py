from fastapi import APIRouter, HTTPException, Depends
from typing import List
from services import get_project_modules, generate_module_details
from models import ProjectModule, Module, ModuleDetails
from database import get_db
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/modules/{project_title}", response_model=List[ProjectModule])
async def fetch_project_modules(project_title: str, db: AsyncIOMotorClient = Depends(get_db)):
    try:
        collection = db["projectModules"]
        preferences_collection = db["UserPreferences"]

        # Fetch user preferences for studentId "008"
        user_prefs = await preferences_collection.find_one({"studentId": "008"})
        if not user_prefs:
            logger.error("User preferences not found for studentId: 008")
            raise HTTPException(status_code=404, detail="User preferences not found for studentId: 008")

        total_weeks = user_prefs.get("totalWeeks", 4)
        hours_per_day = user_prefs.get("hoursPerDay", 3)

        existing = await collection.find_one({"project_title": project_title})
        if existing:
            logger.info(f"Returning existing modules for project_title: {project_title}")
            return existing["modules"]

        # Generate a unique project ID
        project_id = str(uuid.uuid4())
        logger.info(f"Generating new modules for project_title: {project_title} with project_id: {project_id}")

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

        logger.info(f"Saved {len(modules)} modules for project_title: {project_title}")
        return modules

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching modules for project_title {project_title}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/moduleDetails", response_model=ModuleDetails)
async def get_module_details(module: Module, db: AsyncIOMotorClient = Depends(get_db)):
    try:
        collection = db["moduleDetails"]
        preferences_collection = db["UserPreferences"]
        logger.info(f"Received request to generate details for module: {module.title}")

        # Fetch user preferences
        user_prefs = await preferences_collection.find_one({"studentId": "008"})
        if not user_prefs:
            logger.error("User preferences not found for studentId: 008")
            raise HTTPException(status_code=400, detail="User preferences not found")

        def extract_number(value: str) -> int:
            match = re.search(r'\d+', value)
            return int(match.group()) if match else 2

        total_weeks = extract_number(user_prefs.get("totalWeeks", "2 weeks"))
        hours_per_day = extract_number(user_prefs.get("hoursPerDay", "2 hours/day"))

        module_id = module.__dict__.get("module_id", str(uuid.uuid4()))
        project_id = module.__dict__.get("project_id", str(uuid.uuid4()))

        # Check for existing module details with full uniqueness constraints
        existing = await collection.find_one({
            "title": module.title,
            "summary": module.summary,
            "project_id": project_id,
            "module_id": module_id
        })
        if existing:
            logger.info(f"Returning existing details for module_id: {module_id}")
            return ModuleDetails(**existing["details"])

        logger.info(f"Generating new details for module_id: {module_id}")
        details = generate_module_details(
            module=module,
            total_weeks=total_weeks,
            hours_per_day=hours_per_day,
            project_id=project_id,
            module_id=module_id
        )

        logger.info(f"Generated details for module_id: {module_id}: {details.dict()}")
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
            "days": details.days
        })

        return details

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing module details for {module.title}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/moduleDetails/project/{project_id}", response_model=List[ModuleDetails])
async def get_all_module_details(project_id: str, db: AsyncIOMotorClient = Depends(get_db)):
    """
    Fetch all pre-generated module details for a given project_id, sorted by module_id.
    """
    try:
        if not project_id:
            logger.error("Missing project_id in request")
            raise HTTPException(status_code=400, detail="Project ID is required")

        collection = db["moduleDetails"]
        module_details = []
        async for doc in collection.find({"project_id": project_id}).sort("module_id"):
            module_details.append(ModuleDetails(**doc["details"]))
        
        if not module_details:
            logger.warning(f"No module details found for project_id: {project_id}")
            raise HTTPException(status_code=404, detail=f"No module details found for project_id: {project_id}")
        
        logger.info(f"Fetched {len(module_details)} module details for project_id: {project_id}")
        return module_details

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching module details for project_id {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))