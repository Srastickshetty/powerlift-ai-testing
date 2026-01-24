import { BrowserRouter, Routes, Route } from "react-router-dom";
import CoachDashboard from "../dashboards/CoachDashboard";
import AthleteDetail from "../pages/AthleteDetail";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CoachDashboard />} />
        <Route path="/athlete/:athleteId" element={<AthleteDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
