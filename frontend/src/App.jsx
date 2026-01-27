import { Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/Dashboard.jsx";
import Homepage from "./pages/Homepage.jsx";
import LoginPage from "./pages/Login.jsx";
import SignupPage from "./pages/Signup.jsx";
import { checkAuth } from "./authSlice.js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import Admin from "./pages/Admin"; 
import AdminDelete from "./components/AdminDelete";
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Check authentication status on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />

      {/* Protected Dashboard route - Both users and admins land here after login */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      
      {/* Redirect root to dashboard if authenticated, otherwise to signup */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup" replace />}
      />

      {/* Problems Homepage - Accessible to all authenticated users */}
      <Route 
        path="/problems" 
        element={isAuthenticated ? <Homepage /> : <Navigate to="/login" replace />}
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={isAuthenticated && user?.role === 'Admin' ? <Admin /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/admin/create" 
        element={isAuthenticated && user?.role === 'Admin' ? <AdminPanel /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/admin/delete" 
        element={isAuthenticated && user?.role === 'Admin' ? <AdminDelete /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/admin/video" 
        element={isAuthenticated && user?.role === 'Admin' ? <AdminVideo /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/admin/upload/:problemId" 
        element={isAuthenticated && user?.role === 'Admin' ? <AdminUpload /> : <Navigate to="/dashboard" replace />} 
      />
      
      {/* Problem routes */}
      <Route 
        path="/problem/:problemId" 
        element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;