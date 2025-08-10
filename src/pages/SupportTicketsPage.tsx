import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageCircle, Loader2, Plus, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { database } from '../lib/supabase';
import StatusBadge from '../components/support/StatusBadge';
import CategoryBadge from '../components/support/CategoryBadge';

interface SupportTicketsPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedTicket?: (ticketId: string) => void;
}

const SupportTicketsPage: React.FC<SupportTicketsPageProps> = ({ setCurrentPage, setSelectedTicket }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { isLoggedIn, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !isLoggedIn) {
      setCurrentPage('signin');
      return;
    }

    if (isLoggedIn && user) {
      setIsVisible(true);
      loadTickets();
      // Scroll to top when page loads
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoggedIn, user, authLoading, setCurrentPage]);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [statusFilter, categoryFilter]);

  const loadTickets = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;

      const { data, error } = await database.getSupportTickets(user.id, filters);
      
      if (error) {
        throw error;
      }
      
      setTickets(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTicketClick = (ticketId: string) => {
    if (setSelectedTicket) {
      setSelectedTicket(ticketId);
    }
    setCurrentPage('support-ticket-detail');
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading your support tickets...</p>
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

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
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

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-4xl text-stone-900 mb-2">Support Tickets</h1>
              <p className="text-stone-600">
                Manage your support requests and track their progress
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('help-contact')}
              className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center space-x-2 transform hover:scale-105"
            >
              <Plus size={20} />
              <span>NEW TICKET</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-stone-400" />
                <span className="text-sm font-medium text-stone-700">Filter by:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="pending_customer">Pending Response</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="order">Order</option>
                <option value="billing">Billing</option>
                <option value="shipping">Shipping</option>
                <option value="product">Product</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 size={48} className="text-amber-400 animate-spin mx-auto mb-4" />
              <p className="text-stone-600">Loading your support tickets...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <MessageCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="font-serif text-xl text-stone-900 mb-2">Unable to Load Tickets</h3>
              <p className="text-stone-600 mb-6">{error}</p>
              <button
                onClick={loadTickets}
                className="bg-amber-400 hover:bg-amber-500 text-white px-6 py-3 tracking-widest transition-colors rounded-lg"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && !error && (
          <>
            {tickets.length === 0 ? (
              /* No Tickets */
              <div className={`text-center py-20 transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}>
                <div className="w-32 h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mx-auto mb-8 flex items-center justify-center">
                  <MessageCircle size={48} className="text-amber-600" />
                </div>
                <h2 className="font-serif text-2xl text-stone-900 mb-4">No Support Tickets</h2>
                <p className="text-stone-600 mb-8 max-w-md mx-auto">
                  {statusFilter || categoryFilter 
                    ? 'No tickets match your current filters. Try adjusting your filter criteria.'
                    : 'You haven\'t created any support tickets yet. If you need help, don\'t hesitate to reach out!'
                  }
                </p>
                {!statusFilter && !categoryFilter && (
                  <button
                    onClick={() => setCurrentPage('help-contact')}
                    className="bg-amber-400 hover:bg-amber-500 text-white px-8 py-4 tracking-widest transition-all duration-300 rounded-lg font-medium transform hover:scale-105"
                  >
                    CREATE TICKET
                  </button>
                )}
              </div>
            ) : (
              /* Tickets Grid */
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${500 + index * 100}ms` }}
                    onClick={() => handleTicketClick(ticket.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-xl text-stone-900 group-hover:text-amber-600 transition-colors mb-2">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center space-x-3 mb-2">
                          <StatusBadge status={ticket.status} />
                          <CategoryBadge category={ticket.category} />
                          {ticket.priority === 'high' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                              High Priority
                            </span>
                          )}
                        </div>
                        {ticket.order_number && (
                          <p className="text-stone-600 text-sm">
                            Order: {ticket.order_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-stone-500">
                        <div>Created: {formatDate(ticket.created_at)}</div>
                        <div>Last activity: {formatDate(ticket.last_message_at)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-stone-600 text-sm">
                        Ticket ID: {ticket.id.slice(0, 8)}...
                      </div>
                      <div className="text-amber-600 group-hover:text-amber-700 transition-colors">
                        <span className="text-sm font-medium">View Details →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;