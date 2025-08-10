import React, { useEffect, useState } from 'react';
import { ArrowLeft, Settings, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import ProfileForm from '../components/settings/ProfileForm';
import EmailForm from '../components/settings/EmailForm';
import PasswordForm from '../components/settings/PasswordForm';

interface AccountSettingsPageProps {
  setCurrentPage: (page: string) => void;
}

const AccountSettingsPageContent: React.FC<AccountSettingsPageProps> = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { isLoggedIn, user, isLoading } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !isLoggedIn) {
      setCurrentPage('signin');
      return;
    }

    if (isLoggedIn) {
      setIsVisible(true);
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoggedIn, isLoading, setCurrentPage]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not logged in (will redirect)
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className={`transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-8 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Home</span>
          </button>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                <Settings size={24} className="text-white" />
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-stone-900">Account Settings</h1>
            </div>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              Manage your profile information, email address, and security settings for your Golden Graze account.
            </p>
            <div className="w-24 h-0.5 bg-amber-400 mx-auto mt-6"></div>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="space-y-8">
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <ProfileForm />
          </div>

          <div className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <EmailForm />
          </div>

          <div className={`transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <PasswordForm />
          </div>
        </div>

        {/* Additional Links */}
        <div className={`mt-12 transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
            <h3 className="font-serif text-xl text-stone-900 mb-4">Additional Settings</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  // TODO: Implement sessions & security page
                  alert('Sessions & Security page coming soon!');
                }}
                className="flex items-center justify-between w-full p-3 text-left hover:bg-stone-50 rounded-lg transition-colors group"
              >
                <div>
                  <div className="font-medium text-stone-800">Sessions & Security</div>
                  <div className="text-sm text-stone-600">Manage active sessions and security settings</div>
                </div>
                <ExternalLink size={16} className="text-stone-400 group-hover:text-amber-600 transition-colors" />
              </button>
              
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center justify-between w-full p-3 text-left hover:bg-stone-50 rounded-lg transition-colors group"
              >
                <div>
                  <div className="font-medium text-stone-800">Order History</div>
                  <div className="text-sm text-stone-600">View your past orders and tracking information</div>
                </div>
                <ExternalLink size={16} className="text-stone-400 group-hover:text-amber-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = (props) => {
  return (
    <ToastProvider>
      <AccountSettingsPageContent {...props} />
    </ToastProvider>
  );
};

export default AccountSettingsPage;