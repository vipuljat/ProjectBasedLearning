import { ChevronDown } from "lucide-react";
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Add this at the top with other imports


export default function ProjectRecommendations() {
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
    const location = useLocation();
    const navigate = useNavigate(); // 👈 Add this

    const projects = location.state?.projects || [];

    const handleViewDetails = (title) => {
        // Encode the title for safe URL usage and redirect
        navigate(`/projectOverview/${encodeURIComponent(title)}`);
        console.log(title);
    };

    const filteredProjects = difficultyFilter === 'All'
        ? projects
        : projects.filter(project => project.difficulty === difficultyFilter);

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col min-w-screen">
            {/* Header Component */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full px-4 py-12 mx-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Your Personalized Project Recommendations</h1>
                        <p className="text-[#F2F2F2]/80">Based on your preferences and skill level</p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap gap-4 justify-center">
                        <div className="relative">
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF] appearance-none"
                            >
                                {difficultyOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                        </div>
                        <button className="bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-4 hover:bg-[#2D2E34] transition-colors">All Domains</button>
                        <button className="bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-4 hover:bg-[#2D2E34] transition-colors">Duration</button>
                        <button className="bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-4 hover:bg-[#2D2E34] transition-colors">Tech Stack</button>
                    </div>

                    {/* Project Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project, index) => (
                            <div key={index} className="bg-[#141824] rounded-lg p-6 shadow-lg hover:translate-y-[-4px] hover:shadow-[0_0_15px_#0095FF] transition-transform transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold">{project.title}</h2>
                                    <span className="bg-[#0095FF]/20 text-[#0095FF] text-sm font-medium px-2 py-1 rounded-full">
                                        {project.difficulty}
                                    </span>
                                </div>
                                <p className="text-[#F2F2F2]/70 mb-4">{project.description}</p>
                                <button
                                    onClick={() => handleViewDetails(project.title)}
                                    className="w-full bg-[#0095FF] hover:bg-[#0095FF]/90 text-[#F2F2F2] font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
