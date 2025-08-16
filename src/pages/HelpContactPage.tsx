import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Clock, MessageCircle } from 'lucide-react';
import { ToastProvider } from '../contexts/ToastContext';
import ContactForm from '../components/support/ContactForm';

const HelpContactPageContent: React.FC = () => {
  const navigate = useNavigate();
  
  const handleContactSuccess = (ticketId: string) => {
    // Navigate to support tickets page
    navigate('/support-tickets');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/help')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Help</span>
          </button>

          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">Contact Support</h1>
            <p className="text-stone-600 text-lg max-w-2xl mx-auto">
              We're here to help! Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm onSuccess={handleContactSuccess} />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Support Hours */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-white" />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Support Hours</h3>
              </div>
              <div className="space-y-2 text-stone-600">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <h3 className="font-serif text-xl text-stone-900">Response Time</h3>
              </div>
              <div className="space-y-3 text-stone-600">
                <div>
                  <div className="font-medium text-stone-800">General Inquiries</div>
                  <div className="text-sm">Within 24 hours</div>
                </div>
                <div>
                  <div className="font-medium text-stone-800">Order Issues</div>
                  <div className="text-sm">Within 4 hours</div>
                </div>
                <div>
                  <div className="font-medium text-stone-800">Technical Support</div>
                  <div className="text-sm">Within 12 hours</div>
                </div>
              </div>
            </div>

            {/* Alternative Contact */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
              <h3 className="font-serif text-xl text-stone-900 mb-4">Other Ways to Reach Us</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-amber-600" />
                  <div>
                    <div className="font-medium text-stone-800">Email</div>
                    <div className="text-sm text-stone-600">goldengraze1@outlook.com</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
              <h3 className="font-serif text-lg text-stone-900 mb-2">Quick Answers</h3>
              <p className="text-stone-600 text-sm mb-4">
                Looking for immediate help? Check our FAQ for instant answers to common questions.
              </p>
              <button
                onClick={() => navigate('/help-faq')}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm transition-colors"
              >
                Browse FAQ →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HelpContactPage: React.FC = () => {
  return (
    <ToastProvider>
      <HelpContactPageContent />
    </ToastProvider>
  );
};

export default HelpContactPage;