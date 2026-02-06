// src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../style.css";
import farmBg from "../assets/farm-bg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  // 🔥 Temporary frontend data (later from backend)
  const urgentCrops = [
    {
      id: 1,
      name: "Tomato",
      discount: "50% OFF",
      quantity: "10 units",
      daysLeft: "2 days",
    },
    {
      id: 2,
      name: "Spinach",
      discount: "25% OFF",
      quantity: "6 units",
      daysLeft: "1 day",
    },
    {
      id: 3,
      name: "Banana",
      discount: "40% OFF",
      quantity: "15 units",
      daysLeft: "2 days",
    },
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">🌱 AgriConnect</div>
        <ul className="nav-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li>Language</li>
          <li>Farmers</li>
          <li>Consumers</li>
          <li onClick={() => navigate("/login")}>Login</li>
        </ul>
      </nav>

      {/* HERO SECTION */}
      <div
        className="landing-container"
        style={{ backgroundImage: `url(${farmBg})` }}
      >
        <div className="landing-overlay"></div>

        <div className="landing-card">
          <h1 className="landing-title">🌱 AgriConnect</h1>
          <p className="landing-subtitle">
            Connecting Farmers and Consumers with Trust and Transparency
          </p>

          <div className="landing-buttons">
            <button
              className="farmer-btn"
              onClick={() => navigate("/farmer/login")}
            >
              👨‍🌾 Farmer Login
            </button>

            <button
              className="consumer-btn"
              onClick={() => navigate("/consumer")}
            >
              🧑‍💻 Explore as Consumer
            </button>
          </div>

          <p className="landing-footer">Fresh • Local • Transparent</p>
        </div>
      </div>

      {/* 🌟 VALUE / FEATURE SECTION (INFORMATION BASED) */}
      <section className="features-section">
        <h2 className="features-title">Why AgriConnect?</h2>
        <p className="features-subtitle">
          A smarter way to buy and sell agricultural produce
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚜</div>
            <h3>Direct From Farmers</h3>
            <p>
              Buy fresh produce straight from farmers without middlemen,
              ensuring fair prices for both sides.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⏳</div>
            <h3>Urgent Crop Savings</h3>
            <p>
              Get discounted crops when their shelf life is ending —
              reducing waste and saving money.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Transparent Listings</h3>
            <p>
              See real-time details like quantity, freshness, and pricing
              before you buy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Sustainable Impact</h3>
            <p>
              Support sustainable farming and reduce food waste through
              smarter consumption.
            </p>
          </div>
        </div>
      </section>

      {/* 🔥 URGENT DEALS SECTION */}
      <section className="urgent-section">
        <h2 className="urgent-title">Ending Soon</h2>
        <p className="urgent-subtitle">
          Limited-time offers added by farmers
        </p>

        <div className="urgent-slider">
          <div className="urgent-track">
            {urgentCrops.map((crop) => (
              <div className="urgent-card" key={crop.id}>
                <h3>{crop.name}</h3>

                <p className="urgent-discount">{crop.discount}</p>

                <p className="urgent-info">
                  {crop.quantity} • {crop.daysLeft} remaining
                </p>

                <button
                  className="urgent-btn"
                  onClick={() => navigate("/consumer/login")}
                >
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
