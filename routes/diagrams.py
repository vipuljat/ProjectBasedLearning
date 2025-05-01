from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db
from models import DiagramDetails  # your output model
from services import get_diagram_details  # the service function that generates diagrams

router = APIRouter()

# Define the updated input schema (module_title and steps from frontend)
class DiagramRequest(BaseModel):
    module_title: str
    steps: list

@router.post("/diagrams")
async def generate_diagrams(request: DiagramRequest, db=Depends(get_db)):
    """
    Generate UML, Flowchart, and DFD diagrams based on the project title fetched from the projectModules collection
    using module_title and steps, and store them in the database for future use. Returns a success acknowledgment.
    """
    try:
        # Step 1: Fetch the project from the projectModules collection
        collection = db["projectModules"]
        project_doc = await collection.find_one({
            "modules": {
                "$elemMatch": {
                    "module_title": request.module_title,
                    "steps": {"$elemMatch": {"title": {"$in": [step.get("title") for step in request.steps]}}}
                }
            }
        })
        
        if not project_doc:
            raise HTTPException(status_code=404, detail=f"Project with module_title '{request.module_title}' and matching steps not found")

        # Step 2: Extract the project_title from the project document
        project_title = project_doc.get("project_title")
        if not project_title:
            raise HTTPException(status_code=400, detail="Project title not found in project document")

        # Step 3: Generate diagrams using the project_title
        diagrams = get_diagram_details(project_title=project_title)

        # Step 4: Store diagrams in the database
        diagram_collection = db["projectDiagrams"]
        await diagram_collection.insert_one({
            "project_title": project_title,
            "diagrams": diagrams.dict() if hasattr(diagrams, "dict") else diagrams,  # Convert to dict if Pydantic model
            "stored_at": datetime.utcnow()
        })

        # Step 5: Return a success response (no diagrams data)
        return {"message": "Diagrams generated and stored successfully", "project_title": project_title}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating or storing diagrams: {str(e)}")

# Optional: GET endpoint to retrieve stored diagrams (unchanged)
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