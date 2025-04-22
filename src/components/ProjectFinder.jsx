"use client";

import { useState } from "react";
import { CodeIcon, DatabaseIcon, SmartphoneIcon, LayersIcon } from "lucide-react";

export default function ProjectFinder() {
    const [level, setLevel] = useState("beginner");
    const [technology, setTechnology] = useState("React.js");
    const [projectType, setProjectType] = useState("frontend");

    return (
        <div className="mb-20">
            <div className="text-center py-12">
                <h1 className="text-3xl font-bold mb-2">Find Your Perfect Project</h1>
                <p className="text-gray-400 text-sm ">
                    Select your preferences to help suggest the best projects for your learning journey
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                {/* Choose Your Level */}
                <div className="bg-[#0f172a] p-6 rounded-lg">
                    <h3 className="font-medium mb-4">Choose Your Level</h3>
                    <div className="space-y-4">
                        {["beginner", "intermediate", "advanced"].map((lvl) => (
                            <label key={lvl} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    className="form-radio h-4 w-4 text-blue-500 border-gray-600 bg-transparent focus:ring-0 focus:ring-offset-0"
                                    name="level"
                                    value={lvl}
                                    checked={level === lvl}
                                    onChange={() => setLevel(lvl)}
                                />
                                <span className="text-sm capitalize">{lvl}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Select Technology */}
                <div className="bg-[#0f172a] p-6 rounded-lg">
                    <h3 className="font-medium mb-4">Select Technology</h3>
                    <select
                        className="w-full bg-[#0a101f] border border-gray-700 rounded p-2 text-sm appearance-none"
                        value={technology}
                        onChange={(e) => setTechnology(e.target.value)}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.5em 1.5em",
                            paddingRight: "2.5rem",
                        }}
                    >
                        <option value="React.js">React.js</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Node.js">Node.js</option>
                    </select>
                </div>

                {/* Project Type */}
                <div className="bg-[#0f172a] p-6 rounded-lg">
                    <h3 className="font-medium mb-4">Project Type</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { type: "frontend", label: "Frontend", icon: CodeIcon },
                            { type: "backend", label: "Backend", icon: DatabaseIcon },
                            { type: "fullstack", label: "Full Stack", icon: LayersIcon },
                            { type: "mobile", label: "Mobile", icon: SmartphoneIcon },
                        ].map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                className={`flex flex-col h-20 items-center justify-center rounded border ${projectType === type
                                        ? "bg-blue-500 text-white border-transparent"
                                        : "bg-[#0a101f] text-gray-300 border-gray-700 hover:bg-[#1a2234]"
                                    }`}
                                onClick={() => setProjectType(type)}
                            >
                                <Icon className="h-6 w-6 mb-1" />
                                <span className="text-xs">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end px-4 mt-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                    Next
                </button>
            </div>
        </div>
    );
}
