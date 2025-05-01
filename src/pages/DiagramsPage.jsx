import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Added to get project_title from URL
import { useGetStoredDiagramsQuery } from "../services/projectApi"; // Replaced with useGetStoredDiagramsQuery
import mermaid from "mermaid";

const COLORS = ["#0095FF", "#00C49F", "#FFBB28", "#FF8042"];

export default function DiagramsPage() {
    const { project_title } = useParams(); // Get project_title from URL params
    const { data: diagramData, isLoading, isError } = useGetStoredDiagramsQuery(project_title); // Fetch data using query
    const [selectedDiagram, setSelectedDiagram] = useState("UML");
    const [renderError, setRenderError] = useState(null);

    console.log("diagramData", diagramData);
    console.log("title", project_title);

    // Initialize Mermaid once on mount
    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            flowchart: { curve: "basis" },
            securityLevel: "loose",
        });
    }, []);

    // Render Mermaid diagram
    useEffect(() => {
        if (diagramData && diagramData.diagrams) {
            const renderDiagram = async () => {
                try {
                    const mermaidCode = getMermaidCode();
                    console.log(`Mermaid Code for ${selectedDiagram}:\n`, mermaidCode); // Debugging
                    const { svg } = await mermaid.render("mermaid-diagram-svg", mermaidCode);
                    const diagramContainer = document.getElementById("mermaid-diagram");
                    if (diagramContainer) {
                        diagramContainer.innerHTML = svg;
                    }
                    setRenderError(null);
                } catch (error) {
                    console.error(`Error rendering ${selectedDiagram} diagram:`, error.message || error);
                    setRenderError(`Failed to render ${selectedDiagram} diagram. Please try another type.`);
                }
            };
            renderDiagram();
        }
    }, [diagramData, selectedDiagram]);

    const sanitizeNodeId = (id) => {
        // Replace spaces with underscores
        let sanitized = id.replace(/\s+/g, '_');
        // Handle reserved keywords by appending a suffix
        const reservedKeywords = ['end', 'subgraph', 'class', 'style'];
        if (reservedKeywords.includes(sanitized.toLowerCase())) {
            sanitized = `${sanitized}_Node`;
        }
        return sanitized;
    };

    const getMermaidCode = () => {
        if (!diagramData || !diagramData.diagrams) return "";

        switch (selectedDiagram) {
            case "UML": {
                const classes = diagramData.diagrams.UML.classes || [];
                const relationships = diagramData.diagrams.UML.relationships || [];
                let code = "classDiagram\n";
                classes.forEach((cls) => {
                    const classId = sanitizeNodeId(cls.name);
                    code += `    class ${classId} {\n`;
                    cls.attributes.forEach((attr) => {
                        code += `        +${attr}\n`;
                    });
                    code += "    }\n";
                });
                relationships.forEach((rel) => {
                    const sourceId = sanitizeNodeId(rel.source);
                    const targetId = sanitizeNodeId(rel.target);
                    const arrowType =
                        rel.type === "aggregation" ? "o--" :
                        rel.type === "composition" ? "*--" :
                        rel.type === "inheritance" ? "--|>" :
                        "-->";
                    code += `    ${sourceId} ${arrowType} ${targetId} : ${rel.type}\n`;
                });
                return code;
            }
            case "Flowchart": {
                const elements = diagramData.diagrams.Flowchart.elements || [];
                const connections = diagramData.diagrams.Flowchart.connections || [];
                let code = "flowchart TD\n";
                elements.forEach((el) => {
                    const elId = sanitizeNodeId(el.id);
                    const shape =
                        el.type === "start" || el.type === "end"
                            ? `(${el.text})`
                            : el.type === "decision"
                            ? `{${el.text}}`
                            : `[${el.text}]`;
                    code += `    ${elId}${shape}\n`;
                });
                // Validate and add connections
                const elementIds = elements.map((el) => sanitizeNodeId(el.id));
                connections.forEach((conn) => {
                    const sourceId = sanitizeNodeId(conn.source);
                    const destId = sanitizeNodeId(conn.destination);
                    if (elementIds.includes(sourceId) && elementIds.includes(destId)) {
                        code += `    ${sourceId} -->|${conn.label || ""}| ${destId}\n`;
                    } else {
                        console.warn(`Invalid connection: ${sourceId} --> ${destId}`);
                    }
                });
                return code;
            }
            case "DFD": {
                const entities = diagramData.diagrams.DFD.entities || [];
                const dataFlows = diagramData.diagrams.DFD.data_flows || [];
                let code = "flowchart TD\n";
                const entityNames = entities.map((entity) => sanitizeNodeId(entity.name));
                // Add entities as nodes
                entities.forEach((entity) => {
                    const entityId = sanitizeNodeId(entity.name);
                    code += `    ${entityId}([${entity.name}])\n`;
                });
                // Validate and add data flows
                dataFlows.forEach((flow) => {
                    const sourceId = sanitizeNodeId(flow.source);
                    const destId = sanitizeNodeId(flow.destination);
                    let updatedEntityNames = [...entityNames];
                    if (!updatedEntityNames.includes(sourceId)) {
                        code += `    ${sourceId}([${flow.source}])\n`;
                        updatedEntityNames.push(sourceId);
                    }
                    if (!updatedEntityNames.includes(destId)) {
                        code += `    ${destId}([${flow.destination}])\n`;
                        updatedEntityNames.push(destId);
                    }
                    code += `    ${sourceId} -- "${flow.data}" --> ${destId}\n`;
                });
                return code;
            }
            default:
                return "";
        }
    };

    const handleTabClick = (tab) => {
        setSelectedDiagram(tab);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col w-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-lg text-gray-400 animate-pulse">Loading your diagram...</p>
                </main>
            </div>
        );
    }

    if (isError || !diagramData) {
        return (
            <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col w-screen">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-lg text-red-400">Failed to load diagram. Please try again.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0C111D] text-[#F2F2F2] flex flex-col w-screen">
            <Header />
            <main className="flex-1 w-full px-4 py-12 mx-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">{diagramData.title}</h1>
                        <p className="text-[#F2F2F2]/80">{diagramData.description}</p>
                    </div>

                    {/* Tabs for selecting diagrams */}
                    <div className="flex justify-center mb-6 space-x-2">
                        <button
                            onClick={() => handleTabClick("UML")}
                            className={`px-4 py-2 rounded-md ${
                                selectedDiagram === "UML" ? "bg-[#0095FF] text-white" : "bg-[#191C27] text-[#F2F2F2]/80 hover:bg-[#2D2E34]"
                            }`}
                        >
                            UML Diagram
                        </button>
                        <button
                            onClick={() => handleTabClick("Flowchart")}
                            className={`px-4 py-2 rounded-md ${
                                selectedDiagram === "Flowchart" ? "bg-[#0095FF] text-white" : "bg-[#191C27] text-[#F2F2F2]/80 hover:bg-[#2D2E34]"
                            }`}
                        >
                            Flowchart
                        </button>
                        <button
                            onClick={() => handleTabClick("DFD")}
                            className={`px-4 py-2 rounded-md ${
                                selectedDiagram === "DFD" ? "bg-[#0095FF] text-white" : "bg-[#191C27] text-[#F2F2F2]/80 hover:bg-[#2D2E34]"
                            }`}
                        >
                            DFD
                        </button>
                    </div>

                    {/* Mermaid Diagram */}
                    <div className="bg-[#141824] rounded-xl p-8 border border-[#4AB8FF]/30 hover:shadow-[0_0_15px_#4AB8FF] transition-all">
                        {renderError ? (
                            <p className="text-red-400 text-center">{renderError}</p>
                        ) : (
                            <div id="mermaid-diagram" className="w-full min-h-[400px] overflow-x-auto"></div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}