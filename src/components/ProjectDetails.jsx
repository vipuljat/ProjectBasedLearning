"use client"

import { ArrowLeft, CheckCircle } from "lucide-react"

export default function ProjectDetails({ project, onBack }) {
    // Sample project details data
    const projectDetails = {
        title: project.title,
        prerequisites: [
            "Basic JavaScript knowledge",
            "Understanding of React fundamentals",
            "Familiarity with HTML/CSS",
            "Basic terminal usage",
        ],
        resources: [
            { name: "Complete React documentation", url: "https://reactjs.org/docs" },
            { name: "Web development tutorials", url: "https://developer.mozilla.org" },
            { name: "GitHub repository access", url: "https://github.com" },
            { name: "Community support", url: "https://stackoverflow.com" },
        ],
        learningPath: [
            "Project Setup & Configuration",
            "E-commerce Development",
            "State Management",
            "API Integration",
            "Testing & Deployment",
        ],
        skills: [
            { name: "React.js", level: "Novice" },
            { name: "REST APIs", level: "Skilled" },
            { name: "UI/UX Design", level: "Expert" },
            { name: "Testing", level: "Intermediate" },
        ],
    }

    return (
        <div>
            <button className="flex items-center text-gray-400 hover:text-white mb-6" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </button>

            <h1 className="text-2xl font-bold mb-6">{projectDetails.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="col-span-2">
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Prerequisites</h2>
                        <ul className="space-y-2">
                            {projectDetails.prerequisites.map((prereq, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">{prereq}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Resources</h2>
                        <ul className="space-y-2">
                            {projectDetails.resources.map((resource, index) => (
                                <li key={index}>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 flex items-center"
                                    >
                                        <span className="mr-2 text-blue-500">•</span>
                                        {resource.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div>
                    <div className="bg-[#0f172a] p-6 rounded-lg border border-gray-800 mb-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">
                                ?
                            </span>
                            Learning Path
                        </h2>
                        <ul className="space-y-4">
                            {projectDetails.learningPath.map((step, index) => (
                                <li key={index} className="flex">
                                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-3 text-sm flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-gray-300">{step}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm mt-6">
                            Start Learning
                        </button>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Skills You'll Gain</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {projectDetails.skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className="bg-[#0f172a] p-3 rounded border border-gray-800 flex justify-between items-center"
                                >
                                    <span className="text-gray-300">{skill.name}</span>
                                    <span className="text-xs px-2 py-1 bg-[#1a2234] text-gray-300 rounded">{skill.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

