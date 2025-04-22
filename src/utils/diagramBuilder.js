// src/utils/diagramBuilder.js

export function generateMermaidCode(type, data) {
    if (type === "UML") {
        let code = "classDiagram\n";
        data.classes.forEach(cls => {
            code += `  class ${cls.name} {\n`;
            cls.attributes.forEach(attr => {
                code += `    +${attr}\n`;
            });
            code += "  }\n";
        });

        // Example: Uncomment below to show static relationships
        // code += "  User --> LearningPath\n  LearningPath --> LearningResource\n";

        return code;
    }

    if (type === "Flowchart") {
        let code = "flowchart TD\n";
        data.elements.forEach(el => {
            code += `  ${el.id}[${el.text}]\n`;
        });

        for (let i = 0; i < data.elements.length - 1; i++) {
            code += `  ${data.elements[i].id} --> ${data.elements[i + 1].id}\n`;
        }

        return code;
    }

    if (type === "DFD") {
        let code = "graph TD\n";
        data.entities.forEach(ent => {
            code += `  ${ent.name}\n`;
        });

        data.data_flows.forEach(flow => {
            code += `  ${flow.source} -->|${flow.data}| ${flow.destination}\n`;
        });

        return code;
    }

    return "// Unsupported diagram type";
}
