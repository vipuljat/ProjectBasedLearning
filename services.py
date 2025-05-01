from datetime import datetime, timedelta
import uuid
from fastapi import HTTPException
from google import genai
import pydantic_core
from models import DiagramDetails, Module, ProjectModule, ModuleDetails, Overview, ProjectModule, StudentParams, ProjectSuggestion, ProjectDetails, TimeEstimation
from config import GEMINI_API_KEY, GEMINI_MODEL
from typing import List, Dict
import json , re


# Configure the API key
client = genai.Client(api_key=GEMINI_API_KEY)

import json
from typing import List

def generate_project_suggestions(params: StudentParams) -> List[ProjectSuggestion]:
    """Generates project ideas based on student input using AI."""
    
    prompt = (
        f"Suggest exactly 3 innovative and well-defined coding project ideas for a {params.skill_level} developer "
        f"interested in a {params.project_type} project using {params.technology}.\n"
    )
    
    if params.duration:
        prompt += f"The project should be suitable for a {params.duration}-term duration.\n"
    if params.domain:
        prompt += f"Focus on the {params.domain} domain and ensure real-world applicability.\n"
    if params.time_commitment:
        prompt += (
            f"The user has a time commitment of {params.time_commitment}. "
            f"Ensure that each project is scoped to be realistically completed within this daily time commitment. "
            f"For example, if the time commitment is 2 hours/day, the project should be designed with a scope that can be managed within approximately 2 hours of work per day.\n"
        )

    prompt += (
        "Each project should include:\n"
        "1. A **clear and concise title** that reflects the core concept.\n"
        "2. A **detailed yet brief description** (3-5 sentences) explaining the project's objectives, key features, and impact.\n"
        "3. A **difficulty level** categorized as Beginner, Intermediate, or Advanced.\n"
        "Format EXACTLY like this with dashes as separators:\n"
        "- **Title**: [title] - **Description**: [description] - **Difficulty**: [difficulty]\n"
        "Make sure each project is on a single line with these exact separators."
    )

    # Generate content
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )
    
    print("Raw response:", response.text)

    # Parsing AI response into structured data
    projects = [] 
    response_text = response.text.strip() if response.text else ""
    
    # Debugging: Print the full response
    print("Full response for debugging:")
    print(response_text)
    
    # More robust pattern matching approach
    title_pattern = r'\*\*Title\*\*:\s*(.*?)(?=\s*-\s*\*\*Description|$)'
    desc_pattern = r'\*\*Description\*\*:\s*(.*?)(?=\s*-\s*\*\*Difficulty|$)'
    diff_pattern = r'\*\*Difficulty\*\*:\s*(.*?)(?=\s*-\s*\*\*|$)'

    # Find all matches
    titles = re.findall(title_pattern, response_text)
    descriptions = re.findall(desc_pattern, response_text)
    difficulties = re.findall(diff_pattern, response_text)
    
    print(f"Found {len(titles)} titles, {len(descriptions)} descriptions, {len(difficulties)} difficulties")

    # Create projects from matching patterns
    for i in range(min(len(titles), len(descriptions), len(difficulties))):
        projects.append(ProjectSuggestion(
            title=titles[i].strip(), 
            description=descriptions[i].strip(),
            difficulty=difficulties[i].strip()
        ))
    
    # If no valid projects were parsed, return a default suggestion
    if not projects:
        print("No valid projects found, returning default")
        return [ProjectSuggestion(
            title="No suggestions", 
            description="Try again later.",
            difficulty="N/A"
        )]
    
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
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)

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


def get_project_overview(project_title: str) -> Overview:
    """
    Generates a detailed project overview using AI with enhanced error handling.
    """
    prompt = (
    f"Generate a detailed project overview for the project titled '{project_title}'. The overview should include:\n"
    "- A descriptive summary of the project.\n"
    "- Technologies used.\n"
    "- Whether it's an industrial-level project (true/false).\n"
    "- Technologies someone would learn from this project.\n"
    "- Prerequisites needed to work on the project (e.g., concepts, tools, frameworks).\n"
    "- Estimated time (in hours) for frontend, backend, API integration, and testing.\n"
    "- Approximate number of days to complete the project.\n"
    "- Modular time division as a dictionary.\n"
    "- Key learning outcomes from this project (specific skills or concepts gained).\n\n"
    "Respond strictly in this JSON format without any code blocks or explanations:\n"
    "{\n"
    '  "project_title": "",\n'
    '  "description": "",\n'
    '  "technologies_used": [],\n'
    '  "is_industrial_level": true,\n'
    '  "technologies_you_will_learn": [],\n'
    '  "prerequisites": [],\n'
    '  "estimated_time": {\n'
    '    "frontend_hours": 0,\n'
    '    "backend_hours": 0,\n'
    '    "api_integration_hours": 0,\n'
    '    "testing_hours": 0,\n'
    '    "total_estimated_days": 0\n'
    '  },\n'
    '  "modular_division": {\n'
    '    "Frontend": 0,\n'
    '    "Backend": 0,\n'
    '    "API Integration": 0,\n'
    '    "Testing": 0\n'
    '  },\n'
    '  "learning_outcomes": []\n'
    "}"
)


    # Generate content
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    print("Raw AI Response:\n", response.text)

    if not response.text:
        raise ValueError("No response received from Gemini")

    try:
        # Clean up AI response
        json_text = response.text.strip()

        # Remove triple backticks and optional "json" keyword using regex
        json_text = re.sub(r"^```json\s*|```$", "", json_text.strip(), flags=re.IGNORECASE)

        # Fix common JSON issues
        json_text = json_text.replace("'", '"')
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)
        json_text = re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', json_text)

        print("Processed JSON:\n", json_text)

        try:
            overview_data = json.loads(json_text)
        except json.JSONDecodeError as parse_error:
            print(f"Error position: line {parse_error.lineno}, column {parse_error.colno}, char {parse_error.pos}")
            print(f"Error context: '{json_text[max(0, parse_error.pos-20):parse_error.pos+20]}'")

            # Use fallback
            overview_data = {
                "project_title": project_title,
                "description": "An overview could not be generated at this time.",
                "technologies_used": [],
                "estimated_time": {
                    "frontend_hours": 0,
                    "backend_hours": 0,
                    "api_integration_hours": 0,
                    "testing_hours": 0,
                    "total_estimated_days": 0
                },
                "is_industrial_level": False,
                "technologies_you_will_learn": [],
                "modular_division": {
                    "Frontend": 0,
                    "Backend": 0,
                    "API Integration": 0,
                    "Testing": 0
                }
            }
            print("Using fallback data due to parsing error")

        overview = Overview(
            project_title=overview_data.get('project_title', project_title),
            description=overview_data.get('description', 'No description available'),
            technologies_used=overview_data.get('technologies_used', []),
            prerequisites=overview_data.get('prerequisites', []),
            estimated_time=TimeEstimation(
                frontend_hours=overview_data.get('estimated_time', {}).get('frontend_hours', 0),
                backend_hours=overview_data.get('estimated_time', {}).get('backend_hours', 0),
                api_integration_hours=overview_data.get('estimated_time', {}).get('api_integration_hours', 0),
                testing_hours=overview_data.get('estimated_time', {}).get('testing_hours', 0),
                total_estimated_days=overview_data.get('estimated_time', {}).get('total_estimated_days', 0)
            ),
            is_industrial_level=overview_data.get('is_industrial_level', False),
            technologies_you_will_learn=overview_data.get('technologies_you_will_learn', []),
            modular_division={k: int(v) for k, v in overview_data.get('modular_division', {}).items()},
            learning_outcomes=overview_data.get('learning_outcomes', [])
        )
        return overview

    except Exception as e:
        print(f"Exception type: {type(e).__name__}")
        print(f"Exception details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise ValueError(f"Error processing Gemini response: {e}")


def get_project_modules(project_title: str, total_weeks: int, hours_per_day: int, project_id: str) -> List[ProjectModule]:
    """
    Generates a weekly modular breakdown for a project with module_id and project_id mapping.
    """
    prompt = (
        f"You are an AI project planner. Create a detailed weekly modular breakdown for the project titled '{project_title}'.\n"
        f"The project duration is {total_weeks} weeks and the user can dedicate approximately {hours_per_day} hours per day.\n"
        f"Break the project into exactly {total_weeks} weekly modules. Each week should represent a new stage of the project development.\n\n"
        
        f"For each weekly module, provide the following fields in JSON format ONLY:\n"
        f"- module_title: A short and clear title for the week's focus.\n"
        f"- summary: A brief explanation of what will be accomplished in that week.\n"
        f"- steps: A list of action items or learning/building steps to complete during the week.\n"
        f"- prerequisites: A comprehensive list of technologies, tools, or knowledge needed **before** starting that module. For example, if the module is about frontend development, prerequisites should include HTML, CSS, JavaScript, etc.\n"
        f"- tentative_duration: An estimated duration in days to complete that module (e.g., '5 days').\n\n"

        f"Ensure all modules are logically ordered and collectively cover the entire scope of the project. Make sure that each prerequisite list is accurate and includes all necessary tools, skills, or concepts.\n"
        f"Return output as a valid JSON array ONLY. Do not include any markdown, commentary, or formatting. No introductory text. No explanation."
    )

    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)

    if not response.text:
        raise ValueError("No response received from Gemini")

    try:
        json_text = response.text.strip()
        json_text = re.sub(r"^```json\s*|```$", "", json_text, flags=re.IGNORECASE)
        json_text = json_text.replace("'", '"')
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)
        json_text = re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', json_text)

        modules_data = json.loads(json_text)

        validated_modules = []
        for mod in modules_data:
            if isinstance(mod, dict):
                validated_modules.append(
                    ProjectModule(
                        module_id=str(uuid.uuid4()),
                        project_id=project_id,
                        module_title=mod.get("module_title", "Untitled"),
                        summary=mod.get("summary", ""),
                        steps=mod.get("steps", []),
                        prerequisites=mod.get("prerequisites", []),
                        tentative_duration=mod.get("tentative_duration", "")
                    )
                )

        return validated_modules

    except json.JSONDecodeError as parse_error:
        print(f"JSON parse error: {parse_error}")
        raise ValueError("Invalid JSON format from Gemini")

    except Exception as e:
        raise ValueError(f"Failed to parse Gemini response: {str(e)}")
    
    
    

def generate_module_details(
    module: Module,
    total_weeks: int,
    hours_per_day: int,
    projectId: str,
    moduleId: str
) -> ModuleDetails:
    """
    Generates detailed breakdown using full module data, not just the title.
    """

    # Each module is fixed at 1 week (7 days)
    module_days = 7
    module_total_hours = module_days * hours_per_day

    prompt = (
        f"You're an expert educator helping a beginner understand the following module.\n\n"
        f"Title: {module.title}\n"
        f"Summary: {module.summary}\n"
        f"Steps:\n"
    )

    for i, step in enumerate(module.steps, 1):
        prompt += f"{i}. {step.title}: {step.description}\n"

    prompt += (
        f"\nThe student has a total of {total_weeks} weeks and can dedicate {hours_per_day} hours per day across the entire project, "
        f"which includes multiple modules. For this specific module, allocate tasks within a fixed duration of 1 week (7 days), "
        f"with a total available time of {module_total_hours} hours for this module. "
        f"Generate a STRICT JSON response with the following structure. No markdown, no extra text.\n\n"
        '{\n'
        '  "title": "",\n'
        '  "description": "",\n'
        '  "steps": [\n'
        '    {\n'
        '      "title": "",\n'
        '      "explanation": "",\n'
        '      "example": "",\n'
        '      "code": "",\n'
        '      "algorithm": "",\n'
        '      "resources": ["", ""]\n'
        '    }\n'
        '  ]\n'
        '}\n\n'
        "Use double quotes for all property names and string values. The 'code' field should contain the relevant code snippet for the step, if applicable, otherwise an empty string. The 'algorithm' field should describe the algorithm used in the step, if applicable, otherwise empty string."
    )

    # Send to Gemini model
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
    print("Raw AI response:\n", response.text)

    if not response.text:
        raise ValueError("No response from Gemini")

    try:
        json_text = response.text.strip()
        json_text = re.sub(r"^```json\s*|```$", "", json_text, flags=re.IGNORECASE).strip()
        parsed = json.loads(json_text)

        # Ensure the 'description' is always populated
        description = parsed.get("description", module.summary)  # Fallback to module.summary if not found

        # Build the validated data structure
        validated_data = {
            "title": parsed.get("title", module.title),  # Ensure title is always populated
            "description": description,
            "steps": [
                {
                    "title": step.get("title", "Untitled"),
                    "explanation": step.get("explanation", ""),
                    "example": step.get("example", ""),
                    "code": step.get("code", ""),
                    "algorithm": step.get("algorithm", ""),
                    "resources": step.get("resources", [])
                }
                for step in parsed.get("steps", []) if isinstance(step, dict)
            ],
            "projectId": projectId,
            "moduleId": moduleId,
            "total_weeks": total_weeks,
            "hours_per_day": hours_per_day,
            "module_total_hours": module_total_hours,
            "stored_at": datetime.utcnow().isoformat(),
            "days": []  # Remains empty as per current logic
        }

        # Return ModuleDetails instance
        return ModuleDetails(**validated_data)

    except json.JSONDecodeError as err:
        print(f"JSON error: {err}")
        raise ValueError("Invalid JSON from Gemini")



    
def get_project_resources(title: str, overview: str) -> dict:
    """Fetches a list of resources (articles, videos, courses, documentation) for a selected project from multiple platforms (YouTube, blogs, websites, documentation sites) based on the project title and overview."""
    
    prompt = (
        f"Provide a structured JSON response for a project with the following details:\n"
        f"- Title: {title}\n"
        f"- Overview: {overview}\n"
        "- resources: list of dictionaries containing:\n"
        "  - 'type': type of the resource (e.g., 'article', 'video', 'course', 'documentation')\n"
        "  - 'name': Name of the resource\n"
        "  - 'url': A valid, clickable link to the resource (official websites, YouTube tutorials, blogs, or documentation). If the type is 'video', ensure the YouTube URL is valid and the video is accessible.\n"
        "  - 'description': Short description of the resource (1-2 sentences)\n"
        "  - 'estimated_time': Estimated time to read or complete the resource (in minutes). For articles, it could be reading time; for videos/courses, it could be the duration of the video/course.\n"
        "Ensure the resources are sourced from trusted platforms (e.g., YouTube, blogs, official documentation, websites) and are directly relevant to the project title and overview.\n"
        "The YouTube videos should be verified to be working and accessible.\n"
        "Return the response as a **valid JSON object** with no extra text."
    )

    # Generate content
    response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)

    print("Raw AI Response:\n", response.text)  # Debugging

    # Ensure response.text is not None and clean up JSON formatting
    response_text = response.text if response.text else "{}"
    response_text = response_text.strip().strip("```json").strip("```")

    # Parse JSON response
    try:
        resources_data = json.loads(response_text)
        print("Parsed JSON Response:\n", resources_data)  # Debugging
    except json.JSONDecodeError as e:
        print("JSON Parsing Error:", e)
        return {"resources": []}

    # Return the resources data
    return resources_data



def get_diagram_details(project_title: str) -> DiagramDetails:
    """
    Fetches detailed diagram information (UML, Flowchart, DFD) for a given project.
    
    Args:
        project_title (str): The title of the project.
        project_description (str): A short description of the project.
    
    Returns:
        DiagramDetails: An object containing the title, description, and diagram details.
    """

    prompt = (
        f"Create a structured JSON response for the project titled '{project_title}'.\n"
        "The JSON should have these keys:\n"
        "- title: string\n"
        "- description: string (short about the project)\n"
        "- diagrams: dictionary with the following structure:\n"
        "  {\n"
        "    \"UML\": {\n"
        "      \"description\": \"Short description of the UML\",\n"
        "      \"classes\": [\n"
        "        {\"name\": \"EntityName\", \"attributes\": [\"attribute1\", \"attribute2\"], \"methods\": [\"method1\", \"method2\"]}\n"
        "      ],\n"
        "      \"relationships\": [\n"
        "        {\"source\": \"EntityName1\", \"target\": \"EntityName2\", \"type\": \"association\"}\n"
        "      ]\n"
        "    },\n"
        "    \"Flowchart\": {\n"
        "      \"description\": \"Short description of flowchart\",\n"
        "      \"elements\": [\n"
        "        {\"type\": \"start\", \"id\": \"start\", \"text\": \"Start\"},\n"
        "        {\"type\": \"process\", \"id\": \"process1\", \"text\": \"Action\"},\n"
        "        {\"type\": \"end\", \"id\": \"end\", \"text\": \"End\"}\n"
        "      ],\n"
        "      \"connections\": [\n"
        "        {\"source\": \"start\", \"destination\": \"process1\", \"label\": \"Start process\"}\n"
        "      ]\n"
        "    },\n"
        "    \"DFD\": {\n"
        "      \"description\": \"Short description of DFD\",\n"
        "      \"entities\": [\n"
        "        {\"name\": \"User\"},\n"
        "        {\"name\": \"System\"}\n"
        "      ],\n"
        "      \"data_flows\": [\n"
        "        {\"source\": \"User\", \"destination\": \"System\", \"data\": \"Input data\"}\n"
        "      ]\n"
        "    }\n"
        "  }\n\n"
        "Instructions:\n"
        "- Infer logical relationships and connections based on the project description.\n"
        "- For UML, include at least 5 relationships (e.g., association, aggregation, composition, inheritance) with 'type' as 'association', 'aggregation', 'composition', or 'inheritance'.\n"
        "- For UML classes, include both attributes (data fields) and methods (functions) that are relevant to the class's role in the project. Methods should be action-oriented (e.g., 'addToCart', 'placeOrder').\n"
        "- For Flowchart, ensure connections form a complete process flow from start to end.\n"
        "- For DFD, ensure data_flows represent a complete interaction model.\n"
        "- Return strictly in JSON format without any extra explanation."
    )

    # Generate content from model (adjust according to your LLM)
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    print("Raw AI Response:\n", response.text)  # Debugging

    response_text = response.text if response.text else "{}"
    response_text = response_text.strip().strip("```json").strip("```")

    try:
        diagram_data = json.loads(response_text)
        print("Parsed Diagram JSON:\n", diagram_data)  # Debugging
    except json.JSONDecodeError as e:
        print("JSON Parsing Error:", e)
        return DiagramDetails(title=project_title, diagrams={})

    return DiagramDetails(
        title=diagram_data.get("title", project_title),
        diagrams=diagram_data.get("diagrams", {})
    )