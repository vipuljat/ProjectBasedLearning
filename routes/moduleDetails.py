from fastapi import APIRouter, HTTPException, Depends
from models import Module, ModuleDetails
from services import generate_module_details
from database import get_db
from datetime import datetime

router = APIRouter()

@router.post("/moduleDetails", response_model=ModuleDetails)
async def get_module_details(module: Module, db=Depends(get_db)):
    try:
        collection = db["moduleDetails"]

        # Check if module details already exist
        existing = await collection.find_one({
            "title": module.title,
            "summary": module.summary
        })
        if existing:
            return existing["details"]

        # Generate new module details
        details = generate_module_details(module)

        # Save the generated details to DB
        await collection.insert_one({
            "title": module.title,
            "summary": module.summary,
            "details": details.dict(),
            "stored_at": datetime.utcnow()
        })

        return details

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
