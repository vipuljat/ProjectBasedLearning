// src/components/DiagramModal.jsx

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const DiagramModal = ({ diagramCode, onClose }) => {
    console.log(diagramCode);
    const container = useRef(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: false });
        if (container.current) {
            container.current.innerHTML = "";
            try {
                mermaid.render("mermaid-diagram", diagramCode, (svgCode) => {
                    container.current.innerHTML = svgCode;
                });
            } catch (err) {
                container.current.innerHTML = `<p class="text-red-500">Error rendering diagram</p>`;
            }
        }
    }, [diagramCode]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-700 hover:text-red-500 text-xl"
                >
                    &times;
                </button>
                <div
                    ref={container}
                    key={diagramCode}
                    className="overflow-x-auto border rounded p-4 bg-gray-50"
                />
            </div>
        </div>
    );
};

export default DiagramModal;
