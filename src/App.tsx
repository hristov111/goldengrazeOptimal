import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import Footer from './components/Footer';
import HelpPage from './pages/HelpPage';
import HelpFaqPage from './pages/HelpFaqPage';
import HelpContactPage from './pages/HelpContactPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const { isLoggedIn, user, isLoading, signIn, signUp, signOut } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success) {
      setCurrentPage('home');
    }
    return result;
  };

  const handleSignUp = async (fullName: string, email: string, password: string) => {
    const result = await signUp(fullName, email, password);
    if (result.success) {
      setCurrentPage('home');
    }
    return result;
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="flex justify-center mb-2">
            <img 
              src="/balm_images/Golder Graze.png" 
              alt="Golden Graze" 
              className="h-8 w-auto"
            />
          </div>
          <p className="text-amber-200 text-sm mt-2 tracking-wide">Nature's Richest Ritual</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        user={user}
        onSignOut={handleSignOut}
      />
      
      {currentPage === 'home' && (
        <div>
          <HomePage setCurrentPage={setCurrentPage} />
          <Footer />
        </div>
      )}
      {currentPage === 'product' && (
        <div>
          <ProductPage 
            setCurrentPage={setCurrentPage} 
            onSignIn={() => setCurrentPage('signin')}
            onSignUp={() => setCurrentPage('signup')}
          />
          <Footer />
        </div>
      )}
      {currentPage === 'products' && (
        <div>
          <ProductsPage setCurrentPage={setCurrentPage} />
          <Footer />
        </div>
      )}
      {currentPage === 'cart' && (
        <div>
          <CartPage setCurrentPage={setCurrentPage} />
        </div>
      )}
      {currentPage === 'wishlist' && (
        <div>
          <WishlistPage setCurrentPage={setCurrentPage} />
        </div>
      )}
      {currentPage === 'account-settings' && <AccountSettingsPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'signin' && <SignInPage setCurrentPage={setCurrentPage} onSignIn={handleSignIn} />}
      {currentPage === 'signup' && <SignUpPage setCurrentPage={setCurrentPage} onSignUp={handleSignUp} />}
      {currentPage === 'orders' && (
        <OrdersPage 
          setCurrentPage={setCurrentPage} 
          setSelectedOrder={setSelectedOrder}
        />
      )}
      {currentPage === 'order-detail' && selectedOrder && (
        <OrderDetailPage 
          setCurrentPage={setCurrentPage}
          orderNumber={selectedOrder}
        />
      )}
      {currentPage === 'help' && <HelpPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'help-faq' && <HelpFaqPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'help-contact' && <HelpContactPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'support-tickets' && (
        <SupportTicketsPage 
          setCurrentPage={setCurrentPage} 
          setSelectedTicket={setSelectedOrder}
        />
      )}
      {currentPage === 'support-ticket-detail' && selectedOrder && (
        <div>Support Ticket Detail Page - Coming Soon</div>
      )}
      {currentPage === 'privacy-policy' && <PrivacyPolicyPage setCurrentPage={setCurrentPage} />}
      {currentPage === 'terms-of-service' && <TermsOfServicePage setCurrentPage={setCurrentPage} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;