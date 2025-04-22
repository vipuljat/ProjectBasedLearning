"use client"

export default function RecommendedProjects({ onSelectProject }) {
    // Sample project data
    const projects = [
        {
            id: 1,
            title: "E-commerce Dashboard",
            description: "Build a modern e-commerce admin dashboard with real-time data visualization and user management.",
            difficulty: "beginner",
            duration: "4 weeks",
            technologies: ["React", "Redux", "Tailwind"],
        },
        {
            id: 2,
            title: "Social Media App",
            description: "Create a full-featured social media platform with authentication and personalization.",
            difficulty: "intermediate",
            duration: "6 weeks",
            technologies: ["React", "Node.js", "MongoDB"],
        },
        {
            id: 3,
            title: "AI Image Generator",
            description: "Develop an AI-powered image generator app using machine learning APIs.",
            difficulty: "advanced",
            duration: "8 weeks",
            technologies: ["React", "Python", "TensorFlow"],
        },
    ]

    return (
        <div className="px-4">
            <h2 className="text-xl font-bold mb-4 ">Recommended Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {projects.map((project) => (
                    <div key={project.id} className="bg-[#0f172a] rounded-lg overflow-hidden">
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                            <p className="text-gray-400 text-sm mb-4">{project.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.technologies.map((tech, index) => (
                                    <span key={index} className="text-xs px-2 py-1 rounded bg-[#1a2234] text-gray-300">
                                        {tech}
                                    </span>
                                ))}

                                <span
                                    className={`text-xs px-2 py-1 rounded ml-auto ${project.difficulty === "beginner"
                                            ? "bg-green-900/30 text-green-400"
                                            : project.difficulty === "intermediate"
                                                ? "bg-yellow-900/30 text-yellow-400"
                                                : "bg-red-900/30 text-red-400"
                                        }`}
                                >
                                    {project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1)}
                                </span>
                            </div>

                            <div className="text-xs text-gray-500 mb-4">{project.duration}</div>

                            <button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm"
                                onClick={() => onSelectProject(project)}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-6 mb-6">
                <button className="bg-[#0f172a] hover:bg-[#1a2234] text-gray-300 px-4 py-2 rounded text-sm">More</button>
            </div>
        </div>
    )
}

