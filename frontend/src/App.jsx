import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import URLChecker from './pages/URLChecker';
import PolicyManagement from './pages/PolicyManagement';
import Logs from './pages/Logs';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) return <Navigate to={role === 'admin' ? '/' : '/checker'} />;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute roles={['admin']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/checker" element={
          <ProtectedRoute roles={['admin', 'student']}>
            <URLChecker />
          </ProtectedRoute>
        } />
        
        <Route path="/policies" element={
          <ProtectedRoute roles={['admin']}>
            <PolicyManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/logs" element={
          <ProtectedRoute roles={['admin']}>
            <Logs />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
