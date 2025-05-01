"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/ModuleDetail.css";
import { ChevronLeft, ExternalLink, ChevronRight, BookOpen, Code, FileText, CheckCircle } from "lucide-react";
import Header from "../components/Header";

export default function ModuleDetailPage() {
    const location = useLocation();
    const { module, activeDay: initialDay = 0, activeTask: initialTask = 0 } = location.state || {};
    const [activeStep, setActiveStep] = useState(initialDay * 3 + initialTask); // Flatten index: each day has 1 task
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        setAnimateIn(true);
    }, []);

    // Transform steps into days (7 days, one task per day)
    const days = module?.steps
        ? Array.from({ length: 7 }, (_, dayIndex) => {
            const stepIndex = Math.min(dayIndex, module.steps.length - 1);
            const step = module.steps[stepIndex];
            const estimatedTimePerDay = module.module_total_hours / 7; // Approx time per day
            return {
                day_number: dayIndex + 1,
                tasks: [
                    {
                        ...step,
                        taskId: `${module.moduleId}-task-${dayIndex + 1}`, // Default start time
                        estimated_time: `${estimatedTimePerDay} hours`,
                    },
                ],
            };
        })
        : [];

    // Flatten tasks across all days for navigation
    const allTasks = days.flatMap((day) => day.tasks) || [];
    if (!module || !days || allTasks.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0C111D] to-[#1a1a4a] text-[#F2F2F2] flex flex-col items-center justify-center">
                <h2 className="text-2xl mb-4">Module not found</h2>
                <Link to="/modules" className="text-[#0095FF] hover:underline flex items-center">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to modules
                </Link>
            </div>
        );
    }

    const handleStepChange = (index) => {
        setAnimateIn(false);
        setTimeout(() => {
            setActiveStep(index);
            setAnimateIn(true);
        }, 300);
    };

    const cleanList = (text) => {
        if (!text) return null;
        let cleanedText = text.replace(/\*\*/g, "").trim();
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

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] w-screen">
            <Header />
            <div className="max-w-7xl mx-auto px-6 py-10">
                {/* Back button */}
                <Link
                    to="/modules"
                    className="inline-flex items-center text-[#0095FF] hover:text-[#0095FF]/80 mb-8 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Modules
                </Link>

                {/* Module header */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#141824] to-[#191C27] rounded-2xl p-8 mb-12 shadow-xl border border-[#2D2E34]/30">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B22CE]/20 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0095FF]/10 rounded-full filter blur-3xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#F2F2F2] to-[#0095FF] bg-clip-text text-transparent">
                            {module.title}
                        </h1>
                        <p className="text-lg text-[#F2F2F2]/80 max-w-4xl">{module.description}</p>
                        <div className="mt-6 flex items-center">
                            <div className="bg-[#0095FF]/20 text-[#0095FF] px-4 py-2 rounded-full text-sm font-medium">
                                {allTasks.length} Tasks
                            </div>
                            <div className="ml-4 text-[#F2F2F2]/60 text-sm">
                                Estimated completion time: {Math.ceil(allTasks.reduce((sum, task) => sum + parseInt(task.estimated_time || 0), 0) / 60)} hours
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step content and Navigation Sidebar */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Navigation Sidebar (left side) */}
                    <div className="lg:w-1/4">
                        <div className="bg-[#141824] rounded-xl p-4">
                            <h2 className="text-xl font-bold mb-4 text-[#F2F2F2]">Module Tasks</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {allTasks.map((task, index) => {
                                    const dayIndex = days.findIndex((day) => day.tasks.includes(task));
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleStepChange(index)}
                                            className={`bg-[#0C111D] rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${activeStep === index ? "border-2 border-[#0095FF]" : ""}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-[#F2F2F2]">
                                                    Day {days[dayIndex].day_number}: {task.hour} - {task.title}
                                                </h3>
                                                <div className="w-5 h-5">
                                                    {index % 4 === 0 ? (
                                                        <BookOpen className="w-5 h-5" />
                                                    ) : index % 4 === 1 ? (
                                                        <Code className="w-5 h-5" />
                                                    ) : index % 4 === 2 ? (
                                                        <FileText className="w-5 h-5" />
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#2D2E34] h-1 mt-2 rounded">
                                                <div
                                                    className="bg-[#0095FF] h-1 rounded"
                                                    style={{ width: `${((index + 1) / allTasks.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Step content (right side) */}
                    <div className="lg:w-3/4">
                        <div
                            className={`bg-[#141824] rounded-xl p-8 transition-all duration-300 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-[#0095FF]/20 text-[#0095FF] px-4 py-2 rounded-full text-sm font-medium">
                                        Task {activeStep + 1}
                                    </div>
                                    <h2 className="text-2xl font-bold ml-4 text-[#F2F2F2]">
                                        {allTasks[activeStep].title}
                                    </h2>
                                </div>

                                {/* Next Step button on top right */}
                                <button
                                    onClick={() =>
                                        handleStepChange(Math.min(allTasks.length - 1, activeStep + 1))
                                    }
                                    disabled={activeStep === allTasks.length - 1}
                                    className={`px-4 py-2 rounded-lg flex items-center ${activeStep === allTasks.length - 1
                                            ? "bg-[#191C27]/50 text-[#F2F2F2]/30 cursor-not-allowed"
                                            : "bg-[#0095FF]/20 text-[#0095FF] hover:bg-[#0095FF]/30"
                                        }`}
                                >
                                    Next <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-8">
                                <div className="flex justify-between text-sm text-[#F2F2F2]/60 mb-2">
                                    <span>Progress</span>
                                    <span>{Math.round(((activeStep + 1) / allTasks.length) * 100)}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${((activeStep + 1) / allTasks.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Explanation */}
                                <div className="bg-[#191C27] rounded-xl p-6 border border-[#2D2E34]/30">
                                    <h3 className="text-lg font-semibold mb-3 text-[#F2F2F2]">Explanation</h3>
                                    <p className="text-[#F2F2F2]/80">{allTasks[activeStep].explanation}</p>
                                </div>

                                {/* Algorithm */}
                                {allTasks[activeStep].algorithm && (
                                    <div className="bg-[#191C27] rounded-xl p-6 border border-[#2D2E34]/30">
                                        <h3 className="text-lg font-semibold mb-3 text-[#F2F2F2]">Algorithm</h3>
                                        <div className="bg-[#0C111D] rounded-lg p-4 font-mono text-sm text-[#F2F2F2]/80">
                                            <ol className="list-decimal list-inside space-y-2">
                                                {cleanList(allTasks[activeStep].algorithm)}
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {/* Code */}
                                {allTasks[activeStep].code && (
                                    <div className="bg-[#191C27] rounded-xl p-6 border border-[#2D2E34]/30">
                                        <h3 className="text-lg font-semibold mb-3 text-[#F2F2F2]">Code</h3>
                                        <pre className="bg-[#0C111D] rounded-lg p-4 text-[#00FF9D]/90 text-sm overflow-x-auto">
                                            <code>{allTasks[activeStep].code}</code>
                                        </pre>
                                    </div>
                                )}

                                {/* Example */}
                                <div className="bg-[#191C27] rounded-xl p-6 border border-[#2D2E34]/30">
                                    <h3 className="text-lg font-semibold mb-3 text-[#F2F2F2]">Example</h3>
                                    <div className="bg-[#0C111D] rounded-lg p-4 font-mono text-sm text-[#F2F2F2]/80">
                                        <ol className="list-decimal list-inside space-y-2">
                                            {cleanList(allTasks[activeStep].example)}
                                        </ol>
                                    </div>
                                </div>

                                {/* Resources */}
                                <div className="bg-[#191C27] rounded-xl p-6 border border-[#2D2E34]/30">
                                    <h3 className="text-lg font-semibold mb-3 text-[#F2F2F2]">Resources</h3>
                                    <div className="space-y-3">
                                        {allTasks[activeStep].resources.map((resource, index) => (
                                            <a
                                                key={index}
                                                href={resource.replace(/"/g, "")} // Remove quotes from resource URLs
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center p-3 bg-[#0C111D] rounded-lg hover:bg-[#0C111D]/80 transition-colors group"
                                            >
                                                <div className="flex-shrink-0 w-10 h-10 bg-[#0095FF]/10 rounded-full flex items-center justify-center mr-3">
                                                    <ExternalLink className="w-5 h-5 text-[#0095FF]" />
                                                </div>
                                                <div className="flex-1 truncate text-[#F2F2F2]/80 group-hover:text-[#0095FF] transition-colors">
                                                    {resource.replace(/"/g, "")}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom Navigation buttons */}
                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={() => handleStepChange(Math.max(0, activeStep - 1))}
                                        disabled={activeStep === 0}
                                        className={`px-4 py-2 rounded-lg flex items-center ${activeStep === 0
                                                ? "bg-[#191C27]/50 text-[#F2F2F2]/30 cursor-not-allowed"
                                                : "bg-[#191C27] text-[#F2F2F2] hover:bg-[#2D2E34]"
                                            }`}
                                    >
                                        <ChevronLeft className="w-5 h-5 mr-1" /> Previous Task
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleStepChange(Math.min(allTasks.length - 1, activeStep + 1))
                                        }
                                        disabled={activeStep === allTasks.length - 1}
                                        className={`px-4 py-2 rounded-lg flex items-center ${activeStep === allTasks.length - 1
                                                ? "bg-[#191C27]/50 text-[#F2F2F2]/30 cursor-not-allowed"
                                                : "bg-[#191C27] text-[#F2F2F2] hover:bg-[#2D2E34]"
                                            }`}
                                    >
                                        Next Task <ChevronRight className="w-5 h-5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}