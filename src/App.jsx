import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DocProvider, useDocs } from './context/DocContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Search from './pages/Search';
import FileDetails from './pages/FileDetails';

import './App.css';

function MainLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isUploadOpen, openUpload, closeUpload } = useDocs();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/dashboard' || location.pathname === '/app') return 'Dashboard';
    if (location.pathname.startsWith('/files')) return 'My Documents';
    if (location.pathname.startsWith('/search')) return 'Search & AI Discovery';
    if (location.pathname.startsWith('/file/')) return 'Document Details';
    return 'DocFlow';
  };

  return (
    <div className="app-container">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        onOpenUpload={openUpload}
      />

      <div className="main-content">
        <Navbar
          title={getPageTitle()}
          onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          onOpenUpload={openUpload}
        />
        <main>{children}</main>
      </div>

      {/* Global Upload Modal connected to DocProvider */}
      <UploadModal isOpen={isUploadOpen} onClose={closeUpload} />
    </div>
  );
}

function AppRoutes() {
  const { openUpload } = useDocs();

  return (
    <Routes>
      {/* Root Route: Directed to Dashboard (Protected - requires login first) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard onOpenUpload={openUpload} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Public Login Route with Demo Credentials */}
      <Route path="/login" element={<Login />} />

      {/* Public Landing / Overview Page */}
      <Route path="/landing" element={<Landing />} />

      {/* Protected Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard onOpenUpload={openUpload} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard onOpenUpload={openUpload} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Files & Detail Routes */}
      <Route
        path="/files"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Files onOpenUpload={openUpload} />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Search />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/file/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FileDetails />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DocProvider>
          <AppRoutes />
        </DocProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
