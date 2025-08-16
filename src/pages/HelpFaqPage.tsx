import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';

const HelpFaqPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'product', name: 'Products' },
    { id: 'order', name: 'Orders' },
    { id: 'shipping', name: 'Shipping' },
    { id: 'billing', name: 'Billing' },
    { id: 'account', name: 'Account' }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'product',
      question: 'What is tallow and why is it good for skin?',
      answer: 'Tallow is rendered fat from grass-fed cattle that closely mimics the composition of human skin. It\'s rich in fat-soluble vitamins A, D, E, and K, making it incredibly nourishing and easily absorbed by the skin.'
    },
    {
      id: 2,
      category: 'product',
      question: 'How do I use the whipped tallow balm?',
      answer: 'Use the included wooden spoon to take a small amount, warm it between your palms until it melts, then gently massage into clean, slightly damp skin. A little goes a long way!'
    },
    {
      id: 3,
      category: 'product',
      question: 'Is the tallow balm suitable for sensitive skin?',
      answer: 'Yes! Our tallow balm is made with minimal, natural ingredients and is generally well-tolerated by sensitive skin. However, we recommend patch testing first if you have known allergies.'
    },
    {
      id: 4,
      category: 'order',
      question: 'How can I track my order?',
      answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and visiting the "My Orders" section.'
    },
    {
      id: 5,
      category: 'order',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 1 hour of placing it. After that, orders are processed quickly and cannot be changed. Please contact support if you need assistance.'
    },
    {
      id: 6,
      category: 'shipping',
      question: 'What are your shipping options?',
      answer: 'We offer standard shipping (5-7 business days) and expedited shipping (2-3 business days). Free shipping is available on orders over $75.'
    },
    {
      id: 7,
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within the United States. We\'re working on expanding international shipping options.'
    },
    {
      id: 8,
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal through our secure Stripe payment processor.'
    },
    {
      id: 9,
      category: 'billing',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day satisfaction guarantee. If you\'re not completely satisfied with your purchase, contact us for a full refund or exchange.'
    },
    {
      id: 10,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top navigation, enter your email and create a password. You\'ll receive a confirmation email to verify your account.'
    }
  ];

  const filteredFaqs = faqItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-32 right-16 w-32 h-32 bg-amber-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-amber-300 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-amber-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/help')}
            className="flex items-center space-x-2 text-stone-600 hover:text-amber-600 transition-colors mb-6 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm tracking-wider">Back to Help</span>
          </button>

          <h1 className="font-serif text-4xl text-stone-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-stone-600 text-lg">
            Find answers to common questions about Golden Graze products and services.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-stone-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQ..."
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-amber-600" />
              </div>
              <h3 className="font-serif text-xl text-stone-900 mb-2">No results found</h3>
              <p className="text-stone-600">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            filteredFaqs.map((item, index) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-amber-50 transition-colors"
                >
                  <h3 className="font-medium text-stone-900 pr-4">{item.question}</h3>
                  {expandedItems.includes(item.id) ? (
                    <ChevronUp size={20} className="text-amber-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-stone-400 flex-shrink-0" />
                  )}
                </button>
                
                {expandedItems.includes(item.id) && (
                  <div className="px-6 pb-4 border-t border-stone-100">
                    <p className="text-stone-600 leading-relaxed pt-4">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-100">
            <h2 className="font-serif text-2xl text-stone-900 mb-4">Still have questions?</h2>
            <p className="text-stone-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <button
              onClick={() => navigate('/help-contact')}
              className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
            >
              CONTACT SUPPORT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpFaqPage;