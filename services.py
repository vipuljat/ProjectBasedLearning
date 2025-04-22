from google import genai
from models import Module, ModuleDetails, Overview, ProjectModule, StudentParams, ProjectSuggestion, ProjectDetails, TimeEstimation
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
        f"interested in a {params.project_type} project using {params.technology}."
    )
    
    if params.duration:
        prompt += f" The project should be suitable for a {params.duration}-term duration."
    if params.domain:
        prompt += f" Focus on the {params.domain} domain and ensure real-world applicability."
    
    prompt += (
        " Each project should include: "
        "1. A **clear and concise title** that reflects the core concept. "
        "2. A **detailed yet brief description** (3-5 sentences) explaining the project's objectives, key features, and impact. "
        "3. A **difficulty level** categorized as Beginner, Intermediate, or Advanced. "
        "Format EXACTLY like this with dashes as separators: "
        "- **Title**: [title] - **Description**: [description] - **Difficulty**: [difficulty]"
        " Make sure each project is on a single line with these exact separators."
    )

    # Generate content
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    
    print("Raw response:", response.text)

    # Parsing AI response into structured data
    projects = [] 
    response_text = response.text.strip() if response.text else ""
    
    # Let's see the actual format by printing the full response for debugging
    print("Full response for debugging:")
    print(response_text)
    
    # More robust pattern matching approach
    import re
    
    # Look for title, description, and difficulty patterns throughout the text
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
    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
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


def get_project_modules(project_title: str) -> List[ProjectModule]:
    """
    Generates modular breakdown of a project (setup, UI, API, integration, etc.) in strict JSON format.
    """
    prompt = (
        f"Create a detailed step-by-step modular breakdown for the project titled '{project_title}'. "
        f"Divide the project into weekly modules. Each module should have:\n"
        "- A title (e.g., 'Initial Setup', 'UI Design', etc.)\n"
        "- A brief summary\n"
        "- A list of steps (like 'Install VS Code', 'Set up React project', etc.)\n"
        "- A list of prerequisites (e.g., 'Basic HTML knowledge', 'Node.js installed', etc.)\n"
        "- A tentative duration (e.g., '1 week', '2-3 days', etc.)\n\n"
        "Respond in EXACTLY this JSON format without any explanation or code block:\n"
        '[\n'
        '  {\n'
        '    "module_title": "",\n'
        '    "summary": "",\n'
        '    "steps": ["", "", ""],\n'
        '    "prerequisites": ["", "", ""],\n'
        '    "tentative_duration": ""\n'
        '  }\n'
        ']'
    )

    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    print("Raw AI response:\n", response.text)

    if not response.text:
        raise ValueError("No response received from Gemini")

    try:
        # Clean the response string
        json_text = response.text.strip()
        json_text = re.sub(r"^```json\s*|```$", "", json_text.strip(), flags=re.IGNORECASE)
        json_text = json_text.replace("'", '"')
        json_text = re.sub(r",\s*}", "}", json_text)
        json_text = re.sub(r",\s*]", "]", json_text)

        # If needed: fix keys not in quotes (Gemini sometimes returns that)
        json_text = re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', json_text)

        print("Processed JSON:\n", json_text)

        modules_data = json.loads(json_text)

        # Optional: validate format
        validated_modules = [
            ProjectModule(
                module_title=mod.get("module_title", "Untitled"),
                summary=mod.get("summary", ""),
                steps=mod.get("steps", []),
                prerequisites=mod.get("prerequisites", []),
                tentative_duration=mod.get("tentative_duration", "")
            )
            for mod in modules_data if isinstance(mod, dict)
        ]

        return validated_modules

    except json.JSONDecodeError as parse_error:
        print(f"JSON parse error: {parse_error}")
        print(f"Error location: {json_text[max(0, parse_error.pos-30):parse_error.pos+30]}")
        raise ValueError("Invalid JSON format from Gemini")

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise ValueError(f"Failed to parse Gemini response: {str(e)}")
    
    
    

def generate_module_details(module: Module) -> ModuleDetails:
    """
    Generates detailed breakdown using full module data, not just the title.
    """

    prompt = (
        f"You're an expert educator helping a beginner understand the following module.\n\n"
        f"Title: {module.title}\n"
        f"Summary: {module.summary}\n"
        f"Steps:\n"
    )

    for i, step in enumerate(module.steps, 1):
        prompt += f"{i}. {step.title}: {step.description}\n"

    prompt += (
        "\nNow generate a JSON response in the following format. STRICT JSON only, no markdown, no extra text.\n\n"
        '{\n'
        '  "title": "",\n'
        '  "description": "",\n'
        '  "steps": [\n'
        '    {\n'
        '      "title": "",\n'
        '      "explanation": "",\n'
        '      "example": "",\n'
        '      "resources": ["", ""]\n'
        '    }\n'
        '  ]\n'
        '}\n\n'
        "All string values must have escaped quotes. No markdown, only strict JSON."
    )

    # Send to Gemini model
    response = client.models.generate_content(model="gemini-2.0-flash", contents=prompt)
    print("Raw AI response:\n", response.text)

    if not response.text:
        raise ValueError("No response from Gemini")

    try:
        json_text = response.text.strip()
        json_text = re.sub(r"^```json\s*|```$", "", json_text, flags=re.IGNORECASE).strip()
        parsed = json.loads(json_text)

        validated_data = {
            "title": parsed.get("title", module.title),
            "description": parsed.get("description", module.summary),
            "steps": [
                {
                    "title": step.get("title", "Untitled"),
                    "explanation": step.get("explanation", ""),
                    "example": step.get("example", ""),
                    "resources": step.get("resources", [])
                }
                for step in parsed.get("steps", []) if isinstance(step, dict)
            ]
        }

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
        "  - 'url': Clickable link to the resource (official websites, YouTube tutorials, blogs, or documentation)\n"
        "  - 'description': Short description of the resource (1-2 sentences)\n"
        "Ensure the resources are sourced from diverse platforms (e.g., YouTube, blogs, official documentation, websites) and are relevant to the project title and overview.\n"
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
        resources_data = json.loads(response_text)
        print("Parsed JSON Response:\n", resources_data)  # Debugging
    except json.JSONDecodeError as e:
        print("JSON Parsing Error:", e)
        return {"resources": []}

    # Return the resources data
    return resources_data