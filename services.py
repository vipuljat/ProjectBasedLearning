from google import genai
from models import StudentParams, ProjectSuggestion, ProjectDetails
from config import GEMINI_API_KEY, GEMINI_MODEL
from typing import List, Dict
import json
import requests


# Configure the API key
client = genai.Client(api_key=GEMINI_API_KEY)

def generate_project_suggestions(params: StudentParams) -> List[ProjectSuggestion]:
    """Generates project ideas based on student input using AI."""
    
    prompt = (
        f"Suggest 3 coding project ideas for a {params.experience} developer "
        f"interested in a {params.project_type} project using {params.technology}."
    )
    
    if params.duration:
        prompt += f" The project should be {params.duration}-term."
    if params.domain:
        prompt += f" Focus on the {params.domain} domain."
    
    prompt += (
        " Provide a title, a short description, and a difficulty level (beginner, intermediate, advanced). "
        "Return the response in a structured format like: "
        "1. **Title**: [title] - **Description**: [description] - **Difficulty**: [difficulty]"
    )


    # Generate content
    response = client.models.generate_content(
    model="gemini-2.0-flash", contents= prompt
)

    # Parsing AI response into structured data
    projects = [] 
    response_text = response.text.strip() if response.text else ""
    lines = response_text.split("\n")
    for line in lines:
        if line.strip().startswith(("1.", "2.", "3.")):
            try:
                parts = line.split(" - ")
                title = parts[0].split("**Title**: ")[1].strip()
                description = parts[1].split("**Description**: ")[1].strip()
                difficulty = parts[2].split("**Difficulty**: ")[1].strip()
                projects.append(ProjectSuggestion(title=title, description=description, difficulty=difficulty))
            except IndexError:
                continue  # Skip malformed lines

    return projects
def get_project_details(project_title: str) -> ProjectDetails:
    """Fetches detailed information about a selected project, including roadmap, tech stack, clickable resource links, and all available resources (articles, courses, videos, documentation)."""
    
    prompt = (
        f"Provide a structured JSON response for the {project_title} project with the following keys:\n"
        "- title: string\n"
        "- roadmap: list of step-by-step actions \n"
        "- tech_stack: dictionary with Languages, Frameworks, Databases\n"
        "- diagrams: dictionary with UML, Flowchart, DFD, strictly following this format:\n"
        "  {\n"
        "    \"diagrams\": {\n"
        "      \"UML\": {\n"
        "        \"description\": \"Placeholder for UML diagrams related to the project.\",\n"
        "        \"classes\": [\n"
        "          {\n"
        "            \"name\": \"User\",\n"
        "            \"attributes\": [\"userId\", \"username\", \"password\", \"email\"]\n"
        "          },\n"
        "          {\n"
        "            \"name\": \"Product\",\n"
        "            \"attributes\": [\"productId\", \"name\", \"description\", \"price\"]\n"
        "          }\n"
        "        ]\n"
        "      },\n"
        "      \"Flowchart\": {\n"
        "        \"description\": \"Placeholder for Flowchart diagrams\",\n"
        "        \"elements\": [\n"
        "          {\n"
        "            \"type\": \"start\",\n"
        "            \"id\": \"start\",\n"
        "            \"text\": \"Start\"\n"
        "          },\n"
        "          {\n"
        "            \"type\": \"process\",\n"
        "            \"id\": \"login\",\n"
        "            \"text\": \"User Login\"\n"
        "          }\n"
        "        ]\n"
        "      },\n"
        "      \"DFD\": {\n"
        "        \"description\": \"Placeholder for Data Flow Diagrams\",\n"
        "        \"entities\": [\n"
        "          {\"name\": \"Customer\"},\n"
        "          {\"name\": \"System\"}\n"
        "        ],\n"
        "        \"data_flows\": [\n"
        "          {\n"
        "            \"source\": \"Customer\",\n"
        "            \"destination\": \"System\",\n"
        "            \"data\": \"Order Request\"\n"
        "          }\n"
        "        ]\n"
        "      }\n"
        "    }\n"
        "  }\n"
        "Ensure the generated diagrams key strictly follows this format, adapting class names, attributes, elements, and data flows based on the project context.\n"
        "- resources: list of dictionaries containing:\n"
        "  - 'type': type of the resource (e.g., 'article', 'video', 'course', 'documentation')\n"
        "  - 'name': Name of the resource\n"
        "  - 'url': Clickable link to the resource (official websites, tutorials, or best resources available)\n"
        "  - 'description': Short description of the resource\n"
        "Return the response as a **valid JSON object** with no extra text."
    )

    # Generate content
    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)

    print("Raw AI Response:\n", response.text)  # Debugging

    # Ensure response.text is not None and clean up JSON formatting
    response_text = response.text if response.text else "{}"
    response_text = response_text.strip().strip("```json").strip("```")

    # Parse JSON response
    try:
        project_data = json.loads(response_text)
        print("Parsed JSON Response:\n", project_data)  # Debugging
    except json.JSONDecodeError as e:
        print("JSON Parsing Error:", e)
        return ProjectDetails(title=project_title, roadmap=[], tech_stack={}, diagrams={}, resources=[])

    # Process project details with all resources
    return ProjectDetails(
        title=project_data.get("title", project_title),
        roadmap=project_data.get("roadmap", []),
        tech_stack=project_data.get("tech_stack", {}),
        diagrams=project_data.get("diagrams", {}),
        resources=project_data.get("resources", [])
    )
