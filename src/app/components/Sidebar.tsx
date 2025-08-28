"use client";

import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import Link from "next/link";
import Image from "next/image";

interface MenuItem {
  name: string;
  icon: string;
  key: string; // Use key instead of href for state navigation
}

interface User {
  name: string;
  username: string;
  avatar: string;
}

interface SidebarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  activePage = "videos",
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>(activePage);

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: "📊", key: "dashboard" },
    { name: "Videos", icon: "🎬", key: "videos" },
    { name: "Processed Videos", icon: "⚡", key: "processed" },
    { name: "Process Video", icon: "🔄", key: "process" },
    { name: "Templates", icon: "📋", key: "templates" },
    { name: "Profiles", icon: "👥", key: "profiles" },
    { name: "Settings", icon: "⚙️", key: "settings" },
    { name: "Help", icon: "💬", key: "help" },
  ];

  const user: User = {
    name: "Ganta Kaushik",
    username: "@kaushik123",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update active item when activePage prop changes
  useEffect(() => {
    setActiveItem(activePage);
  }, [activePage]);

  const handleMenuClick = (item: MenuItem) => {
    setActiveItem(item.name);
    onNavigate?.(item.key);
    // Auto-close mobile menu after selection
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Handle logout logic here
    // You can use router.push('/login') to redirect after logout
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="sidebar-container">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && !mobileMenuOpen && (
        <button
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isMobile ? "mobile" : ""} ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        {/* Header with Logo */}
        <div className="sidebar-header">
              <Link href="/" className="logo-brand">
                <Image
                  src="/Videometrics.png" // place your logo in /public/logo.png
                  alt="Videometrics Logo"
                  width={200} // adjust size
                  height={60}
                  priority
                />
              </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main Menu</div>

            {menuItems.slice(0, 4).map((item: MenuItem) => (
              <div
                key={item.name}
                className={`nav-item ${
                  activeItem === item.name ? "active" : ""
                }`}
                onClick={() => handleMenuClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMenuClick(item);
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.name}</span>
              </div>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Tools & Settings</div>

            {menuItems.slice(4).map((item: MenuItem) => (
              <div
                key={item.name}
                className={`nav-item ${
                  activeItem === item.name ? "active" : ""
                }`}
                onClick={() => handleMenuClick(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMenuClick(item);
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.name}</span>
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name
                    .split(" ")
                    .map((n) => n.charAt(0))
                    .join("")
                    .toUpperCase()}
                </div>
              )}
              <div className="status-indicator online" />
            </div>

            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-username">{user.username}</div>
            </div>

            <div className="user-actions">
              <button
                className="logout-btn"
                onClick={handleLogout}
                title="Logout"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 2H3C2.45 2 2 2.45 2 3V13C2 13.55 2.45 14 3 14H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10 11L13 8L10 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 8H6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
