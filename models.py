from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union

## Input model for student parameters
class StudentParams(BaseModel):
    experience: str
    project_type: str
    technology: str
    duration: Optional[str] = None
    domain: Optional[str] = None

# Output model for project suggestions
class ProjectSuggestion(BaseModel):
    title: str
    description: str
    difficulty: str

# Models for roadmap steps
class RoadmapStep(BaseModel):
    step: Optional[int] = None
    description: str

    @classmethod
    def validate_step(cls, v):
        if isinstance(v, str):
            return {"description": v}
        return v

# Models for diagrams
class UMLDiagram(BaseModel):
    classes: List[Dict[str, Any]]
    relationships: List[Dict[str, Any]]

class FlowchartDiagram(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

class DFDDiagram(BaseModel):
    entities: List[str]
    processes: List[Dict[str, Any]]
    data_stores: Optional[List[str]] = None
    data_flows: List[Dict[str, Any]]

# Resource model to handle resources separately
class Resource(BaseModel):
    type: str  # e.g., 'article', 'video', 'course', 'documentation'
    name: str
    url: str
    description: Optional[str] = None

# Output model for project details
class ProjectDetails(BaseModel):
    title: str
    roadmap: List[Union[RoadmapStep, str]]  # Accepts both structured steps and strings
    tech_stack: Dict[str, List[str]]  # Technologies, Frameworks, Databases
    diagrams: Dict[str, Any]  # Allow nested structures
    resources: List[Resource]  # Separate entity for resources

    class Config:
        arbitrary_types_allowed = True
        extra = "ignore"