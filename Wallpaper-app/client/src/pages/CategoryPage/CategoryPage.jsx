import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CategoryPage.css";

const CategoryPage = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState("pc");
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // PIN login state
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/get-wallpapers")
      .then((response) => response.json())
      .then((data) => setWallpapers(data.wallpapers))
      .catch((error) => console.error("Error fetching wallpapers:", error));

    fetch("http://localhost:5000/api/get-categories")
      .then((response) => response.json())
      .then((data) => setCategories(data.categories))
      .catch((error) => console.error("Error fetching categories:", error));

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedWallpaper(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredWallpapers = selectedCategory
    ? wallpapers.filter((wallpaper) => wallpaper.category === selectedCategory)
    : wallpapers;

  const pcWallpapers = filteredWallpapers.filter((wp) => wp.device === "pc");
  const mobileWallpapers = filteredWallpapers.filter((wp) => wp.device === "mobile");

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "wallpaper.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      alert("Download started successfully!");
    } catch (error) {
      console.error("Error downloading the wallpaper:", error);
      alert("Failed to download the wallpaper. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin === "1234") {
      navigate("/admin");
    } else {
      setError("Incorrect PIN. Try again.");
    }
  };

  return (
    <div className="category-page-container">
      <nav className="category-navbar">
        <div className="category-logo">WallpaperHub</div>
        <ul className="category-nav-links">
          <li className="category-nav-item"><a href="/">Home</a></li>
          <li className="category-nav-item"><a href="/categories">Categories</a></li>
          <li className="category-nav-item"><a href="#contact">Contact</a></li>
          <li className="category-nav-item">
            <button onClick={() => setShowPinInput(!showPinInput)} className="category-login-btn">
              🔐 Login
            </button>
          </li>
        </ul>

        {showPinInput && (
          <div className="category-pin-container">
            <input
              type="password"
              placeholder="Enter Admin PIN"
              className="category-pin-input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button className="category-pin-submit-btn" onClick={handlePinSubmit}>Submit</button>
            {error && <p className="category-pin-error">{error}</p>}
          </div>
        )}
      </nav>

      <div className="category-layout">
        <main className="category-main-content">
          <section id="hero" className="category-hero">
            <div className="category-hero-content">
              <h1 className="category-glitch" data-text="Explore Categories">Explore Categories</h1>
              <p className="category-hero-text">Discover wallpapers tailored to your style.</p>
            </div>
          </section>

          <div className="category-strip">
            <div
              className={`category-pill ${selectedCategory === null ? "active" : ""}`}
              onClick={() => setSelectedCategory(null)}
            >
              All
            </div>
            {categories.map((cat) => (
              <div
                key={cat}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* 🔥 MADE BY VATSAL SECTION */}
          <section className="category-credits">
            <h3 className="category-made-by">💻 Crafted with 💙 by <span>Vatsal Bairagi</span></h3>
            <p className="category-made-tagline">Solo-built project · Design + Code · Maintained by me</p>
          </section>

          <section className="category-wallpapers">
            <h2 className="category-wallpapers-heading">{selectedCategory || "All"} Wallpapers</h2>
            <div className="category-tabs">
              <button
                className={`category-tab-btn ${activeTab === "pc" ? "active" : ""}`}
                onClick={() => setActiveTab("pc")}
              >PC Wallpapers</button>
              <button
                className={`category-tab-btn ${activeTab === "mobile" ? "active" : ""}`}
                onClick={() => setActiveTab("mobile")}
              >Mobile Wallpapers</button>
            </div>
            <div className="category-wallpapers-gallery">
              {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).length > 0 ? (
                (activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
                  <div
                    key={wallpaper._id}
                    className={`category-wallpaper-card ${activeTab === "pc" ? "landscape" : "portrait"}`}
                    onClick={() => openModal(wallpaper)}
                  >
                    <img
                      src={`http://localhost:5000${wallpaper.thumbnail_url || wallpaper.image_url}`}
                      alt={wallpaper.name}
                      className="category-wallpaper-image"
                      loading="lazy"
                    />
                  </div>
                ))
              ) : (
                <p className="category-no-wallpapers">No {activeTab === "pc" ? "PC" : "Mobile"} wallpapers available in this category.</p>
              )}
            </div>
          </section>

          {selectedWallpaper && (
            <WallpaperModal
              wallpaper={selectedWallpaper}
              onClose={closeModal}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          )}

          <section id="contact" className="category-contact-section">
            <h2 className="category-contact-heading">Contact Us</h2>
            <p className="category-contact-text">Developed and Maintained by Vatsal Bairagi</p>
            <div className="category-contact-info">
              <p className="category-contact-email">Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
              <p className="category-contact-instagram">Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank">@wallpaperhub</a></p>
            </div>
            <form className="category-contact-form">
              <input type="text" className="category-input" placeholder="Your Name" required />
              <input type="email" className="category-input" placeholder="Your Email" required />
              <textarea className="category-textarea" placeholder="Your Message" required></textarea>
              <button type="button" className="category-submit-btn">Send Message</button>
            </form>
          </section>
        </main>
      </div>

      <footer className="category-footer">
        <p className="category-footer-text">
          © 2025 WallpaperHub. Built and maintained with 💪 by <strong>Vatsal Bairagi</strong>
        </p>
        <div className="category-social-links">
          <a className="category-social-link" href="https://instagram.com" target="_blank">Instagram</a>
          <a className="category-social-link" href="https://github.com/vatsalbairagi" target="_blank">GitHub</a>
        </div>
      </footer>
    </div>
  );
};

const WallpaperModal = ({ wallpaper, onClose, onDownload, isDownloading }) => (
  <div className="category-modal">
    <div className="category-modal-content">
      <button className="category-modal-close" onClick={onClose}>✕</button>
      <div className="category-modal-image-container">
        <img
          src={`http://localhost:5000${wallpaper.image_url}`}
          alt={wallpaper.name}
          className="category-modal-image"
        />
      </div>
      <div className="category-modal-details">
        <h2 className="category-modal-title">{wallpaper.name}</h2>
        <p className="category-modal-description"><strong>Description:</strong> {wallpaper.description}</p>
        <p className="category-modal-meta"><strong>Category:</strong> {wallpaper.category}</p>
        <p className="category-modal-meta"><strong>Device:</strong> {wallpaper.device}</p>
        <button
          className="category-download-btn"
          onClick={() => onDownload(`http://localhost:5000${wallpaper.image_url}`, wallpaper.name)}
          disabled={isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </div>
    <div className="category-modal-backdrop" onClick={onClose}></div>
  </div>
);

export default CategoryPage;
