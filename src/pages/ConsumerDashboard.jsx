// src/pages/ConsumerDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";

const ConsumerDashboard = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Fruits", path: "/consumer/fruits", icon: "🍎" },
    { name: "Vegetables", path: "/consumer/vegetables", icon: "🥕" },
    { name: "Plant Saplings", path: "/consumer/saplings", icon: "🌱" },
    { name: "Plant Products", path: "/consumer/products", icon: "🌿" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Explore Categories</h1>
        <p>Select a category to view available items</p>
      </div>

      <div className="dashboard-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="dashboard-card info"
            onClick={() => navigate(cat.path)}
            style={{ cursor: "pointer" }}
          >
            <h3>{cat.icon} {cat.name}</h3>
            <p className="card-sub">Browse available items</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsumerDashboard;
