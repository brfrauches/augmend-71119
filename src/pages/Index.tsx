
import { motion } from "framer-motion";
import { useState } from "react";
import { Heart, Settings, BookOpen, Award, MessageCircle, Activity } from "lucide-react"; 
import { Link } from "react-router-dom";
import { BookmarkedContent } from "@/components/BookmarkedContent";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { ContentLibrary } from "@/components/ContentLibrary";
import { Notifications } from "@/components/Notifications";
import { WellnessToolkit } from "@/components/WellnessToolkit";
import { PersonalizationSettings } from "@/components/PersonalizationSettings";
import { useTheme } from "@/contexts/ThemeContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { isSettingsPanelOpen, toggleSettingsPanel } = useTheme();

  const featureCards = [
    {
      title: "Daily Reflection",
      description: "Record your thoughts and track your emotional wellbeing",
      icon: BookOpen,
      path: "/reflection-journal",
      color: "bg-primary/10 text-primary"
    },
    {
      title: "Wellness Center",
      description: "Track your sleep, meditation, and overall wellness journey",
      icon: Activity,
      path: "/wellness-center",
      color: "bg-indigo-500/10 text-indigo-500"
    },
    {
      title: "Achievements",
      description: "Track your health milestones and celebrate progress",
      icon: Award,
      path: "/achievements", // Updated to point to the dedicated page
      color: "bg-attention/10 text-attention"
    },
    {
      title: "Health Assistant",
      description: "Get personalized guidance and answers to health questions",
      icon: MessageCircle,
      path: "/health-assistant",
      color: "bg-optimal/10 text-optimal"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Top Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gradient">
                AugMend Health
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleSettingsPanel}
                className="p-2 rounded-full frosted-glass"
                aria-label="Personalize Dashboard"
              >
                <Settings className="w-5 h-5 text-foreground/70" />
              </button>
              <Notifications />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-screen-xl mx-auto">
        <div className="relative">
          {isSettingsPanelOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-medium text-gradient">Personalization Settings</h2>
                <button 
                  onClick={toggleSettingsPanel}
                  className="px-4 py-2 rounded-lg frosted-glass"
                >
                  Back to Dashboard
                </button>
              </div>
              <PersonalizationSettings />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {activeTab === "dashboard" && (
                <>
                  <ProgressDashboard />
                  <div className="mt-8">
                    <h2 className="text-2xl font-medium text-gradient mb-4">Featured Tools</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {featureCards.map((card) => (
                        <Link key={card.title} to={card.path}>
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="content-card h-full"
                          >
                            <div className={`p-3 rounded-full w-12 h-12 mb-4 flex items-center justify-center ${card.color}`}>
                              <card.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">{card.title}</h3>
                            <p className="text-muted-foreground text-sm">{card.description}</p>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {activeTab === "toolkit" && <WellnessToolkit />}
              {activeTab === "library" && <ContentLibrary />}
              {activeTab === "bookmarks" && <BookmarkedContent />}
            </motion.div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 glassmorphism border-t border-white/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-4 gap-1 p-2 max-w-screen-xl mx-auto">
          <button
            onClick={() => { setActiveTab("dashboard"); if (isSettingsPanelOpen) toggleSettingsPanel(); }}
            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
              activeTab === "dashboard" && !isSettingsPanelOpen
                ? "nav-item-active"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="text-xs mt-1">Dashboard</span>
          </button>

          <button
            onClick={() => { setActiveTab("toolkit"); if (isSettingsPanelOpen) toggleSettingsPanel(); }}
            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
              activeTab === "toolkit" && !isSettingsPanelOpen
                ? "nav-item-active"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs mt-1">Toolkit</span>
          </button>

          <button
            onClick={() => { setActiveTab("library"); if (isSettingsPanelOpen) toggleSettingsPanel(); }}
            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
              activeTab === "library" && !isSettingsPanelOpen
                ? "nav-item-active"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-xs mt-1">Library</span>
          </button>

          <button
            onClick={() => { setActiveTab("bookmarks"); if (isSettingsPanelOpen) toggleSettingsPanel(); }}
            className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 ${
              activeTab === "bookmarks" && !isSettingsPanelOpen
                ? "nav-item-active"
                : "text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span className="text-xs mt-1">Bookmarks</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;
