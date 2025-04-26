"use client"

import { useState } from "react"
import { Clock, Bookmark, ExternalLink, ArrowRight } from "lucide-react"
import Header from "../components/Header"
import { useLocation } from "react-router-dom"

const tagColors = {
    Documentation: "bg-[#003f5c] text-[#F2F2F2]",
    Video: "bg-[#2f4b7c] text-[#F2F2F2]",
    Blog: "bg-[#665191] text-[#F2F2F2]",
    Course: "bg-[#a05195] text-[#F2F2F2]",
    Tool: "bg-[#d45087] text-[#F2F2F2]",
    Step: "bg-[#0095FF] text-[#F2F2F2]",
}

const ResourcesPage = () => {
    const [activeFilter, setActiveFilter] = useState("Steps")
    const filters = ["Steps", "Documentation", "Videos", "Blogs", "Tools", "Courses"]

    const location = useLocation();
    const { module } = location.state || {};

    // Get content based on active filter
    const getFilteredContent = () => {
        if (activeFilter === "Steps" && module) {
            return module.steps || [];
        }
        return []; // Mock resources removed; handle other filters as needed with actual data
    }

    const filteredContent = getFilteredContent();

    // Find editor's pick if any
    const editorPick = filteredContent.find((item) => item.isEditorsPick);

    // Function to clean and format the example text
    const cleanExample = (exampleText) => {
        if (!exampleText) return null;
        let cleanedText = exampleText.replace(/\*\*/g, "").trim();
        const lines = cleanedText.split("\n").filter(line => line.trim().length > 0);
        const items = [];

        lines.forEach((line, index) => {
            const cleanedLine = line.replace(/^\d+\.\s*/, "").trim();
            if (cleanedLine.startsWith("-")) {
                items.push(<li key={`sub-${index}`} className="ml-4">{cleanedLine.replace("-", "").trim()}</li>);
            } else if (cleanedLine) {
                items.push(<li key={index}>{cleanedLine}</li>);
            }
        });

        return items.length > 0 ? items : null;
    };

    if (!module) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0C111D] to-[#1a1a4a] text-[#F2F2F2] flex flex-col items-center justify-center">
                <h2 className="text-2xl mb-4">No module data available</h2>
                <button
                    onClick={() => window.history.back()}
                    className="bg-[#0095FF] hover:bg-[#0095FF]/90 text-white px-4 py-2 rounded-lg transition-all duration-300"
                >
                    Back to Modules
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0C111D] to-[#1a1a4a] text-[#F2F2F2] w-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Hero Section */}
                <div className="text-center mb-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B22CE]/20 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0095FF]/10 rounded-full filter blur-3xl"></div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">Level Up With the Right Resources!</h1>
                    <p className="text-[#F2F2F2]/80 text-lg max-w-3xl mx-auto relative z-10">
                        Everything you need to succeed — curated documentation, video tutorials, and blogs tailored to this project.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${
                                activeFilter === filter
                                    ? "bg-[#0095FF] text-white shadow-lg shadow-[#0095FF]/20"
                                    : "bg-[#141824] text-[#F2F2F2] hover:bg-[#191C27]"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Editor's Pick */}
                {editorPick && (
                    <div className="bg-[#141824] rounded-xl overflow-hidden mb-10 shadow-lg border border-[#2D2E34]/30">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-2/5 bg-gradient-to-br from-[#0C111D] to-[#141824] p-6 flex items-center justify-center">
                                <div className="w-full h-full overflow-hidden rounded-lg">
                                    <img
                                        src="/placeholder.svg?height=300&width=400" // No image in API, using placeholder
                                        alt={activeFilter === "Steps" ? "Step illustration" : "Resource illustration"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="md:w-3/5 p-6">
                                <div className="flex items-center mb-3">
                                    <span className="bg-[#0095FF] text-white text-xs font-semibold px-2.5 py-1 rounded-full mr-2">
                                        Editor's Pick
                                    </span>
                                    <span
                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            activeFilter === "Steps" ? tagColors.Step : tagColors[editorPick.type]
                                        }`}
                                    >
                                        {activeFilter === "Steps" ? "Step" : editorPick.type}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3">{editorPick.title}</h2>
                                <p className="text-[#F2F2F2]/70 mb-4">{editorPick.explanation || editorPick.description}</p>

                                <div className="bg-[#0C111D] p-4 rounded-lg mb-4">
                                    <h3 className="text-sm font-semibold text-[#0095FF] mb-2">Why this is useful</h3>
                                    <p className="text-[#F2F2F2]/70 text-sm">No usefulness provided</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-[#F2F2F2]/60 text-sm">
                                        {activeFilter === "Steps" ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-1" />
                                                N/A
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-4 h-4 mr-1" />
                                                {editorPick.duration}
                                            </>
                                        )}
                                    </div>
                                    <button className="bg-[#0095FF] hover:bg-[#0095FF]/90 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center">
                                        {activeFilter === "Steps" ? "View Step" : "Start Learning"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent
                        .filter((item) => !item.isEditorsPick)
                        .map((item) => (
                            <div
                                key={item.title}
                                className="bg-[#141824] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#2D2E34]/30 group"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span
                                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            activeFilter === "Steps" ? tagColors.Step : tagColors[item.type]
                                        }`}
                                    >
                                        {activeFilter === "Steps" ? "Step" : item.type}
                                    </span>
                                    <button className="text-[#F2F2F2]/40 hover:text-[#0095FF] transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                </div>

                                <h3 className="text-xl font-semibold mb-2 group-hover:text-[#0095FF] transition-colors">{item.title}</h3>
                                <p className="text-[#F2F2F2]/70 mb-4 text-sm line-clamp-3">{item.explanation || item.description}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center text-[#F2F2F2]/60 text-xs">
                                        {activeFilter === "Steps" ? (
                                            <>
                                                <Clock className="w-4 h-4 mr-1" />
                                                N/A
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-4 h-4 mr-1" />
                                                {item.duration}
                                            </>
                                        )}
                                    </div>
                                    <a
                                        href={item.resources && item.resources.length > 0 ? item.resources[0] : "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0095FF] hover:text-[#0095FF]/80 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {item.resources && item.resources.length > 0 && ` (${item.resources.length})`}
                                    </a>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    )
}

export default ResourcesPage