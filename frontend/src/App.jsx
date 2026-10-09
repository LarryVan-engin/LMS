import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TestPage from './pages/TestPage';

// Component bảo vệ Route: Kiểm tra role trực tiếp tại thời điểm truy cập
const ProtectedRoute = ({ allowedRole, children }) => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/client'} replace />;
  }

  return children;
};

// Điều hướng trang gốc "/"
const RootRedirect = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/login" replace />;
  return <Navigate to={role === 'admin' ? '/admin' : '/client'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/client" 
          element={
            <ProtectedRoute allowedRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/test" 
          element={
            <ProtectedRoute allowedRole="client">
              <TestPage />
            </ProtectedRoute>
          } 
        />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
