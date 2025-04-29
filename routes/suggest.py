from fastapi import APIRouter, Depends
from models import StudentParams, ProjectSuggestion, ProjectModule
from services import generate_project_suggestions
from typing import List
from datetime import datetime
from database import get_db

router = APIRouter()

@router.post("/suggestProjects", response_model=List[ProjectSuggestion])
async def suggest_projects(params: StudentParams, db=Depends(get_db)):
    """Returns project suggestions based on user input, fetching from database if available."""
    try:
        # Create a query to match the StudentParams
        query = {
            "params.skill_level": params.skill_level,
            "params.project_type": params.project_type,
            "params.technology": params.technology,
            "params.duration": params.duration,
            "params.domain": params.domain,
            "params.time_commitment": params.time_commitment,
        }

        # Check if projects already exist in the database
        collection = db["suggestedProjects"]
        existing_entry = await collection.find_one(query)

        if existing_entry:
            # If found, return the stored suggestions as ProjectSuggestion
            return [
                ProjectSuggestion(
                    title=proj["module_title"],
                    description=proj["summary"],
                    difficulty="N/A"  # Set to "N/A" since difficulty is not stored
                )
                for proj in existing_entry["suggestions"]
            ]

        # If no projects found, generate new ones
        suggestions = generate_project_suggestions(params)
        if not suggestions or (len(suggestions) == 1 and suggestions[0].title == "No suggestions"):
            return [{"title": "No suggestions", "description": "Try again later.", "difficulty": "N/A"}]

        # Map ProjectSuggestion to ProjectModule for storage
        projects_to_save = [
            ProjectModule(
                module_title=suggestion.title,
                summary=suggestion.description,
                steps=[f"Step {i+1}: Start implementing {suggestion.title.lower()}" for i in range(3)],  # Placeholder steps
                prerequisites=[f"{params.skill_level.capitalize()} coding skills", f"Knowledge of {params.technology}"],  # Based on input
                tentative_duration=params.duration if params.duration else "1 week",  # Use input duration or default
                
                
            )
            for suggestion in suggestions
        ]

        # Save to MongoDB with the params for future lookup
        document_to_insert = {
            "params": params.dict(),
            "suggestions": [project.dict(exclude_unset=True) for project in projects_to_save],
            "created_at": datetime.utcnow(),
        }
        await collection.insert_one(document_to_insert)

        return suggestions
    except Exception as e:
        return [{"title": "Error", "description": f"Failed to generate or save suggestions: {str(e)}", "difficulty": "N/A"}]