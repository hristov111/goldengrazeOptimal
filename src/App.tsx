import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
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

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/" element={
                  <div>
                    <HomePage />
                    <Footer />
                  </div>
                } />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/product" element={
                  <div>
                    <ProductPage />
                    <Footer />
                  </div>
                } />
                <Route path="/products" element={
                  <div>
                    <ProductsPage />
                    <Footer />
                  </div>
                } />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/account-settings" element={<AccountSettingsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/order-detail/:orderNumber" element={<OrderDetailPage />} />
                <Route path="/help" element={<HelpPage />} />
                <Route path="/help-faq" element={<HelpFaqPage />} />
                <Route path="/help-contact" element={<HelpContactPage />} />
                <Route path="/support-tickets" element={<SupportTicketsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;