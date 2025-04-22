// src/components/DiagramCard.jsx

import React from "react";

const DiagramCard = ({ name, description, onClick }) => (

    console.log(name, description),
    <div
        className="border rounded-lg p-4 shadow hover:shadow-lg transition duration-200 cursor-pointer bg-white"
        onClick={onClick}
    >
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
    </div>
);

export default DiagramCard;
