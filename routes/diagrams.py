from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from models import DiagramDetails  # your output model
from services import get_diagram_details  # the service function that generates diagrams

router = APIRouter()

# Define the updated input schema (module_title and steps from frontend)

class DiagramRequest(BaseModel):
    project_title: str

@router.post("/diagrams")
async def generate_diagrams(request: DiagramRequest, db=Depends(get_db)):
    """
    Check if diagrams exist for the given project_title in the projectDiagrams collection.
    If present, return them. Otherwise, generate UML, Flowchart, and DFD diagrams using the project_title,
    store them in the database, and return a success acknowledgment.
    """
    try:
        # Step 1: Check if diagrams already exist in projectDiagrams
        diagram_collection = db["projectDiagrams"]
        existing_diagrams = await diagram_collection.find_one({"project_title": request.project_title})

        if existing_diagrams:
            # Return existing diagrams
            return {
                "message": "Diagrams retrieved from database",
                "project_title": request.project_title,
                "diagrams": existing_diagrams["diagrams"]
            }

        # Step 2: Verify the project exists in projectModules
        collection = db["projectModules"]
        project_doc = await collection.find_one({"project_title": request.project_title})

        if not project_doc:
            raise HTTPException(
                status_code=404,
                detail=f"Project with project_title '{request.project_title}' not found"
            )

        # Step 3: Generate diagrams using the project_title
        diagrams = get_diagram_details(project_title=request.project_title)

        # Step 4: Store new diagrams in the database
        await diagram_collection.insert_one({
            "project_title": request.project_title,
            "diagrams": diagrams.dict() if hasattr(diagrams, "dict") else diagrams,  # Convert to dict if Pydantic model
            "stored_at": datetime.utcnow()
        })

        # Step 5: Return a success response with the generated diagrams
        return {
            "message": "Diagrams generated and stored successfully",
            "project_title": request.project_title,
            "diagrams": diagrams.dict() if hasattr(diagrams, "dict") else diagrams
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing diagrams: {str(e)}")

# Optional: GET endpoint to retrieve stored diagrams (unchanged)
@router.get("/diagrams")
async def get_stored_diagrams(request: DiagramRequest, db = Depends(get_db)):
    """
    Retrieve stored diagrams for a given project title provided in the request body.
    """
    try:
        project_title = request.project_title
        if not project_title or project_title.lower() == "undefined":
            raise HTTPException(status_code=400, detail="Invalid or missing project title")
        
        print("Received project_title:", project_title)
        collection = db["projectDiagrams"]
        doc = await collection.find_one({"project_title": project_title})
        if doc:
            return {"project_title": doc["project_title"], "diagrams": doc["diagrams"]}
        raise HTTPException(status_code=404, detail="Diagrams not found for this project")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving diagrams: {str(e)}")