import { ChevronDown } from "lucide-react";
import { useState } from "react";
import Header from "../components/Header";
import { useSuggestProjectsMutation } from "../services/projectApi";
import { useNavigate } from "react-router-dom";

export default function PreferencesPage() {
    // State for form fields
    const [formData, setFormData] = useState({
        skill_level: "",
        project_type: "",
        technology: [],
        duration: "", // Will store values like "1 week", "2 weeks", etc.
        domain: "",
        time_commitment: "",
    });

    const [suggestProjects, { data, isLoading, error }] = useSuggestProjectsMutation();
    const navigate = useNavigate();

    // Handle single-select and text inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle multi-select buttons for technology
    const handleMultiSelect = (value) => {
        setFormData((prev) => {
            const currentValues = prev.technology;
            if (currentValues.includes(value)) {
                return { ...prev, technology: currentValues.filter((item) => item !== value) };
            } else {
                return { ...prev, technology: [...currentValues, value] };
            }
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const jsonOutput = {
            skill_level: formData.skill_level,
            project_type: formData.project_type,
            technology: formData.technology.join(","), // Already sending as a comma-separated string
            duration: formData.duration || undefined, // Send as "X weeks" or undefined if empty
            domain: formData.domain || undefined,
            time_commitment: formData.time_commitment || undefined,
        };

        

        try {
            const response = await suggestProjects(jsonOutput).unwrap();
            console.log("Suggested projects:", jsonOutput);
            if (response?.length) {
                navigate("/projectRecommendations", {
                    state: {
                        projects: response,
                        userPreferences: jsonOutput,
                    },
                });
            } else {
                alert("No suggestions returned.");
            }
        } catch (err) {
            console.error("Error while suggesting projects:", err);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col min-w-screen">
            {/* Header Component */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 w-full px-4 py-12 mx-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Tell Us About You</h1>
                        <p className="text-[#F2F2F2]/80">Help us understand your preferences to suggest the perfect project</p>
                    </div>

                    <div className="bg-[#141824] rounded-xl p-8 border border-[#4AB8FF]/30 hover:shadow-[0_0_15px_#4AB8FF] focus-within:shadow-[0_0_15px_#4AB8FF] transition-all">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Skill Level */}
                                <div className="space-y-2">
                                    <label className="block font-medium">Skill Level</label>
                                    <div className="relative">
                                        <select
                                            name="skill_level"
                                            value={formData.skill_level}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 appearance-none text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF]"
                                            required
                                        >
                                            <option value="" disabled>Select level</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                                    </div>
                                </div>

                                {/* Project Type */}
                                <div className="space-y-2">
                                    <label className="block font-medium">Project Type</label>
                                    <div className="relative">
                                        <select
                                            name="project_type"
                                            value={formData.project_type}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 appearance-none text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF]"
                                            required
                                        >
                                            <option value="" disabled>Select type</option>
                                            <option value="Frontend">Frontend</option>
                                            <option value="Backend">Backend</option>
                                            <option value="Full Stack">Full Stack</option>
                                            <option value="Mobile">Mobile App</option>
                                            <option value="Data">Data Science</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                                    </div>
                                </div>

                                {/* Technology */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block font-medium">Technology</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["MERN", "Django", "Flutter", "TensorFlow"].map((tech) => (
                                            <button
                                                key={tech}
                                                type="button"
                                                onClick={() => handleMultiSelect(tech)}
                                                className={`bg-[#191C27] border border-[#2D2E34] rounded-md px-3 py-1 text-sm transition-colors ${
                                                    formData.technology.includes(tech)
                                                        ? "bg-[#0095FF] text-white"
                                                        : "hover:bg-[#2D2E34]"
                                                }`}
                                                required
                                            >
                                                {tech}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div className="space-y-2">
                                    <label className="block font-medium">Duration (in weeks)</label>
                                    <div className="relative">
                                        <select
                                            name="duration"
                                            value={formData.duration}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 appearance-none text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF]"
                                        >
                                            <option value="" disabled>Select duration</option>
                                            <option value="1 week">1 week</option>
                                            <option value="2 weeks">2 weeks</option>
                                            <option value="3 weeks">3 weeks</option>
                                            <option value="4 weeks">4 weeks</option>
                                            <option value="5 weeks">5 weeks</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                                    </div>
                                </div>

                                {/* Domain */}
                                <div className="space-y-2">
                                    <label className="block font-medium">Domain</label>
                                    <div className="relative">
                                        <select
                                            name="domain"
                                            value={formData.domain}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 appearance-none text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF]"
                                        >
                                            <option value="" disabled>Select domain</option>
                                            <option value="Education">Education</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Technology">Technology</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                                    </div>
                                </div>

                                {/* Time Commitment */}
                                <div className="space-y-2">
                                    <label className="block font-medium">Time Commitment</label>
                                    <div className="relative">
                                        <select
                                            name="time_commitment"
                                            value={formData.time_commitment}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#191C27] border border-[#2D2E34] rounded-md py-2 px-3 appearance-none text-[#F2F2F2] focus:outline-none focus:ring-1 focus:ring-[#0095FF] focus:border-[#0095FF]"
                                        >
                                            <option value="" disabled>Select time commitment</option>
                                            <option value="1 hour/day">1 hour/day</option>
                                            <option value="2 hours/day">2 hours/day</option>
                                            <option value="3 hours/day">3 hours/day</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F2F2F2]/50" size={18} />
                                    </div>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    className="w-full bg-[#0095FF] hover:bg-[#0095FF]/90 text-white font-medium py-3 px-4 rounded-md transition-colors"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Generating..." : "Generate Suggestions"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}