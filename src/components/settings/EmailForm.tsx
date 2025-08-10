import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, AlertTriangle } from 'lucide-react';
import { emailSchema, EmailFormData } from '../../lib/validations';
import { auth, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SectionCard from './SectionCard';
import TextField from './TextField';
import PasswordField from './PasswordField';

const EmailForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: '',
      currentPassword: ''
    }
  });

  const newEmail = watch('newEmail');
  const isEmailSame = newEmail === user?.email;

  const onSubmit = async (data: EmailFormData) => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      // First verify the current password by attempting to sign in
      const { error: verifyError } = await auth.signIn(user.email, data.currentPassword);
      
      if (verifyError) {
        throw new Error('Current password is incorrect');
      }

      // Update the email using Supabase's updateUser method
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email: data.newEmail
      });

      if (updateError) {
        throw updateError;
      }

      // Show success message but keep user signed in
      showToast('success', `Email change initiated! Check your inbox at ${data.newEmail} for a verification email from Supabase. Click the "Confirm email change" link in that email to complete the process. You can continue using your current email (${user.email}) to log in until verification is complete.`);
      
      // Clear the form
      reset();
      
    } catch (error: any) {
      if (error.message.includes('password')) {
        showToast('error', 'Current password is incorrect');
      } else if (error.message.includes('email_address_invalid')) {
        showToast('error', 'Please enter a valid email address');
      } else if (error.message.includes('email_address_not_authorized')) {
        showToast('error', 'This email address is not authorized');
      } else if (error.message.includes('email')) {
        showToast('error', 'Failed to update email. Please try again.');
      } else {
        showToast('error', error.message || 'Failed to update email');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionCard
      title="Email Address"
      description="Change your account email address. You'll need to verify the new email."
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-amber-600">
            <AlertTriangle size={14} />
            <span>Email changes require verification</span>
          </div>
          <button
            type="submit"
            form="email-form"
            disabled={isLoading || isEmailSame || !newEmail}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium text-sm tracking-wider rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </div>
      }
    >
      <form id="email-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
          <Mail size={16} className="text-stone-400" />
          <div>
            <div className="text-sm font-medium text-stone-700">Current Email</div>
            <div className="text-sm text-stone-500">{user?.email}</div>
          </div>
        </div>

        <TextField
          label="New Email Address"
          type="email"
          placeholder="Enter new email address"
          error={errors.newEmail?.message || (isEmailSame && newEmail ? 'New email must be different from current email' : undefined)}
          {...register('newEmail')}
        />

        <PasswordField
          label="Current Password"
          placeholder="Enter your current password"
          error={errors.currentPassword?.message}
          helperText="Required to verify your identity"
          {...register('currentPassword')}
        />
      </form>
    </SectionCard>
  );
};

export default EmailForm;