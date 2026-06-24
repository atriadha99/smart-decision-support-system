import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CaseManagement from './pages/CaseManagement';
import CriteriaManagement from './pages/CriteriaManagement';
import AlternativeManagement from './pages/AlternativeManagement';
import ScoringMatrix from './pages/ScoringMatrix';
import CalculationPage from './pages/CalculationPage';
import LoginPage from './pages/LoginPage';

// Admin Route Guard
function AdminRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-darkBg">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DatabaseProvider>
            <Routes>
              
              {/* Standalone Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Public Protected Layout Routes */}
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/calculate" element={<Layout><CalculationPage /></Layout>} />

              {/* Admin Protected CRUD Layout Routes */}
              <Route 
                path="/studies" 
                element={
                  <AdminRoute>
                    <Layout><CaseManagement /></Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/criteria" 
                element={
                  <AdminRoute>
                    <Layout><CriteriaManagement /></Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/alternatives" 
                element={
                  <AdminRoute>
                    <Layout><AlternativeManagement /></Layout>
                  </AdminRoute>
                } 
              />
              <Route 
                path="/scores" 
                element={
                  <AdminRoute>
                    <Layout><ScoringMatrix /></Layout>
                  </AdminRoute>
                } 
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </DatabaseProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}
