import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./components/AuthContext";

import Navbar from "./components/Navbar";

import EnhancedHome from "./pages/EnhancedHome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PeriodTracker from "./pages/PeriodTracker";
import EnhancedPCOS from "./pages/EnhancedPCOS";
import NutritionPage from "./pages/NutritionPage";
import FitnessPage from "./pages/FitnessPage";
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

function ProtectedLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="md:pl-72">{children}</main>
    </div>
  );
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
            <ProtectedLayout>
              <PeriodTracker />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/pcos" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <EnhancedPCOS />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/nutrition" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <NutritionPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/fitness" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <FitnessPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/awareness" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Awareness />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
        <Route path="/report" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <ReportPage />
            </ProtectedLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;