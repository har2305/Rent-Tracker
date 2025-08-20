import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import GroupsPage from "./pages/GroupsPage";
// other imports

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            {/* other routes */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
