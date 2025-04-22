// src/data/diagramData.js

export const diagramJSON = {
    diagrams: {
        UML: {
            description: "UML class diagram representing the core entities of the Adaptive Learning Path Generator.",
            classes: [
                {
                    name: "User",
                    attributes: [
                        "userId",
                        "username",
                        "password",
                        "email",
                        "learningStyle",
                        "knowledgeLevel"
                    ]
                },
                {
                    name: "LearningResource",
                    attributes: [
                        "resourceId",
                        "title",
                        "description",
                        "contentType",
                        "tags",
                        "difficulty"
                    ]
                },
                {
                    name: "LearningPath",
                    attributes: [
                        "pathId",
                        "userId",
                        "resources",
                        "progress",
                        "completionDate"
                    ]
                },
                {
                    name: "Assessment",
                    attributes: [
                        "assessmentId",
                        "resourceId",
                        "questions",
                        "correctAnswers"
                    ]
                },
                {
                    name: "UserProgress",
                    attributes: [
                        "userId",
                        "resourceId",
                        "progress",
                        "assessmentScore"
                    ]
                }
            ]
        },
        Flowchart: {
            description: "Flowchart diagram illustrating the learning path generation process.",
            elements: [
                { type: "start", id: "start", text: "Start" },
                { type: "process", id: "getUserProfile", text: "Get User Profile (Knowledge, Style, Goals)" },
                { type: "process", id: "filterResources", text: "Filter Relevant Learning Resources" },
                { type: "process", id: "generatePath", text: "Generate Personalized Learning Path" },
                { type: "process", id: "presentPath", text: "Present Learning Path to User" },
                { type: "process", id: "trackProgress", text: "Track User Progress & Adjust Path" },
                { type: "end", id: "end", text: "End" }
            ]
        },
        DFD: {
            description: "Data Flow Diagram representing the data flow between different entities in the Adaptive Learning Path Generator.",
            entities: [
                { name: "User" },
                { name: "System" },
                { name: "Learning Resource Database" },
                { name: "Assessment Database" }
            ],
            data_flows: [
                { source: "User", destination: "System", data: "User Profile Data (Knowledge, Preferences)" },
                { source: "System", destination: "Learning Resource Database", data: "Resource Query" },
                { source: "Learning Resource Database", destination: "System", data: "Learning Resources Metadata" },
                { source: "System", destination: "Assessment Database", data: "Assessment Query" },
                { source: "Assessment Database", destination: "System", data: "Assessment Data" },
                { source: "System", destination: "User", data: "Personalized Learning Path" },
                { source: "User", destination: "System", data: "Progress Data and Feedback" }
            ]
        }
    }
};
