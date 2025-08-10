import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServicePageProps {
  setCurrentPage: (page: string) => void;
}

const TermsOfServicePage: React.FC<TermsOfServicePageProps> = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 right-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
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
        </div>

        {/* Content */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-amber-100 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <header className="sticky top-0 bg-white/90 backdrop-blur-sm rounded-lg py-4 mb-8 border-b border-amber-200">
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900">Terms of Service — Golden Graze</h1>
          </header>

          <p className="text-stone-700 mb-4"><strong>Effective Date:</strong> January 1, 2024</p>
          <p className="text-stone-700 leading-relaxed mb-6">
            Welcome to <strong>Golden Graze</strong>. These Terms of Service ("Terms") govern your use of our website,
            mobile app, and related services ("Services"). By accessing or using our Services, you agree to these Terms.
            If you do not agree, do not use our Services.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">1. Eligibility</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            You must be at least 18 years old (or the age of majority in your jurisdiction) to create an account and make purchases.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">2. Accounts</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>You must provide accurate, complete information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You are responsible for all activities under your account.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">3. Orders & Payments</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>Prices are listed in USD and may change at any time.</li>
            <li>We may refuse or cancel orders for reasons including product availability, pricing errors, or suspected fraud.</li>
            <li>Payments are processed by secure third-party providers (e.g., Stripe, PayPal).</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">4. Shipping & Delivery</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>Delivery times are estimates, not guarantees.</li>
            <li>Risk of loss passes to you upon delivery.</li>
            <li>You are responsible for accurate shipping information.</li>
            <li>Free shipping is available on orders over $75 within the United States.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">5. Returns & Refunds</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Returns are accepted within 30 days of delivery, subject to our Return Policy. Refunds are issued to the original
            payment method after inspection of returned goods. Products must be in original condition with at least 75% remaining.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">6. Acceptable Use</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>Do not use our Services for unlawful purposes.</li>
            <li>Do not interfere with the operation of the site.</li>
            <li>Do not attempt to gain unauthorized access to systems or data.</li>
            <li>Do not post false reviews or engage in fraudulent activities.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">7. Intellectual Property</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            All content on our Services (text, images, logos, code) is the property of <strong>Golden Graze</strong> or its
            licensors and is protected by copyright and trademark laws. The Golden Graze name, logo, and "Nature's Richest Ritual" 
            are trademarks of Golden Graze LLC.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">8. Product Information & Disclaimers</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>Our tallow balms are cosmetic products and have not been evaluated by the FDA.</li>
            <li>Individual results may vary. Patch test before first use if you have sensitive skin.</li>
            <li>Our Services are provided "as is" without warranties of any kind.</li>
            <li>To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">9. Governing Law</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            These Terms are governed by the laws of Texas, United States, without regard to conflict of law principles.
            Any disputes will be resolved in the courts of Travis County, Texas.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">10. Changes to Terms</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We may update these Terms from time to time. Continued use of the Services after changes means you accept the new Terms.
            We will notify you of material changes via email or prominent notice on our website.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">11. Contact Us</h2>
          <p className="text-stone-700 leading-relaxed mb-2">
            If you have questions about these Terms of Service, contact us at:
          </p>
          <ul className="list-disc pl-6 text-stone-700 mb-8 space-y-1">
            <li><strong>Email:</strong> goldengraze1@outlook.com</li>
          </ul>

          <button
            onClick={() => setCurrentPage('home')}
            className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
          >
            BACK TO HOME
          </button>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;