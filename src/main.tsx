
import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Global Error:", {
    message,
    source,
    lineno,
    colno,
    error
  });
  return false;
};

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", function(event) {
  console.error("Unhandled Promise Rejection:", event.reason);
});

// Log initialization
console.log("Application Initializing");

try {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element not found");
  }

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log("Application Mounted Successfully");
} catch (error) {
  console.error("Critical Mounting Error:", error);
  
  // Show error to user
  document.body.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        max-width: 500px;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #dc2626; margin: 0 0 10px;">Application Error</h2>
        <p style="margin: 0 0 15px;">The application failed to start. Please try refreshing the page.</p>
        <pre style="
          background: #f3f4f6;
          padding: 10px;
          border-radius: 4px;
          overflow: auto;
          font-size: 12px;
        ">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    </div>
  `;
}
