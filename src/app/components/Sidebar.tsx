"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import UserApiService from "@/helpers/service/user/user-api-service";

// Material-UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import BoltIcon from '@mui/icons-material/Bolt';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  key: string;
}

interface User {
  name: string;
  username: string;
  email: string;
  avatar: string;
  fullName: string;
  profileImage: string;
}

interface SidebarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
}

// Custom hook for responsive behavior
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  return screenSize;
};

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  activePage = "videos",
}) => {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop, width } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>(activePage);
  const [user, setUser] = useState<User>({
    name: "Loading...",
    username: "@loading",
    email: "",
    avatar: "",
    fullName: "Loading...",
    profileImage: "",
  });
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string>("");

  const menuItems: MenuItem[] = [
    { name: "Dashboard", icon: DashboardIcon, key: "dashboard" },
    { name: "Videos", icon: VideoLibraryIcon, key: "videos" },
    { name: "Processed Videos", icon: BoltIcon, key: "processed" },
    { name: "Process Video", icon: RefreshIcon, key: "process" },
    { name: "Templates", icon: AssignmentIcon, key: "templates" },
    { name: "Profiles", icon: PeopleIcon, key: "profiles" },
    { name: "Settings", icon: SettingsIcon, key: "settings" },
    { name: "Help", icon: HelpIcon, key: "help" },
  ];

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        setUserError("");
        
        const userApiService = new UserApiService();
        const userData = await userApiService.getCurrentUser();

        // Map the API response similar to SettingsPage
        setUser({
          name: userData.full_name || userData.name || "Unknown User",
          username: userData.username ? `@${userData.username}` : "@user",
          email: userData.email || "",
          avatar: userData.avatar || userData.profile_picture || userData.profile_image || "",
          fullName: userData.full_name || userData.name || "Unknown User",
          profileImage: userData.profile_image || userData.profile_picture || userData.avatar || "",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setUserError("Failed to load user data");
        
        // Set fallback user data
        setUser({
          name: "User",
          username: "@user",
          email: "",
          avatar: "",
          fullName: "User",
          profileImage: "",
        });
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Function to get user initials like in SettingsPage
  const getInitials = (name: string) => {
    if (!name || name === "Loading...") return "US";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Auto-close mobile menu when screen size changes
  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, mobileMenuOpen]);

  // Update active item when activePage prop changes
  useEffect(() => {
    setActiveItem(activePage);
  }, [activePage]);

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileMenuOpen) {
        const sidebar = document.querySelector('[data-sidebar="true"]');
        const menuBtn = document.querySelector('[data-mobile-menu="true"]');

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          menuBtn &&
          !menuBtn.contains(event.target as Node)
        ) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, mobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobile && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobile, mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, mobileMenuOpen]);

  const handleMenuClick = useCallback(
    (item: MenuItem) => {
      setActiveItem(item.key);
      onNavigate?.(item.key);

      if (isMobile) {
        setMobileMenuOpen(false);
      }
    },
    [isMobile, onNavigate]
  );

  const handleLogout = useCallback(() => {
    console.log("Logging out...");

    // Handle window closing or redirect
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(
        {
          type: "LOGOUT",
        },
        "http://172.174.114.7/"
      );

      

      window.opener.focus();
      window.close();
    } else {
      window.location.href = "'http://172.174.114.7/";
    }
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  // Handle profile click - navigate to settings
  const handleProfileClick = useCallback(() => {
    setActiveItem("settings");
    onNavigate?.("settings");
    
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile, onNavigate]);

  return (
    <div className="relative">
      {/* Mobile spacing div to prevent content collision */}
      {isMobile && !mobileMenuOpen && <div className="h-20 w-full md:hidden" />}

      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setMobileMenuOpen(false);
            }
          }}
          aria-label="Close menu overlay"
        />
      )}

      {/* Mobile Menu Button */}
      {isMobile && !mobileMenuOpen && (
        <button
          data-mobile-menu="true"
          className="fixed top-4 left-4 z-50 bg-white shadow-lg border border-gray-200 rounded-lg p-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Open navigation menu"
          aria-expanded="false"
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
        data-sidebar="true"
        className={`
          ${isMobile ? "fixed" : "fixed"} 
          ${
            isMobile && !mobileMenuOpen ? "-translate-x-full" : "translate-x-0"
          } 
          ${isMobile ? "top-0 left-0 w-80 z-50" : "top-0 left-0 w-64"} 
          border-r border-gray-200 flex flex-col 
          transition-transform duration-300 ease-in-out 
          shadow-xl md:shadow-none
        `}
        style={{
          background:
            "linear-gradient(135deg, #f5f3ff 0%, #d0d0d8 50%, #8870c2 100%)",
          height: "100vh",
          minHeight: "100vh",
          maxHeight: "100vh",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="block">
            <Image
              src="/Videometrics.png"
              alt="Videometrics Logo"
              width={width < 480 ? 160 : width < 768 ? 180 : 200}
              height={width < 480 ? 48 : width < 768 ? 54 : 60}
              priority
              className="max-w-full h-auto"
            />
          </Link>

          {/* Close button for mobile */}
          {isMobile && mobileMenuOpen && (
            <button
              className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation - Takes up all available space between header and footer */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="mb-8">
            <div className="px-6 mb-3 text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Main Menu
            </div>

            {menuItems.slice(0, 4).map((item: MenuItem) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  className={`
                    relative mx-3 mb-1 px-3 py-3 rounded-lg cursor-pointer
                    transition-all duration-200 ease-in-out
                    hover:bg-gray-50 active:bg-gray-100
                    ${
                      activeItem === item.key
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700 hover:text-gray-900"
                    }
                    flex items-center group
                  `}
                  onClick={() => handleMenuClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleMenuClick(item);
                    }
                  }}
                  aria-pressed={activeItem === item.key}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <IconComponent 
                    className={`
                      mr-3 transition-all duration-200 group-hover:scale-110
                      ${activeItem === item.key ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'}
                    `}
                    sx={{ fontSize: 20 }}
                  />
                  <span className="font-medium">{item.name}</span>
                  {activeItem === item.key && (
                    <div
                      className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="px-6 mb-3 text-xs font-semibold text-purple-800 uppercase tracking-wider">
              Tools & Settings
            </div>

            {menuItems.slice(4).map((item: MenuItem) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.key}
                  className={`
                    relative mx-3 mb-1 px-3 py-3 rounded-lg cursor-pointer
                    transition-all duration-200 ease-in-out
                    hover:bg-gray-50 active:bg-gray-100
                    ${
                      activeItem === item.key
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-gray-700 hover:text-gray-900"
                    }
                    flex items-center group
                  `}
                  onClick={() => handleMenuClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleMenuClick(item);
                    }
                  }}
                  aria-pressed={activeItem === item.key}
                  aria-label={`Navigate to ${item.name}`}
                >
                  <IconComponent 
                    className={`
                      mr-3 transition-all duration-200 group-hover:scale-110
                      ${activeItem === item.key ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-800'}
                    `}
                    sx={{ fontSize: 20 }}
                  />
                  <span className="font-medium">{item.name}</span>
                  {activeItem === item.key && (
                    <div
                      className="absolute right-3 w-2 h-2 bg-blue-500 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile - Fixed at bottom */}
        <div className="border-t border-gray-100 p-4 flex-shrink-0 mt-auto">
          {userError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600">{userError}</p>
            </div>
          )}
          
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors duration-200"
            onClick={handleProfileClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleProfileClick();
              }
            }}
            aria-label="Go to profile settings"
            title="Click to view profile settings"
          >
            <div className="relative flex-shrink-0">
              {userLoading ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-gray-500 text-xs">...</span>
                </div>
              ) : (
                <>
                  {user.profileImage || user.avatar ? (
                    <img
                      src={user.profileImage || user.avatar}
                      alt={`${user.fullName} profile picture`}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                        if (fallbackDiv) {
                          fallbackDiv.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  
                  <div 
                    className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ 
                      display: (!user.profileImage && !user.avatar) ? 'flex' : 'none' 
                    }}
                  >
                    {getInitials(user.fullName)}
                  </div>
                </>
              )}
              
              {!userLoading && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"
                  aria-label="Online status"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium text-gray-900"
                title={user.fullName}
              >
                {user.fullName}
              </div>
              <div
                className="text-xs text-gray-600"
                title={user.username}
              >
                {user.username}
              </div>
              {user.email && (
                <div
                  className="text-xs text-gray-500"
                  title={user.email}
                >
                  {user.email}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleProfileClick();
                }}
                title="Profile Settings"
                aria-label="Profile settings"
              >
                <SettingsIcon sx={{ fontSize: 16 }} />
              </button>
              
              <button
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                title="Logout"
                disabled={userLoading}
                aria-label="Logout from account"
              >
                <LogoutIcon sx={{ fontSize: 16 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;