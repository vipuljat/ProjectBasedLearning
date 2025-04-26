import { ChevronDown } from "lucide-react";
import { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useGetProjectsQuery } from '../services/projectApi'; // Hook to fetch projects

export default function YourProjects() {
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
    const navigate = useNavigate(); // For navigation

    // Fetch projects from the backend using the useGetProjectsQuery hook
    const { data: projects = [], isLoading, error } = useGetProjectsQuery();
    console.log("pro", projects);

    // Handle navigation to the modules page using project title
    const handleViewDetails = (projectTitle) => {
        const encodedTitle = encodeURIComponent(projectTitle); // Encode for URL safety
        navigate(`/modules/${encodedTitle}`);
    };

    // Filter projects by difficulty
    const filteredProjects = difficultyFilter === 'All'
        ? projects
        : projects.filter(project => project.difficulty === difficultyFilter);

    // Show a loading message or error if necessary
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading projects</div>;
    }

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col min-w-screen">
            {/* Header Component */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full px-4 py-12 mx-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
                        <p className="text-[#F2F2F2]/80">Explore your projects based on your skill level</p>
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
                                <div className="flex flex-col justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold">{project.project_title}</h2>
                                    {/* Module count below the title */}
                                    <span className="text-sm text-[#F2F2F2]/60 mt-2">
                                        {project.modules ? project.modules.length : 0} Modules
                                    </span>
                                </div>

                                {/* View Details Button */}
                                <button
                                    onClick={() => handleViewDetails(project.project_title)}
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
