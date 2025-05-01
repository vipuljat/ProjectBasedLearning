from fastapi import APIRouter, Depends, HTTPException
from isoduration import parse_duration
from pydantic import BaseModel
from models import StudentParams, ProjectSuggestion, ProjectModule
from services import generate_project_suggestions
from typing import List, Optional
from datetime import datetime
from database import get_db
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()

@router.post("/suggestProjects", response_model=List[ProjectSuggestion])
async def suggest_projects(params: StudentParams, db = Depends(get_db)):
    """Returns project suggestions based on user input, fetching from database if available, and stores user preferences with a hardcoded studentId."""
    try:
        # Hardcode studentId for testing
        student_id = "008"

        

        # Construct user preferences
        user_preferences = {
            "studentId": student_id,
            "skillLevel": params.skill_level,
            "projectType": params.project_type,
            "technology": params.technology,
            "domain": params.domain,
            "hoursPerDay": params.time_commitment,
            "totalWeeks": params.duration,
            "updatedAt": datetime.utcnow(),
        }

        # Store user preferences in MongoDB
        preferences_collection = db["UserPreferences"]
        await preferences_collection.update_one(
            {"studentId": student_id},
            {
                "$set": user_preferences,
                "$setOnInsert": {"createdAt": datetime.utcnow()}
            },
            upsert=True
        )

        # Generate project suggestions
        suggestions = generate_project_suggestions(params)
        if not suggestions or (len(suggestions) == 1 and suggestions[0].title == "No suggestions"):
            return [{"title": "No suggestions", "description": "Try again later.", "difficulty": "N/A"}]

        return suggestions
    except HTTPException as e:
        raise e
    except Exception as e:
        return [{"title": "Error", "description": f"Failed to generate or save suggestions: {str(e)}", "difficulty": "N/A"}]
    
    
    
class UserPreferences(BaseModel):
    studentId: str
    skillLevel: str
    projectType: str
    technology: str
    domain: Optional[str] = None
    hoursPerDay: str
    totalWeeks: str
    updatedAt: datetime
    createdAt: Optional[datetime] = None

@router.get("/userPreferences/{studentId}", response_model=UserPreferences)
async def get_user_preferences(studentId: str, db: AsyncIOMotorClient = Depends(get_db)):
    """Fetch user preferences for a specific studentId."""
    try:
        preferences_collection = db["UserPreferences"]
        preferences = await preferences_collection.find_one({"studentId": studentId})
        if not preferences:
            raise HTTPException(status_code=404, detail=f"No preferences found for studentId: {studentId}")
        return preferences
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user preferences: {str(e)}")