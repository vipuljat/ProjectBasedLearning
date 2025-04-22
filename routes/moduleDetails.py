from fastapi import APIRouter
from services import generate_module_details
from models import Module, ModuleDetails  # new Module model added

router = APIRouter()

@router.post("/moduleDetails", response_model=ModuleDetails)
def get_module_details(module: Module) -> ModuleDetails:
    return generate_module_details(module)
