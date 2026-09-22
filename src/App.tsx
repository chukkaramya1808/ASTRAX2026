import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ArenaCompetitions } from './components/ArenaCompetitions';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminModal } from './components/AdminModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { AdminUser } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('BOT - ARENA');

  // Check saved admin session on startup
  useEffect(() => {
    const savedToken = localStorage.getItem('astra_admin_token');
    const savedUser = localStorage.getItem('astra_admin_user');
    if (savedToken && savedUser) {
      // Verify token with backend
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => {
          if (res.ok) {
            setAdminUser({ username: savedUser, token: savedToken });
          } else {
            localStorage.removeItem('astra_admin_token');
            localStorage.removeItem('astra_admin_user');
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setAdminModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    if (adminUser?.token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminUser.token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('astra_admin_token');
    localStorage.removeItem('astra_admin_user');
    setAdminUser(null);
    setCurrentView('home');
  };

  const scrollToRegistration = () => {
    const el = document.getElementById('registration-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToArenas = () => {
    const el = document.getElementById('arenas-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCompetitionFromArena = (compName: string) => {
    setSelectedCompetition(compName);
    scrollToRegistration();
  };

  // If in Admin Dashboard view, render the dedicated dashboard (only admin can view registrations)
  if (currentView === 'dashboard' && adminUser) {
    return (
      <AdminDashboard
        adminUser={adminUser}
        onLogout={handleLogout}
        onBackToSite={() => setCurrentView('home')}
      />
    );
  }

  return (
    <div className="site-bg circuit-overlay flex flex-col min-h-screen text-[#FAF5EE]">
      
      {/* College Header (Beside logo/college name competitions button removed, registration removed so it shows in one place only) */}
      <Header
        onOpenAdmin={() => setAdminModalOpen(true)}
        isAdminLoggedIn={!!adminUser}
        onOpenDashboard={() => setCurrentView('dashboard')}
      />

      {/* Main Content Flow: 1. Event Name -> 2. Six Competitions Details -> 3. Student Registration (in ONE place only!) */}
      <main className="flex-1">
        {/* 1. First Event Name */}
        <Hero />

        {/* 2. Six Competitions Details */}
        <ArenaCompetitions
          onSelectCompetition={handleSelectCompetitionFromArena}
          selectedCompetition={selectedCompetition}
        />

        {/* 3. Student Registration (Cleanly rendered in ONE single place) */}
        <RegistrationForm
          preselectedCompetition={selectedCompetition}
        />
      </main>

      {/* College & Event Footer */}
      <Footer
        onOpenAdmin={() => setAdminModalOpen(true)}
        onScrollToTop={scrollToTop}
      />

      {/* Admin Login Modal (Restricted to Ramya & Varshu with aiastra123) */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

    </div>
  );
}
