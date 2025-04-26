"use client";

import { useState, useEffect } from "react";
import { Search, Bookmark, ExternalLink, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";

const tagColors = {
    Documentation: "bg-[#003f5c]",
    Video: "bg-[#2f4b7c]",
    Blog: "bg-[#665191]",
    Course: "bg-[#a05195]",
    Tool: "bg-[#d45087]",
};

const ResourcesPage = () => {
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);
    const filters = ["All", "Documentation", "Video", "Blog", "Tool", "Course"];
    const location = useLocation();
    const resources = location.state?.resources?.resources || [];
    console.log("res", resources);

    // Filter resources based on active filter and search query
    const filteredResources = resources
        .filter((res) => activeFilter === "All" || res.type === activeFilter)
        .filter(
            (res) =>
                searchQuery === "" ||
                res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const editorPick = resources.find((res) => res.name === "Building Scalable Applications") || null;

    // Animation on load
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <div className="bg-[#0C111D] text-[#F2F2F2] min-h-screen min-w-screen">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div
                    className={`text-center mb-12 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#F2F2F2] to-[#0095FF] bg-clip-text text-transparent">
                        Level Up With the Right Resources!
                    </h1>
                    <p className="text-[#F2F2F2] mt-4 text-lg max-w-3xl mx-auto opacity-80">
                        Everything you need to succeed — curated documentation, video tutorials, and blogs tailored to this project.
                    </p>
                </div>

                {/* Search and Filters */}
                <div
                    className={`mb-10 transition-all duration-700 delay-100 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                >
                    <div className="relative max-w-md mx-auto mb-8">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#0095FF]" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-[#2D2E34] rounded-lg bg-[#141824] text-[#F2F2F2] focus:ring-[#0095FF] focus:border-[#0095FF] focus:outline-none transition-all"
                            placeholder="Search resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-full transition-all duration-300 ${activeFilter === filter
                                    ? filter === "All"
                                        ? "bg-[#0095FF] text-white shadow-lg shadow-[#0095FF]/20"
                                        : `${tagColors[filter]} text-white shadow-lg shadow-${tagColors[filter]}/20`
                                    : "bg-[#141824] text-[#F2F2F2] hover:bg-[#191C27]"}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Editor's Pick */}
                {editorPick && (
                    <div
                        className={`relative overflow-hidden bg-gradient-to-br from-[#141824] to-[#191C27] p-8 rounded-2xl mb-12 shadow-xl border border-[#2D2E34]/30 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B22CE]/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0095FF]/20 mr-3">
                                        <Bookmark className="h-5 w-5 text-[#0095FF]" />
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${tagColors[editorPick.type]} text-[#F2F2F2]`}
                                    >
                                        Editor's Pick - {editorPick.type}
                                    </span>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#F2F2F2]">{editorPick.name}</h2>
                                <p className="text-[#F2F2F2]/70 mb-4 text-lg">{editorPick.description}</p>

                                {editorPick.duration && (
                                    <div className="flex items-center text-[#0095FF] mb-6">
                                        <Clock className="h-4 w-4 mr-2" />
                                        <span className="text-sm font-medium">Duration: {editorPick.duration}</span>
                                    </div>
                                )}

                                {editorPick.type === "video" && editorPick.url.includes("youtube.com") ? (
                                    <div className="aspect-w-16 aspect-h-9 mt-4">
                                        <iframe
                                            className="rounded-lg w-full h-full"
                                            src={editorPick.url.replace("watch?v=", "embed/")}
                                            title={editorPick.name}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    <a
                                        href={editorPick.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center px-6 py-3 bg-[#191C27] hover:bg-[#2D2E34] text-[#F2F2F2] rounded-lg font-medium transition-all duration-300 shadow-lg shadow-[#0095FF]/20"
                                    >
                                        View Resource
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                )}
                            </div>

                            <div className="hidden md:block w-64 h-64 bg-gradient-to-br from-[#3B22CE] to-[#0095FF] rounded-2xl opacity-20"></div>
                        </div>
                    </div>
                )}

                {/* Resource Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((res, index) => (
                        <div
                            key={index}
                            className={`bg-[#141824] border border-[#2D2E34]/30 p-6 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                            style={{ transitionDelay: `${300 + index * 50}ms` }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tagColors[res.type] || "bg-[#141824]"} text-[#F2F2F2]`}
                                >
                                    {res.type}
                                </span>
                                {res.estimated_time && (
                                    <div className="flex items-center text-[#F2F2F2]/60 text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {res.estimated_time} min
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-[#F2F2F2]">{res.name}</h3>
                            <p className="text-[#F2F2F2]/70 mb-6 line-clamp-3">{res.description}</p>

                            <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-[#191C27] hover:bg-[#2D2E34] text-[#F2F2F2] rounded-lg text-sm font-medium transition-all duration-300 border border-[#2D2E34]"
                            >
                                View Resource
                                <ExternalLink className="ml-2 h-3 w-3" />
                            </a>
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {filteredResources.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-xl text-[#F2F2F2]/70">No resources found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setActiveFilter("All");
                                setSearchQuery("");
                            }}
                            className="mt-4 px-4 py-2 bg-[#191C27] hover:bg-[#2D2E34] text-[#F2F2F2] rounded-lg text-sm font-medium transition-all duration-300"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourcesPage;
