import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { SharkLogo } from './components/SharkLogo';

const MainApp: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-cyan-100 flex flex-col items-center justify-center font-['Inter',sans-serif]">
        <div className="p-8 rounded-3xl bg-white/90 shadow-xl border border-sky-100 flex flex-col items-center gap-4 animate-pulse">
          <SharkLogo size="lg" />
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
            <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Menghubungkan ke Database Firebase Firestore...</span>
          </div>
        </div>
      </div>
    );
  }

  // Login form is default view for non-logged in users
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <DataProvider>
      <Dashboard />
    </DataProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
