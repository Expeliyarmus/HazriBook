import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { NavScreen } from './types';
import MainLayout from './components/Layout/MainLayout';
import LoginScreen from './components/Auth/LoginScreen';
import DashboardScreen from './components/Dashboard/DashboardScreen';
import AttendanceScreen from './components/Attendance/AttendanceScreen';
import StudentsScreen from './components/Students/StudentsScreen';
import ReportsScreen from './components/Reports/ReportsScreen';

// Main App Content
function AppContent() {
  const { state } = useApp();
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');

  // Show login if not authenticated
  if (!state.isAuthenticated) {
    return <LoginScreen />;
  }

  // Render screen based on navigation
  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'students':
        return <StudentsScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <MainLayout currentScreen={currentScreen} onScreenChange={setCurrentScreen}>
      {renderScreen()}
    </MainLayout>
  );
}

// Main App Component
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
