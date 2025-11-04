"use client";

import { useState, useEffect } from "react";
import { Bookmark, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useGetDiagramMutation } from "../services/projectApi";

const tagColors = {
    ExternalResources: "bg-[#003f5c] text-[#F2F2F2]",
    Diagrams: "bg-[#2f4b7c] text-[#F2F2F2]",
    Day: "bg-[#0095FF] text-[#F2F2F2]",
};

const getMappedType = (type) => {
    const typeMap = {
        article: "ExternalResources",
        video: "ExternalResources",
        documentation: "ExternalResources",
        course: "ExternalResources",
        diagram: "Diagrams",
    };
    return typeMap[type?.toLowerCase()] || "ExternalResources";
};

const ModuleResourcePage = () => {
    const [activeFilter, setActiveFilter] = useState("Days");
    const [isGeneratingDiagrams, setIsGeneratingDiagrams] = useState(false);
    const filters = ["Days", "External Resources", "Diagrams"];
    const location = useLocation();
    const navigate = useNavigate();
    const { module } = location.state || {};
    const { title } = location.state || {};
    const [getDiagram, { isLoading: isDiagramLoading, error: diagramError }] = useGetDiagramMutation();

    const resources = location.state?.resources?.resources || [];

    // Transform steps into days
    const days = module?.steps
        ? Array.from({ length: 7 }, (_, dayIndex) => {
            const stepIndex = Math.min(dayIndex, module.steps.length - 1);
            const step = module.steps[stepIndex];
            const estimatedTimePerDay = module.module_total_hours / 7;
            return {
                day_number: dayIndex + 1,
                tasks: [
                    {
                        ...step,
                        taskId: `${module.module_id}-task-${dayIndex + 1}`,
                        hour: "09:00",
                        estimated_time: `${estimatedTimePerDay} hours`,
                    },
                ],
            };
        })
        : [];

    // Handle diagram generation
   // In ModuleResourcePage
const handleGenerateDiagrams = async () => {
    if (!project_title) {
        console.error("Project title is missing");
        alert("Project title is missing. Cannot generate diagrams.");
        setIsGeneratingDiagrams(false);
        return;
    }

    setIsGeneratingDiagrams(true);
    try {
        const payload = { project_title };
        console.log("Diagram payload:", payload); // Debugging
        const response = await getDiagram(payload).unwrap();
        console.log("Diagram response:", response);
        const responseProjectTitle = response.project_title;
        if (!responseProjectTitle) {
            throw new Error("Project title missing in response");
        }
        // Navigate to DiagramsPage, passing project_title and diagrams in state
        navigate(`/diagrams`, {
            state: { project_title: responseProjectTitle, diagrams: response.diagrams },
        });
    } catch (err) {
        console.error("Failed to process diagrams:", err);
        alert(`Failed to process diagrams: ${err.data?.detail || err.message || "Unknown error"}`);
    } finally {
        setIsGeneratingDiagrams(false);
    }
};

    // Trigger diagram generation when "Diagrams" filter is selected (optional)
    useEffect(() => {
        if (
            activeFilter === "Diagrams" &&
            resources.filter((res) => getMappedType(res.type) === "Diagrams").length === 0
        ) {
            handleGenerateDiagrams();
        }
    }, [activeFilter]);

    const getFilteredContent = () => {
        if (activeFilter === "Days" && module) {
            return days;
        } else if (activeFilter === "External Resources" || activeFilter === "Diagrams") {
            return resources.filter((res) => {
                const mappedType = getMappedType(res?.type);
                return activeFilter === "External Resources"
                    ? mappedType === "ExternalResources"
                    : mappedType === "Diagrams";
            });
        }
        return [];
    };

    const filteredContent = getFilteredContent();
    const editorPickDay = filteredContent.length > 0 && activeFilter === "Days" ? filteredContent[0] : null;
    const editorPick =
        editorPickDay && editorPickDay.tasks?.length > 0
            ? editorPickDay.tasks[0]
            : filteredContent.length > 0
                ? filteredContent[0]
                : null;

    const cleanExample = (exampleText) => {
        if (!exampleText) return null;
        let cleanedText = exampleText.replace(/\*\*/g, "").trim();
        const lines = cleanedText.split("\n").filter((line) => line.trim().length > 0);
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

    if (!module && resources.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0C111D] to-[#1a1a4a] text-[#F2F2F2] flex flex-col items-center justify-center">
                <h2 className="text-2xl mb-4">No module or resource data available</h2>
                <button
                    onClick={() => window.history.back()}
                    className="bg-[#141824] hover:bg-[#191C27] text-white px-4 py-2 rounded-lg transition-all duration-300"
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
                <div className="text-center mb-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B22CE]/20 rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0095FF]/10 rounded-full filter blur-3xl"></div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 relative z-10">
                        Level Up With the Right Resources!
                    </h1>
                    <p className="text-[#F2F2F2]/80 text-lg max-w-3xl mx-auto relative z-10">
                        Everything you need to succeed — curated daily tasks, external resources, and diagrams tailored to this module.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full transition-all duration-300 ${activeFilter === filter
                                ? "bg-[#141824] text-white shadow-lg shadow-[#191C27]/20"
                                : "bg-[#141824] text-[#F2F2F2] hover:bg-[#191C27]"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {activeFilter === "Diagrams" && (
                    <div className="text-center mb-6">
                        <button
                            onClick={handleGenerateDiagrams}
                            disabled={isGeneratingDiagrams || isDiagramLoading}
                            className={`bg-[#0095FF] hover:bg-[#0095FF]/90 text-[#F2F2F2] font-medium py-2 px-6 rounded-md transition-colors ${isGeneratingDiagrams || isDiagramLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {isGeneratingDiagrams || isDiagramLoading ? "Generating Diagrams..." : "Generate Diagrams"}
                        </button>
                    </div>
                )}

                {activeFilter === "Diagrams" && isDiagramLoading && (
                    <div className="text-center text-[#F2F2F2]/80 text-lg mb-10">
                        Generating diagrams, please wait...
                    </div>
                )}
                {activeFilter === "Diagrams" && diagramError && (
                    <div className="text-center text-red-400 text-lg mb-10">
                        Failed to generate diagrams: {diagramError.data?.detail || "Unknown error"}
                    </div>
                )}

                {filteredContent.length === 0 && activeFilter !== "Diagrams" && (
                    <div className="text-center text-[#F2F2F2]/80 text-lg mb-10">
                        No content available for the selected filter.
                    </div>
                )}

                {filteredContent.length > 0 && editorPick && activeFilter !== "Diagrams" && (
                    <div className="bg-[#141824] rounded-xl overflow-hidden mb-10 shadow-lg border border-[#2D2E34]/30">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-2/5 bg-gradient-to-br from-[#0C111D] to-[#141824] p-6 flex items-center justify-center">
                                <div className="w-full h-full overflow-hidden rounded-lg">
                                    {activeFilter !== "Days" && editorPick.type === "video" && editorPick.url?.includes("youtube.com") ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={editorPick.url.replace("watch?v=", "embed/")}
                                            title={editorPick.title || editorPick.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <img
                                            src="/img1.jpg"
                                            alt="Content illustration"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="md:w-3/5 p-6">
                                <div className="flex items-center mb-3">
                                    <span className="bg-[#141824] text-white text-xs font-semibold px-2.5 py-1 rounded-full mr-2">
                                        Editor's Pick
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold mb-3">
                                    {activeFilter === "Days" ? `Day ${editorPickDay.day_number}: ${editorPick.title}` : editorPick.title || editorPick.name}
                                </h2>
                                <p className="text-[#F2F2F2]/70 mb-4">
                                    {activeFilter === "Days" ? editorPick.explanation : editorPick.description || editorPick.explanation}
                                    {activeFilter === "Days" && ` (Est. ${editorPick.estimated_time})`}
                                </p>
                                {activeFilter === "Days" && editorPick.example && (
                                    <div className="bg-[#0C111D] p-4 rounded-lg mb-4">
                                        <h3 className="text-sm font-semibold text-[#F2F2F2] mb-2">Example</h3>
                                        <ul className="list-disc list-inside text-[#F2F2F2]/70 text-sm">
                                            {cleanExample(editorPick.example)}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div></div>
                                    {activeFilter === "Days" ? (
                                        <Link
                                            to="/moduleDetails"
                                            state={{ module, activeDay: editorPickDay.day_number, activeTask: 0 }}
                                            className="bg-[#141824] hover:bg-[#191C27] text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
                                        >
                                            View Task
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    ) : (
                                        <a
                                            href={editorPick.url || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-[#141824] hover:bg-[#191C27] text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center"
                                        >
                                            View Resource
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredContent.length > 0 &&
                        activeFilter !== "Diagrams" &&
                        (activeFilter === "Days"
                            ? filteredContent
                                .filter((day, index) => index !== 0 || (index === 0 && editorPickDay.tasks.length > 1))
                                .map((day) => {
                                    const tasksToShow = day.day_number === editorPickDay?.day_number
                                        ? day.tasks.slice(1)
                                        : day.tasks;
                                    return tasksToShow.map((task, taskIndex) => (
                                        <div
                                            key={`${day.day_number}-${taskIndex}`}
                                            className="bg-[#141824] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#2D2E34]/30 group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span
                                                    className={`${tagColors[activeFilter === "Days" ? "Day" : getMappedType(task.type)]} inline-block px-2.5 py-1 rounded-full text-xs font-semibold`}
                                                >
                                                    {activeFilter === "Days" ? `Day ${day.day_number}` : getMappedType(task.type)}
                                                </span>
                                                <button className="text-[#F2F2F2]/40 hover:text-[#F2F2F2] transition-colors">
                                                    <Bookmark className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2 group-hover:text-[#F2F2F2] transition-colors">
                                                {task.title}
                                            </h3>
                                            <p className="text-[#F2F2F2]/70 mb-4 text-sm line-clamp-3">
                                                {task.explanation} (Est. {task.estimated_time})
                                            </p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div></div>
                                                <Link
                                                    to="/moduleDetails"
                                                    state={{
                                                        module,
                                                        activeDay: day.day_number,
                                                        activeTask: day.day_number === editorPickDay?.day_number ? taskIndex + 1 : taskIndex,
                                                    }}
                                                    className="bg-[#141824] hover:bg-[#191C27] text-white px-3 py-1 rounded-lg transition-all duration-300 flex items-center"
                                                >
                                                    View Task
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Link>
                                            </div>
                                        </div>
                                    ));
                                })
                            : filteredContent
                                .filter((item, index) => index !== 0)
                                .map((item, index) => (
                                    <div
                                        key={item.name || item.title || index}
                                        className="bg-[#141824] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-[#2D2E34]/30 group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span
                                                className={`${tagColors[activeFilter === "Days" ? "Day" : getMappedType(item.type)]} inline-block px-2.5 py-1 rounded-full text-xs font-semibold`}
                                            >
                                                {getMappedType(item.type)}
                                            </span>
                                            <button className="text-[#F2F2F2]/40 hover:text-[#F2F2F2] transition-colors">
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 group-hover:text-[#F2F2F2] transition-colors">
                                            {item.name || item.title}
                                        </h3>
                                        <p className="text-[#F2F2F2]/70 mb-4 text-sm line-clamp-3">
                                            {item.description || item.explanation}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div></div>
                                            <Link
                                                to="#"
                                                className="bg-[#141824] hover:bg-[#191C27] text-white px-3 py-1 rounded-lg transition-all duration-300 flex items-center"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    window.open(item.url || "#", "_blank");
                                                }}
                                            >
                                                View Resource
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </div>
                                    </div>
                                )))}
                </div>
            </div>
        </div>
    );
};

export default ModuleResourcePage;