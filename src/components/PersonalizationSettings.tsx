
import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Type, Layout, Paintbrush, Check, RefreshCcw } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

interface ThemePreviewProps {
  name: string;
  title: string;
  colors: string[];
  isActive: boolean;
  onClick: () => void;
}

const ThemePreview = ({ name, title, colors, isActive, onClick }: ThemePreviewProps) => (
  <div 
    onClick={onClick}
    className={`theme-preview ${isActive ? 'ring-2 ring-primary' : 'ring-1 ring-border'}`}
    role="radio"
    aria-checked={isActive}
    tabIndex={0}
  >
    <div className="flex space-x-2">
      {colors.map((color, index) => (
        <div key={index} className="theme-color-dot" style={{ backgroundColor: color }}></div>
      ))}
    </div>
    <div className="ml-2 flex-1">{title}</div>
    {isActive && <Check className="w-4 h-4 text-primary" />}
  </div>
);

export const PersonalizationSettings = () => {
  const { theme, fontSize, density, setTheme, setFontSize, setDensity, resetToDefaults } = useTheme();
  const { toast } = useToast();
  
  const handleThemeChange = (newTheme: "default" | "dark" | "high-contrast" | "purple" | "green") => {
    setTheme(newTheme);
    toast({
      title: "Theme updated",
      description: `Your theme has been set to ${newTheme}.`
    });
  };

  const handleFontSizeChange = (size: "small" | "medium" | "large" | "xlarge") => {
    setFontSize(size);
    toast({
      title: "Font size updated",
      description: `Your font size has been set to ${size}.`
    });
  };

  const handleDensityChange = (newDensity: "compact" | "default" | "spacious") => {
    setDensity(newDensity);
    toast({
      title: "Layout density updated",
      description: `Your layout density has been set to ${newDensity}.`
    });
  };

  const handleReset = () => {
    resetToDefaults();
    toast({
      title: "Settings reset",
      description: "All personalization settings have been reset to defaults."
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="content-card space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium">Personalization</h3>
        <button 
          onClick={handleReset}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          aria-label="Reset to defaults"
        >
          <RefreshCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>
      
      {/* Theme Selection */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Paintbrush className="w-5 h-5 mr-2 text-primary" />
          <h4 className="font-medium">Color Theme</h4>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <ThemePreview
            name="default"
            title="Default"
            colors={["#4B4E8E", "#F8F9FC", "#FFFFFF"]}
            isActive={theme === "default"}
            onClick={() => handleThemeChange("default")}
          />
          
          <ThemePreview
            name="dark"
            title="Dark Mode"
            colors={["#5D61AA", "#121212", "#1E1E1E"]}
            isActive={theme === "dark"}
            onClick={() => handleThemeChange("dark")}
          />
          
          <ThemePreview
            name="high-contrast"
            title="High Contrast"
            colors={["#3D41F5", "#FFFFFF", "#000000"]}
            isActive={theme === "high-contrast"}
            onClick={() => handleThemeChange("high-contrast")}
          />
          
          <ThemePreview
            name="purple"
            title="Purple"
            colors={["#8861DD", "#F8F6FF", "#FFFFFF"]}
            isActive={theme === "purple"}
            onClick={() => handleThemeChange("purple")}
          />
          
          <ThemePreview
            name="green"
            title="Green"
            colors={["#00A86B", "#F2FFF9", "#FFFFFF"]}
            isActive={theme === "green"}
            onClick={() => handleThemeChange("green")}
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Type className="w-5 h-5 mr-2 text-primary" />
          <h4 className="font-medium">Font Size</h4>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "xlarge", label: "X-Large" }
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => handleFontSizeChange(size.value as "small" | "medium" | "large" | "xlarge")}
              className={`p-2 border rounded-lg flex flex-col items-center transition-all ${
                fontSize === size.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
              aria-pressed={fontSize === size.value}
            >
              <span className={`font-medium ${
                size.value === "small" ? "text-xs" :
                size.value === "medium" ? "text-sm" :
                size.value === "large" ? "text-base" :
                "text-lg"
              }`}>
                {size.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">Aa</span>
            </button>
          ))}
        </div>
        
        <div className="px-3 py-2 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            This is a preview of your selected font size.
          </p>
        </div>
      </div>

      {/* Layout Density */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Layout className="w-5 h-5 mr-2 text-primary" />
          <h4 className="font-medium">Layout Density</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "compact", label: "Compact" },
            { value: "default", label: "Default" },
            { value: "spacious", label: "Spacious" }
          ].map((densityOption) => (
            <button
              key={densityOption.value}
              onClick={() => handleDensityChange(densityOption.value as "compact" | "default" | "spacious")}
              className={`p-3 border rounded-lg transition-all ${
                density === densityOption.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
              aria-pressed={density === densityOption.value}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">{densityOption.label}</span>
                <div className="mt-2 flex items-center justify-center w-full">
                  <div className={`${
                    densityOption.value === "compact" ? "w-16 h-1" :
                    densityOption.value === "default" ? "w-16 h-2" :
                    "w-16 h-3"
                  } bg-primary/20 rounded-full`}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
