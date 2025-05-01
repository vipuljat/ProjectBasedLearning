from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from datetime import datetime

## Input model for student parameters
class StudentParams(BaseModel):
    skill_level: str
    project_type: str
    technology: str
    duration: Optional[str] = None  # Explicitly optional
    domain: Optional[str] = None
    time_commitment: Optional[str] = None
    
# Define output model
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
    estimated_time: Optional[int] = None

class ProjectResources(BaseModel):
    resources: List[Resource]
    
# New model for the request payload
class ProjectResourceRequest(BaseModel):
    title: str
    overview: str

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
        
class TimeEstimation(BaseModel):
    frontend_hours: int
    backend_hours: int
    api_integration_hours: int
    testing_hours: int
    total_estimated_days: int

class Overview(BaseModel):
    project_title: str
    description: str
    technologies_used: List[str]
    is_industrial_level: bool
    technologies_you_will_learn: List[str]
    prerequisites: List[str]
    estimated_time: TimeEstimation
    modular_division: Dict[str, int]  # e.g., {'Frontend': 20, 'Backend': 30, 'API Integration': 10, 'Testing': 5}
    learning_outcomes: List[str]

class ProjectModule(BaseModel):
    module_id: str
    project_id: str
    module_title: str
    summary: str
    steps: List[str]
    prerequisites: List[str]
    tentative_duration: str

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ModuleStep(BaseModel):
    title: str
    description: str

class Module(BaseModel):
    title: str
    summary: str
    steps: List[ModuleStep]

# Used for the detailed module response (from backend to frontend)
class Task(BaseModel):
    taskId: str  # UUID for traceability
    hour: str
    title: str
    explanation: str
    example: str
    code: str   
    algorithm: str
    resources: List[str]
    estimated_time: str

class Day(BaseModel):
    dayId: str  # UUID for traceability
    day_number: int  # Sequential number for the day
    tasks: List[Task]
    date: datetime

class Step(BaseModel):
    title: str
    explanation: str
    example: str
    code: str
    algorithm: str
    resources: List[str]

class ModuleDetails(BaseModel):
    projectId: str
    moduleId: str
    title: str
    description: str
    steps: List[Step]
    total_weeks: int
    hours_per_day: int
    module_total_hours: int
    stored_at: str
    days: List[dict] = []

# Define the expected response structure
class DiagramDetails(BaseModel):
    title: str
    diagrams: Dict[str, Any]  # UML, Flowchart, DFD etc.