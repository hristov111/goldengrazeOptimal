import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import Order from './pages/Order';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import Footer from './components/Footer';
import HelpPage from './pages/HelpPage';
import HelpFaqPage from './pages/HelpFaqPage';
import HelpContactPage from './pages/HelpContactPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import Customers from './pages/admin/Customers';
import Analytics from './pages/admin/Analytics';
import Coupons from './pages/admin/Coupons';
import ProductDetailPage from './pages/ProductDetailPage';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// App content component that has access to auth context
const AppContent: React.FC = () => {
  const { isLoggedIn, user, signOut } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<string>('');

  return (
    <div className="min-h-screen bg-white">
      <Navigation
        isLoggedIn={isLoggedIn}
        user={user}
        onSignOut={signOut}
      />
      <Routes>
        <Route path="/" element={
          <div>
            <HomePage />
            <Footer />
          </div>
        } />
        <Route path="/order" element={<Order />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/product" element={
          <div>
            <ProductPage />
            <Footer />
          </div>
        } />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
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
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="coupons" element={<Coupons />} />
        </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Router>
                <AppContent />
              </Router>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;