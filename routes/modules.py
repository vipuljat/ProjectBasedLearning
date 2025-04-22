from fastapi import APIRouter, HTTPException
from typing import List
from services import get_project_modules
from pydantic import BaseModel

router = APIRouter()

@router.get("/modules/{project_title}")
def fetch_project_modules(project_title: str):
    try:
        modules = get_project_modules(project_title)  # Assume this returns a List[ProjectModule]
        
        # Check if the modules list contains an error field or any invalid data
        if isinstance(modules, list):
            for module in modules:
                if hasattr(module, "error"):  # Check if 'error' exists in the module
                    raise HTTPException(status_code=500, detail=module)

        return modules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
