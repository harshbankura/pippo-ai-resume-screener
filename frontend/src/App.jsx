import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import ChatBot from "./components/ChatBot";
import Dashboard from "./components/Dashboard";
import { useCandidateContext } from "./contexts/CandidateContext";
import './App.css';

function App() {
  const [view, setView] = useState("chat");
  const { dispatch } = useCandidateContext();

  useEffect(() => {
    const handleNavigation = () => setView("dashboard");
    window.addEventListener('navigate-to-dashboard', handleNavigation);
    return () => window.removeEventListener('navigate-to-dashboard', handleNavigation);
  }, []);

  const handleReset = async () => {
    if (!window.confirm('This will permanently delete ALL candidates from the database. Are you absolutely sure?')) return;
    
    try {
      // FIXED: Use correct API endpoint with proper error handling
      const response = await axios.post('http://localhost:8000/api/v1/reset');
      
      if (response.data.status === 'success') {
        dispatch({ type: 'RESET_CANDIDATES' });
        alert(`✅ Reset Complete!\n${response.data.message}`);
        
        // Refresh dashboard if currently viewing it
        if (view === 'dashboard') {
          window.location.reload();
        }
      } else {
        throw new Error(response.data.message || 'Reset failed');
      }
      
    } catch (error) {
      console.error('Reset failed:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error occurred';
      alert(`❌ Reset Failed:\n${errorMessage}`);
    }
  };

  return (
    <div> 
      <nav className="custom-navbar">
        <img 
          src="/img/Pippo.png" 
          alt="PIPPO Logo" 
          className="logo-standalone"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="nav-btn-group">
          <button
            className={`nav-btn${view === "chat" ? " selected" : ""}`}
            onClick={() => setView("chat")}
            aria-label="Switch to ChatBot view"
          >
            ChatBot
          </button>
          <button
            className={`nav-btn${view === "dashboard" ? " selected" : ""}`}
            onClick={() => setView("dashboard")}
            aria-label="Switch to Dashboard view"
          >
            Dashboard
          </button>
          <button 
            className="reset-btn" 
            onClick={handleReset}
            title="Reset All Candidate Data"
            aria-label="Reset System"
          >
            <i className="fi fi-bs-rotate-reverse"></i>
          </button>
        </div>
      </nav>
      <main className="content-area">
        {view === "chat" && <ChatBot />}
        {view === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}

export default App;
