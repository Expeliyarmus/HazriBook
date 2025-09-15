import React, { useState } from 'react';
import { Home, Camera, Users, BarChart3, Menu, LogOut } from 'lucide-react';
import { NavScreen } from '../../types';
import { useApp } from '../../context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  currentScreen: NavScreen;
  onScreenChange: (screen: NavScreen) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentScreen, onScreenChange }) => {
  const { state, logout, setError } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const navigationItems = [
    { id: 'dashboard' as NavScreen, label: 'Dashboard', icon: Home },
    { id: 'attendance' as NavScreen, label: 'Attendance', icon: Camera },
    { id: 'students' as NavScreen, label: 'Students', icon: Users },
    { id: 'reports' as NavScreen, label: 'Reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">HazriBook</h1>
            {state.school && <p className="text-sm text-gray-600">{state.school.name}</p>}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{state.school?.teacherName}</p>
                  <p className="text-xs text-gray-600">Teacher</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Loading Overlay */}
        {state.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-600 border-t-transparent"></div>
              <span className="text-gray-900">Loading...</span>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {state.error && (
          <div className="fixed top-20 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
            <span className="text-sm">{state.error}</span>
            <button onClick={() => setError(null)} className="ml-3 text-white hover:text-red-200">
              ×
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 py-1 safe-bottom">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                aria-label={item.label}
              >
                <Icon
                  className={`w-6 h-6 mb-1 ${isActive ? 'text-primary-600' : 'text-gray-400'}`}
                />
                <span
                  className={`text-xs ${
                    isActive ? 'text-primary-600 font-medium' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
