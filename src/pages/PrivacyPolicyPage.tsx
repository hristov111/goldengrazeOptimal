import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  setCurrentPage: (page: string) => void;
}

const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ setCurrentPage }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
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
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900">Privacy Policy — Golden Graze</h1>
          </header>

          <p className="text-stone-700 mb-4"><strong>Effective Date:</strong> January 1, 2024</p>
          <p className="text-stone-700 leading-relaxed mb-6">
            At <strong>Golden Graze</strong> ("we," "our," "us"), we value your privacy. This Privacy Policy explains how we
            collect, use, and protect your personal information when you use our website, mobile application, and related
            services ("Services").
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">1. Information We Collect</h2>
          <p className="text-stone-700 leading-relaxed mb-2">We may collect the following types of information:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li><strong>Account Information:</strong> Name, email address, password, billing/shipping address.</li>
            <li><strong>Payment Information:</strong> Payment method details processed by third-party providers (e.g., Stripe). We do not store full card numbers.</li>
            <li><strong>Order Information:</strong> Products purchased, order history, tracking details.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, device info, operating system, and cookies.</li>
            <li><strong>Communications:</strong> Messages sent to customer support, reviews, and other correspondence.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li>Process and deliver orders</li>
            <li>Manage your account</li>
            <li>Provide customer support</li>
            <li>Personalize your shopping experience</li>
            <li>Send order updates and promotional emails (if opted in)</li>
            <li>Improve our Services, analytics, and security</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">3. Sharing Your Information</h2>
          <p className="text-stone-700 leading-relaxed mb-2">We do not sell your personal information. We may share it with:</p>
          <ul className="list-disc pl-6 text-stone-700 mb-6 space-y-1">
            <li><strong>Service Providers:</strong> Payment processors, shipping carriers, email and analytics vendors.</li>
            <li><strong>Legal Authorities:</strong> When required by law or to protect rights, property, or safety.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">4. Cookies & Tracking</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We use cookies and similar technologies to remember preferences, analyze site traffic, and improve user
            experience. You can disable cookies in your browser settings, but some features may not work properly.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">5. Data Retention</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We retain personal data as long as necessary to provide our Services, comply with legal obligations, or resolve disputes.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">6. Your Rights</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data,
            withdraw consent, and opt out of marketing communications.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">7. Security</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We use reasonable technical and organizational measures to protect your data. However, no method of transmission or storage is 100% secure.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">8. Children's Privacy</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Our Services are not directed to children under the age of 13 (or the age of digital consent in your jurisdiction), and we do not knowingly collect their personal information.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">9. International Users</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            Your data may be transferred to and processed in countries other than your own. We take steps to ensure appropriate safeguards are in place where required.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">10. Changes to This Policy</h2>
          <p className="text-stone-700 leading-relaxed mb-6">
            We may update this Privacy Policy from time to time. Updates will be posted with a revised effective date.
          </p>

          <h2 className="text-2xl font-serif font-semibold mt-8 mb-4 text-stone-900">11. Contact Us</h2>
          <p className="text-stone-700 leading-relaxed mb-2">
            If you have questions about this Privacy Policy, contact us at:
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

export default PrivacyPolicyPage;