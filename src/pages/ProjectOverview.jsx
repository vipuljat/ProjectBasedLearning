"use client";

import { useState } from "react";
import { Clock, BarChart2, Calendar } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useFetchProjectOverviewQuery, useFetchModulesQuery, useGetResourcesMutation, useGetUserPreferencesQuery } from "../services/projectApi";

export default function ProjectOverview() {
    const { title } = useParams();
    const { data: projectOverview, isLoading: isOverviewLoading, isError: isOverviewError } = useFetchProjectOverviewQuery(title);
    const { data: modulesData, isLoading: isModulesLoading } = useFetchModulesQuery(title);
    const [getResources, { data: resources, isLoading: isResourcesLoading, isError: isResourcesError }] = useGetResourcesMutation();
    const [isStarted, setIsStarted] = useState(false);
    const navigate = useNavigate();

    // Fetch user preferences for studentId "008"
    const { data: userPreferences, isLoading: isPreferencesLoading, isError: isPreferencesError } = useGetUserPreferencesQuery("008");

    const handleStartProject = async () => {
        if (!isStarted && projectOverview?.project_title) {
            setIsStarted(true);
            console.log("Project Started:", projectOverview.project_title);

            const requestBody = {
                title: projectOverview.project_title,
                overview: projectOverview.description || "No overview available",
            };

            try {
                const response = await getResources(requestBody).unwrap(); // Capture the data
                console.log("Resources response:", response);

                // Now pass it directly to the next page
                navigate(`/modules/${projectOverview.project_title}`, { state: { resources: response } });
            } catch (err) {
                console.error("Failed to fetch resources:", err);
                alert("Something went wrong while fetching project modules.");
            }
        }
    };

    if (isOverviewLoading || isModulesLoading || isResourcesLoading || isPreferencesLoading) {
        return (
            <div className="bg-[#0C111D] text-[#F2F2F2] min-h-screen flex justify-center items-center">
                <p>Loading project overview...</p>
            </div>
        );
    }

    if (isOverviewError || isResourcesError || isPreferencesError || !projectOverview || !userPreferences) {
        return (
            <div className="bg-[#0C111D] text-[#F2F2F2] min-h-screen flex justify-center items-center">
                <p>Failed to load project overview or user preferences.</p>
            </div>
        );
    }

    // Use user preferences to override hardcoded values
    const totalWeeks = userPreferences.totalWeeks || Math.ceil(projectOverview.estimated_time.total_estimated_days / 7);
    const hoursPerDay = userPreferences.hoursPerDay || 4; // Default to 4 hours if not available
    const commitmentRange = `${hoursPerDay - 2}-${hoursPerDay + 2} hrs/week`; // Dynamic range based on hoursPerDay
    const difficulty = projectOverview.is_industrial_level ? "Advanced" : "Intermediate"; // Keep this from projectOverview

    return (
        <div>
            <Header />

            <div className="bg-[#0C111D] text-[#F2F2F2] flex flex-col items-center py-12 px-4 w-screen">
                <div className="text-center mb-10 mt-6">
                    <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                        {projectOverview.project_title}
                    </h1>
                </div>

                <div className="w-full max-w-5xl bg-[#141824] rounded-lg overflow-hidden hover:shadow-[0_0_15px_#4AB8FF] focus-within:shadow-[0_0_15px_#4AB8FF] transition-all">
                    <div className="p-6 border-b border-[#2A2F3E]">
                        <h2 className="text-lg font-medium mb-3">Project Overview</h2>
                        <p className="text-[#F2F2F2]/70 text-sm leading-relaxed">{projectOverview.description}</p>

                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className="bg-[#1E293B] text-[#0095FF] text-xs px-3 py-1 rounded-full">Industry Standard</span>
                            <span className="bg-[#1E293B] text-[#F2F2F2]/80 text-xs px-3 py-1 rounded-full">Full Stack</span>
                        </div>
                    </div>

                    <div className="p-6 border-b border-[#2A2F3E]">
                        <h2 className="text-lg font-medium mb-4">Technologies You'll Learn</h2>
                        <div className="flex flex-wrap gap-3">
                            {projectOverview.technologies_you_will_learn.slice(0, 6).map((tech, index) => (
                                <div key={index} className="flex items-center bg-[#1E293B] rounded-full px-3 py-1.5">
                                    <span className="w-2 h-2 bg-[#0095FF] rounded-full mr-2"></span>
                                    <span className="text-sm">{tech}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[#F2F2F2]/70 text-sm mt-4">
                            Master modern full-stack development while implementing real-world AI features
                        </p>
                    </div>

                    <div className="p-6 border-b border-[#2A2F3E]">
                        <h2 className="text-lg font-medium mb-4">Prerequisites</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {projectOverview.prerequisites.map((prerequisite, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="w-4 h-4 rounded-full border border-[#0095FF] flex items-center justify-center mr-2">
                                        <div className="w-2 h-2 bg-[#0095FF] rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-[#F2F2F2]/80">{prerequisite}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 border-b border-[#2A2F3E]">
                        <h2 className="text-lg font-medium mb-4">Project Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-[#1E293B] flex items-center justify-center mr-3">
                                    <Clock className="w-4 h-4 text-[#0095FF]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#F2F2F2]/60">Duration</div>
                                    <div className="text-sm">{totalWeeks}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-[#1E293B] flex items-center justify-center mr-3">
                                    <BarChart2 className="w-4 h-4 text-[#0095FF]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#F2F2F2]/60">Difficulty</div>
                                    <div className="text-sm">{difficulty}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-md bg-[#1E293B] flex items-center justify-center mr-3">
                                    <Calendar className="w-4 h-4 text-[#0095FF]" />
                                </div>
                                <div>
                                    <div className="text-xs text-[#F2F2F2]/60">Commitment</div>
                                    <div className="text-sm">{hoursPerDay}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-b border-[#2A2F3E]">
                        <h2 className="text-lg font-medium mb-4">Learning Outcomes</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                            {projectOverview.learning_outcomes.map((outcome, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="w-5 h-5 rounded-md bg-[#1E293B] flex items-center justify-center mr-2 mt-0.5">
                                        <span className="text-[#0095FF] text-xs">{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <span className="text-sm text-[#F2F2F2]/80">{outcome}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        <button
                            onClick={handleStartProject}
                            className="w-full bg-[#0095FF] hover:bg-[#0095FF]/90 text-[#F2F2F2] font-medium py-3 px-6 rounded-md transition-colors"
                            disabled={isStarted}
                        >
                            {isStarted ? "Project Started" : "Start This Project"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



