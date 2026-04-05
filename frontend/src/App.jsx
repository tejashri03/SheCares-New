import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

import Navbar from "./components/Navbar";

import EnhancedHome from "./pages/EnhancedHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PeriodTracker from "./pages/PeriodTracker";
import EnhancedPCOS from "./pages/EnhancedPCOS";
import NutritionPage from "./pages/NutritionPage";
import Dashboard from "./pages/Dashboard";
import ReportPage from "./pages/ReportPage";
import Awareness from "./pages/Awareness";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<EnhancedHome />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/period-tracker" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <PeriodTracker />
            </>
          </ProtectedRoute>
        } />
        <Route path="/pcos" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <EnhancedPCOS />
            </>
          </ProtectedRoute>
        } />
        <Route path="/nutrition" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <NutritionPage />
            </>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        } />
        <Route path="/awareness" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Awareness />
            </>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <ReportPage />
            </>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;