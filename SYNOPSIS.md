# Project-Based Learning (PBL) Backend — Synopsis

## Introduction

This backend powers a Project-Based Learning (PBL) platform that turns a learner’s preferences into a personalized, end‑to‑end project plan. The system collects the learner’s skill level, technology stack of interest, domain, time commitment, and duration, then uses a Large Language Model (LLM) to generate:
- Three concrete project suggestions with titles, descriptions, and difficulty ratings.
- A full project overview describing technologies, prerequisites, learning outcomes, and time estimates.
- A weekly module plan with prerequisites, steps, and durations.
- Detailed module content suitable for beginners, including explanations, runnable code, algorithms, and curated resources.
- System design aids such as UML, flowcharts, and data flow diagrams (DFD).

The backend is implemented with FastAPI (async I/O), Pydantic models for validation, and MongoDB via Motor for persistence and caching. Caching ensures repeat requests return quickly without re-querying the LLM. All functionality is exposed through clean REST endpoints for consumption by a frontend.

## Literature Review

Project-Based Learning (PBL) emphasizes authentic tasks and artifact creation, which has been shown to improve student motivation, deepen understanding, and support transfer of knowledge to real-world contexts. Foundational work highlights: 
- PBL’s motivational and cognitive benefits through meaningful projects, collaboration, and sustained inquiry (Blumenfeld et al., 1991).
- The role of structured guidance and scaffolding to support learners, especially novices (Hmelo-Silver, 2004).

Instructional design for PBL benefits from modularization, explicit learning outcomes, and formative feedback loops. In technology-enhanced learning, AI can reduce authoring overhead and adapt content to learner goals. LLMs support rapid content generation (e.g., project ideas, step plans, examples) but require:
- Careful prompt design to elicit structured, unambiguous outputs.
- Validation and post-processing to ensure correctness (e.g., JSON parsing, schema checks).
- Pedagogical guardrails (clarity, beginner-friendly language, progressive complexity, reliable resources).

Modern backend practices (FastAPI/Pydantic, async I/O) align with creating scalable, schema-validated APIs. NoSQL stores (MongoDB) provide flexible storage for heterogeneous AI outputs, enabling gradual schema evolution and cost-effective caching.

Representative resources are listed in References.

## Problem Definition

Learners often know what they want to learn but struggle to map their goals to an actionable, time-bounded, skill-appropriate project plan. Educators and content creators face high effort and cost to author personalized roadmaps, beginner-friendly explanations, runnable examples, and curated resources across many technologies.

Key challenges addressed:
- Translating loosely specified learner preferences into credible project ideas and plans.
- Producing structured, beginner-ready content that balances detail with approachability.
- Generating and maintaining system design artifacts (UML, flowcharts, DFD) that support engineering thinking.
- Persisting, retrieving, and reusing generated artifacts reliably to reduce cost/latency.

## Objectives

- Capture learner preferences (skill level, project type, technology, domain, time commitment, duration) and persist them.
- Generate exactly three high-quality project suggestions aligned to the learner’s profile.
- Produce a comprehensive project overview with technologies, prerequisites, estimated effort, modular division, and learning outcomes.
- Create a weekly module plan with explicit prerequisites, steps, and tentative durations.
- Generate module details with clear explanations, runnable code, algorithms (when applicable), and exactly three beginner-friendly resources per step.
- Provide design diagrams (UML, flowchart, DFD) in structured JSON to facilitate visualization.
- Cache outputs in MongoDB for quick retrieval; expose predictable REST endpoints; validate payloads with Pydantic.
- Implement resilient parsing and error handling for LLM outputs to maintain API reliability.

## Methodology

### System Overview
- Framework: FastAPI with async support and CORS enabled for frontend integration.
- Data validation: Pydantic models (`StudentParams`, `ProjectSuggestion`, `Overview`, `ProjectModule`, `Module`, `ModuleDetails`, `DiagramDetails`, `ProjectResources`).
- Persistence: MongoDB via Motor (async). Collections include `UserPreferences`, `projectModules`, `moduleDetails`, `projectDiagrams`, `projectResources`.
- AI: Google Gemini models (client via `google.genai`). Services prompt the model for structured JSON outputs, then parse and validate.

### Core Workflows and Endpoints
1. Preference Capture and Suggestions
   - Endpoint: `POST /suggestProjects`
   - Input: `StudentParams`
   - Actions: Stores/updates `UserPreferences` (default `studentId` = "008"), prompts LLM for exactly three suggestions, returns structured list of `{title, description, difficulty}`.

2. Project Overview
   - Endpoint: `GET /overview/{project_title}`
   - Actions: Prompts LLM for a structured JSON overview including technologies, prerequisites, time estimates (frontend/backend/API/testing and total days), modular division, and learning outcomes. Cleans/parses JSON defensively.

3. Weekly Modules
   - Endpoint: `GET /modules/{project_title}`
   - Inputs: Reads `UserPreferences` to infer `totalWeeks` and `hoursPerDay`.
   - Actions: Generates exactly `totalWeeks` modules with `module_id`, `project_id`, `module_title`, `summary`, `steps`, `prerequisites`, `tentative_duration`. Caches in `projectModules`.

4. Module Details (Beginner‑Friendly)
   - Endpoint: `POST /moduleDetails`
   - Input: `Module` (title, summary, steps). Also infers numeric `total_weeks` and `hours_per_day` from preferences.
   - Actions: Prompts LLM for detailed breakdown with explanations, runnable code, algorithms, and exactly three resources per step; stores in `moduleDetails`. Returns `ModuleDetails` enriched with metadata and timestamps.

5. Design Diagrams
   - Endpoint: `POST /diagrams` and `GET /diagrams`
   - Actions: Generates and/or retrieves structured diagrams (UML, Flowchart, DFD) and caches in `projectDiagrams`.

6. Resource Aggregation
   - Endpoint: `POST /projectResources` — fetches and stores curated resources (articles, videos, courses, docs) per `{title, overview}` in `projectResources`.
   - Endpoint: `GET /moduleDetails/project/{project_id}/resources` — aggregates resource links found within module steps across all modules for a project.

7. Project Listing
   - Endpoint: `GET /projects` — returns all stored project entries with titles and associated modules.

### Data Modeling (Selected)
- `StudentParams`: { skill_level, project_type, technology, domain?, duration?, time_commitment? }
- `ProjectSuggestion`: { title, description, difficulty }
- `Overview`: { project_title, description, technologies_used[], is_industrial_level, technologies_you_will_learn[], prerequisites[], estimated_time{...}, modular_division{...}, learning_outcomes[] }
- `ProjectModule`: { module_id, project_id, module_title, summary, steps[], prerequisites[], tentative_duration }
- `ModuleDetails`: { project_id, module_id, title, description, steps[{title, explanation, example, code, algorithm, resources[]}], total_weeks, hours_per_day, module_total_hours, stored_at, days[] }
- `DiagramDetails`: { title, diagrams: { UML{...}, Flowchart{...}, DFD{...} } }
- `ProjectResources`: { resources: [ { type, name, url, description, estimated_time? } ] }

### Prompting, Parsing, and Validation
- Prompts explicitly demand JSON-only outputs with strict field requirements.
- Defensive parsing cleans common artifacts (e.g., fenced code blocks, single quotes, trailing commas) and coerces keys to valid JSON.
- Pydantic models validate shape and types; services provide fallbacks on parse errors to keep API responses predictable.

### Persistence and Caching Strategy
- Before generating new content, endpoints check corresponding collections for existing entries keyed by project title or `(project_id, module_id)` pairs.
- Generated artifacts include timestamps to support future freshness policies.
- Aggregated resource endpoints traverse stored module details to assemble a project-wide resource list.

### Security and Reliability Considerations
- Environment variables should be used for secrets (API keys, DB URIs). Current code inlines credentials and should be refactored to read from `.env` and `config.py` securely.
- Rate limiting, authentication/authorization, and audit logging are recommended for production.
- LLM outputs should be treated as untrusted input: enforce strict schemas and sanitize/validate URLs before presenting to users.
- DNS and connectivity: ensure the MongoDB SRV record is correct; support a fallback to `mongodb://localhost:27017/` for development.

### Assumptions and Limitations
- The reference implementation targets a single `studentId` ("008") for prototyping; multi-user support requires session/auth integration.
- The quality of AI-generated content depends on model availability and prompt adherence; occasional formatting drift is mitigated but not eliminated.
- Diagram generation provides structured placeholders inferred from titles; further refinement may be needed for complex domains.

### Optional Evaluation (Future Work)
- Learning outcomes alignment checks (rubrics) against generated content.
- Human-in-the-loop editing of modules and automatic revalidation.
- A/B testing different prompt templates for clarity and utility.
- Telemetry on cache hit rates, latency, and cost per successful content generation.

## References
- Blumenfeld, P. C., Soloway, E., Marx, R. W., et al. (1991). Motivating project-based learning: Sustaining the doing, supporting the learning. Educational Psychologist, 26(3–4), 369–398.
- Hmelo-Silver, C. E. (2004). Problem-based learning: What and how do students learn? Educational Psychology Review, 16(3), 235–266.
- FastAPI Documentation — https://fastapi.tiangolo.com/
- Pydantic Documentation — https://docs.pydantic.dev/
- MongoDB Manual — https://www.mongodb.com/docs/
- Motor (Async MongoDB) — https://motor.readthedocs.io/
- Google Gemini API — https://ai.google.dev/
- UNESCO (2023). Guidance on generative AI in education and research — https://unesdoc.unesco.org/

---

Note: For production, move all secrets (e.g., Gemini API key and MongoDB URI) into environment variables (e.g., `.env` + `config.py`) and remove hardcoded values. Validate your MongoDB SRV hostname or use a local MongoDB URI in development.
