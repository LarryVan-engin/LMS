import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import TestPage from './pages/TestPage';

function App() {
  const role = localStorage.getItem('role');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/client" element={role === 'client' ? <ClientDashboard /> : <Navigate to="/login" />} />
        <Route path="/test" element={role === 'client' ? <TestPage /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={role ? `/${role}` : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
