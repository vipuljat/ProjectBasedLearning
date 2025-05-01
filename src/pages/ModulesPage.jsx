"use client";

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import Header from "../components/Header";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarStyles.css";
import { useFetchModulesQuery, useGetModuleDetailsMutation, useGetAllModuleDetailsQuery } from "../services/projectApi";
import { ChevronRight } from "lucide-react";

export default function ModulesPage() {
    const { title } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: modulesData, isLoading, isError } = useFetchModulesQuery(title);
    const [getModuleDetails] = useGetModuleDetailsMutation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [resources, setResources] = useState(location.state?.resources || null);
    const [loadingProject, setLoadingProject] = useState(false);
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [progress, setProgress] = useState(0);

    // Fetch pre-generated module details
    const { data: moduleDetails, refetch: refetchModuleDetails, isLoading: isLoadingDetails } = useGetAllModuleDetailsQuery(
        modulesData?.[0]?.project_id || "",
        { skip: !modulesData }
    );

    // Update resources when location.state.resources changes
    useEffect(() => {
        setResources(location.state?.resources || null);
    }, [location.state?.resources]);

    // Restore projectLoaded state from sessionStorage and load project automatically
    useEffect(() => {
        const storedProjectLoaded = sessionStorage.getItem(`projectLoaded_${title}`);
        if (storedProjectLoaded === "true") {
            setProjectLoaded(true);
            return;
        }

        if (!modulesData || modulesData.length === 0 || loadingProject) return;

        const loadProject = async () => {
            setLoadingProject(true);
            setProgress(0);
            try {
                // Sequentially generate details for each module with progress
                for (let i = 0; i < modulesData.length; i++) {
                    const module = modulesData[i];
                    const transformedModule = transformModuleForApi(module);
                    console.log("Payload being sent to /moduleDetails:", transformedModule);
                    await getModuleDetails(transformedModule).unwrap();
                    setProgress(((i + 1) / modulesData.length) * 100);
                }
                setProjectLoaded(true);
                sessionStorage.setItem(`projectLoaded_${title}`, "true");
                // Refetch module details after generation
                await refetchModuleDetails();
            } catch (error) {
                console.error("Error loading project:", error);
                if (error.status === 422) {
                    console.error("Validation error. Details:", error.data);
                }
            } finally {
                setLoadingProject(false);
                setProgress(100);
            }
        };

        loadProject();
    }, [modulesData, title, getModuleDetails, refetchModuleDetails, loadingProject]);

    console.log("modulesData:", modulesData);
    console.log("resources:", resources);
    console.log("moduleDetails:", moduleDetails);

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
            module_id: module.module_id,
            project_id: module.project_id,
            title: module.module_title,
            summary: module.summary,
            steps: (module.steps || []).map((step) => ({
                title: step,
                description: step,
            })),
        };
    };

    const handleViewDetails = (detail) => {
        navigate("/moduleResourcePage", { state: { module: detail, resources } });
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
                    <div className="flex-1 overflow-y-auto">
                        {/* Progress Indicator */}
                        {loadingProject && (
                            <div className="mb-8">
                                <div className="text-white font-semibold">Loading Project...</div>
                                <div className="mt-4 w-full bg-[#2D2E34] h-2 rounded overflow-hidden">
                                    <div
                                        className="bg-[#0095FF] h-2 rounded transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {modulesWithDates.map((module, index) => {
                                // Find the corresponding module detail
                                const detail = moduleDetails?.find((d) => d.module_id === module.module_id);
                                return (
                                    <div key={index} className="bg-[#141824] p-4 rounded-2xl shadow-md">
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
                                                {(module.prerequisites || []).slice(0, 3).map((prereq, idx) => (
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
                                                {(module.steps || []).slice(0, 3).map((step, idx) => (
                                                    <li key={idx} className="text-sm flex items-start">
                                                        <span className="text-[#0095FF] mr-2">{idx + 1}.</span>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                        {/* View Details Button */}
                                        <button
                                            onClick={() => detail && handleViewDetails(detail)}
                                            disabled={!projectLoaded || isLoadingDetails || !detail}
                                            className={`text-[#0095FF] hover:text-[#0095FF]/80 transition-colors flex items-center ${
                                                !projectLoaded || isLoadingDetails || !detail ? "opacity-50 cursor-not-allowed" : ""
                                            }`}
                                        >
                                            View Full Details <ChevronRight className="w-4 h-4 ml-1" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}