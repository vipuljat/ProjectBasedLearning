// src/App.jsx

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { diagramJSON } from "./data/diagramData";
import { generateMermaidCode } from "./utils/diagramBuilder";
import DiagramCard from "./components/DiagramCard";
import DiagramModal from "./components/DiagramModal";
import PreferencesPage from "./pages/PreferencesPage"; // Make sure this file exists
import ProjectRecommendations from "./pages/ProjectRecommendations";
import ProjectOverview from "./pages/ProjectOverview";
import ModulesPage from "./pages/ModulesPage";
import ResourcesPage from "./pages/ResourcesPage";
import ModuleDetailPage from "./pages/moduleDetails";


const DiagramVisualizer = () => {
    const [selectedDiagram, setSelectedDiagram] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [diagramCode, setDiagramCode] = useState("");

    const handleCardClick = (name, data) => {
        const code = generateMermaidCode(name, data);
        setDiagramCode(code);
        setSelectedDiagram(name);
        setModalOpen(true);
    };

    const handleCloseModal = () => {        
        setModalOpen(false);
        setSelectedDiagram(null);
        setDiagramCode("");
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-4xl font-bold mb-6 text-center">Diagram Visualizer</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(diagramJSON.diagrams).map(([name, data]) => (
                    <DiagramCard
                        key={name}
                        name={name}
                        description={data.description}
                        onClick={() => handleCardClick(name, data)}
                    />
                ))}
            </div>

            {modalOpen && (
                <DiagramModal
                    diagramCode={diagramCode}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/DiagramVisualizer" element={<DiagramVisualizer />} />
                <Route path="/" element={<PreferencesPage />} />
                <Route path="/projectRecommendations" element={<ProjectRecommendations />} />
                <Route path="/projectOverview/:title" element={<ProjectOverview />} />
                <Route path="/modules/:title" element={<ModulesPage />} />
                <Route path="/moduleDetails" element={<ModuleDetailPage />} />
                <Route path="/resourcesPage" element={<ResourcesPage />} />
            </Routes>
        </Router>
    );
};

export default App;
