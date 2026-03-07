import React from 'react';
import { Routes, Route } from "react-router-dom";

// Enhanced ClientDashboard with TITAN-OS
import ClientDashboard from "./dashboards/ClientDashboardNew";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ClientDashboard />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}
