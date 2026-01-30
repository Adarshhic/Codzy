import { Routes, Route, Navigate } from "react-router";
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
import StudyGroups from "./pages/StudyGroups"; // ⭐ NEW
import GroupDetail from "./pages/GroupDetail"; // ⭐ NEW
import LiveSession from "./pages/LiveSession"; // ⭐ NEW
import { Toaster } from 'react-hot-toast'; // ⭐ NEW

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
    <>
      {/* ⭐ Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" replace />}
        />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route 
          path="/signup" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
        />

        {/* Admin routes */}
        <Route 
          path="/admin" 
          element={isAuthenticated && user?.role === 'Admin' ? <Admin /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/create" 
          element={isAuthenticated && user?.role === 'Admin' ? <AdminPanel /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/delete" 
          element={isAuthenticated && user?.role === 'Admin' ? <AdminDelete /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/admin/video" 
          element={isAuthenticated && user?.role === 'Admin' ? <AdminVideo /> : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/upload/:problemId" 
          element={isAuthenticated && user?.role === 'Admin' ? <AdminUpload /> : <Navigate to="/" />} 
        />
        
        {/* Problem routes */}
        <Route 
          path="/problem/:problemId" 
          element={isAuthenticated ? <ProblemPage /> : <Navigate to="/login" replace />}
        />

        {/* ⭐ Study Group routes */}
        <Route 
          path="/study-groups" 
          element={isAuthenticated ? <StudyGroups /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/study-groups/:groupId" 
          element={isAuthenticated ? <GroupDetail /> : <Navigate to="/login" replace />}
        />
        <Route 
          path="/study-groups/:groupId/session/:sessionId" 
          element={isAuthenticated ? <LiveSession /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </>
  );
}

export default App;