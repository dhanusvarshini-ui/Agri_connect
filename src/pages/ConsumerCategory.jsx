// src/pages/ConsumerCategory.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style.css";

const ConsumerCategory = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  // Static data for now (backend later)
  const items = [
    {
      id: 1,
      name: "Tomato",
      price: "₹40 / kg",
      urgent: true,
    },
    {
      id: 2,
      name: "Potato",
      price: "₹30 / kg",
      urgent: false,
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>{category.toUpperCase()}</h1>
        <p>Available items</p>
      </div>

      <div className="dashboard-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className={`dashboard-card ${item.urgent ? "warning" : "success"}`}
          >
            <h3>{item.name}</h3>
            <p className="card-main">{item.price}</p>
            {item.urgent && <p className="card-sub">⚠️ Ending Soon</p>}

            <button
              className="urgent-btn"
              onClick={() => navigate("/consumer/login")}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsumerCategory;
