import React, { useState, useEffect } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [activeTab, setActiveTab] = useState("pc");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/get-wallpapers")
      .then((response) => response.json())
      .then((data) => {
        setWallpapers(data.wallpapers);
      })
      .catch((error) => {
        console.error("Error fetching wallpapers:", error);
      });

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedWallpaper(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const pcWallpapers = wallpapers.filter((wp) => wp.device === "pc");
  const mobileWallpapers = wallpapers.filter((wp) => wp.device === "mobile");

  const openModal = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
  };

  const closeModal = () => {
    setSelectedWallpaper(null);
  };

  const handleDownload = async (url, name) => {
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "wallpaper.jpg"; // Fallback name if none provided
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

  return (
    <div className="homepage-container">
      {/* Navbar */}
      <nav className="homepage-navbar">
        <div className="homepage-logo">WallpaperHub</div>
        <ul className={`homepage-nav-links ${isNavOpen ? "homepage-nav-active" : ""}`}>
          <li><a href="#hero">Home</a></li>
          <li><a href="/categories">Categories</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="homepage-hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="homepage-hero">
        <div className="homepage-hero-overlay"></div>
        <div className="homepage-hero-content">
          <h1>Discover Epic Wallpapers</h1>
          <p>Elevate your device with our curated collection of stunning visuals.</p>
          <a href="#wallpapers" className="homepage-cta-button">Explore Now</a>
        </div>
      </section>

      {/* Wallpapers Section */}
      <section id="wallpapers" className="homepage-wallpapers">
        <h2>Our Collection</h2>
        <div className="homepage-tabs">
          <button
            className={activeTab === "pc" ? "homepage-tab-active" : ""}
            onClick={() => setActiveTab("pc")}
          >
            PC Wallpapers
          </button>
          <button
            className={activeTab === "mobile" ? "homepage-tab-active" : ""}
            onClick={() => setActiveTab("mobile")}
          >
            Mobile Wallpapers
          </button>
        </div>
        <div className="homepage-wallpapers-gallery">
          {(activeTab === "pc" ? pcWallpapers : mobileWallpapers).map((wallpaper) => (
            <div
              className={`homepage-wallpaper-card ${activeTab === "pc" ? "homepage-landscape" : "homepage-portrait"}`}
              key={wallpaper._id}
              onClick={() => openModal(wallpaper)}
            >
              <img
                src={`http://localhost:5000${wallpaper.thumbnail_url || wallpaper.image_url}`}
                alt={wallpaper.name}
                className="homepage-wallpaper-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedWallpaper && (
        <div className="homepage-modal">
          <div className="homepage-modal-content">
            <button className="homepage-modal-close" onClick={closeModal} aria-label="Close modal">
              ✕
            </button>
            <div className="homepage-modal-image-container">
              <img
                src={`http://localhost:5000${selectedWallpaper.image_url}`}
                alt={selectedWallpaper.name}
                className="homepage-modal-image"
              />
            </div>
            <div className="homepage-modal-details">
              <h2>{selectedWallpaper.name}</h2>
              <p><strong>Description:</strong> {selectedWallpaper.description}</p>
              <p><strong>Category:</strong> {selectedWallpaper.category}</p>
              <p><strong>Device:</strong> {selectedWallpaper.device}</p>
              <button
                className="homepage-download-btn"
                onClick={() => handleDownload(`http://localhost:5000${selectedWallpaper.image_url}`, selectedWallpaper.name)}
                disabled={isDownloading}
              >
                {isDownloading ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
          <div className="homepage-modal-backdrop" onClick={closeModal}></div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="homepage-contact-section">
        <p>Developed and maintained by Vatsal Bairagi</p>
        <div className="homepage-contact-info">
          <p>Email: <a href="mailto:support@wallpaperhub.com">support@wallpaperhub.com</a></p>
          <p>Instagram: <a href="https://instagram.com/wallpaperhub" target="_blank">@wallpaperhub</a></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <p>© 2025 WallpaperHub. All rights reserved.</p>
        <div className="homepage-social-links">
          <a href="https://instagram.com" target="_blank">Instagram</a>
          <a href="https://twitter.com" target="_blank">Twitter</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;