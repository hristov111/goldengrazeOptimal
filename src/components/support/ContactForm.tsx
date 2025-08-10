import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Loader2 } from 'lucide-react';
import { contactFormSchema, ContactFormData } from '../../lib/validations';
import { database } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ContactFormProps {
  onSuccess?: (ticketId: string) => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, className = '' }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: user?.email || '',
      category: 'other',
      priority: 'normal'
    }
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create the ticket
      const ticketData = {
        user_id: isLoggedIn ? user?.id : undefined,
        email: data.email,
        subject: data.subject,
        category: data.category,
        order_number: data.orderNumber || undefined,
        priority: data.priority
      };

      const { data: ticket, error: ticketError } = await database.createSupportTicket(ticketData);
      
      if (ticketError) {
        throw ticketError;
      }

      // Create the first message
      const messageData = {
        ticket_id: ticket.id,
        sender: 'customer',
        user_id: isLoggedIn ? user?.id : undefined,
        body: data.message
      };

      const { error: messageError } = await database.createSupportMessage(messageData);
      
      if (messageError) {
        throw messageError;
      }

      showToast('success', 'Support ticket created successfully! We\'ll get back to you soon.');
      reset();
      
      if (onSuccess) {
        onSuccess(ticket.id);
      }
    } catch (error: any) {
      showToast('error', error.message || 'Failed to create support ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-amber-100 p-8 ${className}`}>
      <div className="mb-8">
        <h2 className="font-serif text-2xl text-stone-900 mb-2">Contact Support</h2>
        <p className="text-stone-600">
          Need help? Send us a message and we'll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors ${
              errors.email ? 'border-red-300' : 'border-stone-300'
            }`}
            placeholder="your@email.com"
            disabled={isLoggedIn}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-stone-700 mb-2">
            Subject *
          </label>
          <input
            id="subject"
            type="text"
            {...register('subject')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors ${
              errors.subject ? 'border-red-300' : 'border-stone-300'
            }`}
            placeholder="Brief description of your issue"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Category and Priority */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-stone-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
            >
              <option value="order">Order Issue</option>
              <option value="billing">Billing</option>
              <option value="shipping">Shipping</option>
              <option value="product">Product Question</option>
              <option value="technical">Technical Support</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-stone-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              {...register('priority')}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Order Number (conditional) */}
        {(selectedCategory === 'order' || selectedCategory === 'billing' || selectedCategory === 'shipping') && (
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-stone-700 mb-2">
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              {...register('orderNumber')}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors"
              placeholder="e.g., GG-2024-001"
            />
            <p className="text-stone-500 text-sm mt-1">
              If your inquiry is related to a specific order, please provide the order number.
            </p>
          </div>
        )}

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            rows={6}
            {...register('message')}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors resize-vertical ${
              errors.message ? 'border-red-300' : 'border-stone-300'
            }`}
            placeholder="Please describe your issue in detail..."
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-white py-4 px-6 tracking-widest transition-all duration-300 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>SENDING...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>SEND MESSAGE</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;