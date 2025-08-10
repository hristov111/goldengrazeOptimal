import React, { useState } from 'react';
import { Search, MessageCircle, FileText, Phone, Mail, ArrowRight } from 'lucide-react';

interface HelpPageProps {
  setCurrentPage: (page: string) => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ setCurrentPage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const quickLinks = [
    {
      title: 'Order Status',
      description: 'Track your Golden Graze orders',
      icon: FileText,
      action: () => setCurrentPage('orders')
    },
    {
      title: 'Product Information',
      description: 'Learn about our tallow balms',
      icon: MessageCircle,
      action: () => setCurrentPage('help-faq')
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: Mail,
      action: () => setCurrentPage('help-contact')
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('help-faq');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 left-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
            How can we help you?
          </h1>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Find answers to your questions about Golden Graze products, orders, and more.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-4 text-lg border border-stone-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors shadow-lg"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <button
                key={index}
                onClick={link.action}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 text-left group hover:scale-105"
              >
                <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-serif text-xl text-stone-900 mb-2 group-hover:text-amber-600 transition-colors">
                  {link.title}
                </h3>
                <p className="text-stone-600 group-hover:text-stone-700 transition-colors">
                  {link.description}
                </p>
                <div className="flex items-center mt-4 text-amber-600 group-hover:text-amber-700 transition-colors">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Popular Topics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
          <h2 className="font-serif text-2xl text-stone-900 mb-6">Popular Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'How to use tallow balm',
              'Shipping and delivery',
              'Return and refund policy',
              'Product ingredients',
              'Order tracking',
              'Account management'
            ].map((topic, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage('help-faq')}
                className="text-left p-4 rounded-lg hover:bg-amber-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-stone-700 group-hover:text-amber-600 transition-colors">
                    {topic}
                  </span>
                  <ArrowRight size={16} className="text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="font-serif text-2xl text-stone-900 mb-4">Still need help?</h2>
          <p className="text-stone-600 mb-8">
            Our support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('help-contact')}
              className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
            >
              CONTACT SUPPORT
            </button>
            <button
              onClick={() => setCurrentPage('help-faq')}
              className="border-2 border-amber-400 text-amber-700 hover:bg-amber-50 px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium"
            >
              VIEW FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;