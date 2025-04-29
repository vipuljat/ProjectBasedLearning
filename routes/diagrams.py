from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from models import DiagramDetails  # your output model
from services import get_diagram_details  # the service function that generates diagrams

router = APIRouter()

# Define the input schema
class DiagramRequest(BaseModel):
    project_title: str
    project_description: str

@router.post("/diagrams")
async def generate_diagrams(request: DiagramRequest, db=Depends(get_db)):
    """
    Generate UML, Flowchart, and DFD diagrams based on the provided project title and description,
    and store them in the database for future use. Returns a success acknowledgment.
    """
    try:
        # Generate diagrams using Gemini API
        diagrams = get_diagram_details(
            project_title=request.project_title,
            project_description=request.project_description
        )

        # Store diagrams in the database
        collection = db["projectDiagrams"]
        await collection.insert_one({
            "project_title": request.project_title,
            "diagrams": diagrams.dict() if hasattr(diagrams, "dict") else diagrams,  # Convert to dict if Pydantic model
            "stored_at": datetime.utcnow()
        })

        # Return a success response (no diagrams data)
        return {"message": "Diagrams generated and stored successfully", "project_title": request.project_title}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating or storing diagrams: {str(e)}")

# Optional: Future GET endpoint to retrieve stored diagrams
@router.get("/diagrams/{project_title}")
async def get_stored_diagrams(project_title: str, db=Depends(get_db)):
    """
    Retrieve stored diagrams for a given project title.
    """
    try:
        collection = db["projectDiagrams"]
        doc = await collection.find_one({"project_title": project_title})
        if doc:
            return {"project_title": doc["project_title"], "diagrams": doc["diagrams"]}
        raise HTTPException(status_code=404, detail="Diagrams not found for this project")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
