import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

// 🛡️ Strict Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // If no user is logged in, forcefully redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role validation
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'Student') return <Navigate to="/student" replace />;
    if (user.role === 'Driver') return <Navigate to="/driver" replace />;
    if (user.role === 'TransportAdmin') return <Navigate to="/admin" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default Route goes straight to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Locked Student Dashboard */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Locked Driver Console */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute allowedRoles={['Driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Locked Principal / Admin Console */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['TransportAdmin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback for any unknown path */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}