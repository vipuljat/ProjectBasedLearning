"use client";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Calendar from "react-calendar";
import Header from "../components/Header";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarStyles.css";

import { useFetchModulesQuery, useGetModuleDetailsMutation } from "../services/projectApi";

export default function ModulesPage() {
    const { title } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: modulesData, isLoading, isError } = useFetchModulesQuery(title);
    const [getModuleDetails] = useGetModuleDetailsMutation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const resources = location.state?.resources || null;

    console.log("modules", modulesData);

    // Generate random progress for each module (in a real app, this would come from your API)
    const generateModuleProgress = () => {
        return Math.floor(Math.random() * 100);
    };

    const addDays = (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    const generateFakeDates = (modules) => {
        const today = new Date();
        return modules.map((module, index) => {
            const start = addDays(today, index * 7);
            const end = addDays(start, 6);
            const progress = generateModuleProgress();
            return {
                ...module,
                start_date: start,
                end_date: end,
                progress: progress,
            };
        });
    };

    const calculateDays = (start, end) => {
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const transformModuleForApi = (module) => {
        return {
            title: module.module_title,
            summary: module.summary,
            steps: module.steps.map((step) => ({
                title: step,
                description: step,
            })),
        };
    };

    const handleViewDetails = async (module) => {
        try {
            const transformedModule = transformModuleForApi(module);
            const response = await getModuleDetails(transformedModule).unwrap();
            navigate("/moduleDetails", { state: { module: response } });
        } catch (error) {
            console.error("Failed to fetch module details:", error);
        }
    };

    const handleExploreResources = () => {
        if (resources) {
            navigate("/resourcesPage", { state: { resources } });
        } else {
            console.log("No resources available");
        }
    };

    const tileContent = ({ date, view }) => {
        if (view === "month" && modulesData) {
            const withDates = generateFakeDates(modulesData);
            const matchingModule = withDates.find((module) => {
                return date >= module.start_date && date <= module.end_date;
            });
            return matchingModule ? (
                <div title={`Assigned to: ${matchingModule.module_title}`} className="text-[8px] text-center">
                    {matchingModule.module_title.split(" ")[0]}
                </div>
            ) : null;
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month" && modulesData) {
            const withDates = generateFakeDates(modulesData);
            const index = withDates.findIndex((module) => {
                return date >= module.start_date && date <= module.end_date;
            });
            return index !== -1 ? `module-color-${index % 5}` : null;
        }
        return null;
    };

    if (isLoading) return <div className="text-white p-8">Loading modules...</div>;
    if (isError || !modulesData) return <div className="text-white p-8">Failed to load modules.</div>;

    const modulesWithDates = generateFakeDates(modulesData);

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] min-w-screen">
            <Header />
            <div className="px-8 py-12 w-full">
                <h1 className="text-3xl font-bold mb-8 text-center text-[#F2F2F2]">Project Modules Overview</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Calendar */}
                    <div className="bg-[#141824] p-8 rounded-2xl shadow-md md:w-1/5 sticky top-0">
                        <h2 className="text-xl font-semibold mb-4 text-center text-[#F2F2F2]">Module Timeline Calendar</h2>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                            className="bg-[#141824] text-[#F2F2F2] border-none"
                        />
                        <button
                            className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-2 px-4 rounded mt-4 transition duration-300 font-medium"
                            onClick={handleExploreResources}
                        >
                            Explore Resources
                        </button>
                    </div>

                    {/* Modules List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                        {modulesWithDates.map((module, index) => (
                            <div key={index} className="bg-[#141824] p-6 rounded-2xl shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-[#F2F2F2]">{module.module_title}</h2>
                                    <div className="relative w-12 h-12">
                                        {/* Progress Circle */}
                                        <svg className="w-12 h-12" viewBox="0 0 36 36">
                                            <circle cx="18" cy="18" r="16" fill="none" stroke="#2A2F3E" strokeWidth="2" />
                                            <circle
                                                cx="18"
                                                cy="18"
                                                r="16"
                                                fill="none"
                                                stroke="#0095FF"
                                                strokeWidth="2"
                                                strokeDasharray={`${module.progress}, 100`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 18 18)"
                                            />
                                            <text x="18" y="20" textAnchor="middle" fill="#F2F2F2" fontSize="8" fontWeight="bold">
                                                {module.progress}%
                                            </text>
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-[#F2F2F2]/70 mb-4">Duration: {module.tentative_duration}</p>
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold mb-2 text-[#F2F2F2]/70">Prerequisites</h3>
                                    <ul className="space-y-1">
                                        {module.prerequisites.slice(0, 3).map((prereq, idx) => (
                                            <li key={idx} className="text-sm flex items-start">
                                                <span className="text-[#0095FF] mr-2">•</span>
                                                <span>{prereq}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold mb-2 text-[#F2F2F2]/70">Steps</h3>
                                    <ol className="space-y-1">
                                        {module.steps.slice(0, 3).map((step, idx) => (
                                            <li key={idx} className="text-sm flex items-start">
                                                <span className="text-[#0095FF] mr-2">{idx + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                                <button
                                    className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white py-3 px-4 rounded-lg transition duration-300 font-medium"
                                    onClick={() => handleViewDetails(module)}
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}