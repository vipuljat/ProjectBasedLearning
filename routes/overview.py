# routers/overview_router.py

from fastapi import APIRouter, HTTPException
from models import Overview
from services import get_project_overview

router = APIRouter()

@router.get("/overview/{project_title}", response_model=Overview)
def fetch_project_overview(project_title: str):
    try:
        
        overview = get_project_overview(project_title)
        return overview
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
