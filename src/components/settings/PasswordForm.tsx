import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, AlertTriangle } from 'lucide-react';
import { passwordSchema, PasswordFormData } from '../../lib/validations';
import { auth, supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SectionCard from './SectionCard';
import PasswordField from './PasswordField';

const PasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  // Calculate password strength
  const getPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  const onSubmit = async (data: PasswordFormData) => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      // First, re-authenticate the user
      const { error: authError } = await auth.signIn(user.email, data.currentPassword);
      
      if (authError) {
        throw new Error('Current password is incorrect');
      }

      // Update password using Supabase's updateUser method
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: data.newPassword 
      });

      if (updateError) {
        throw updateError;
      }

      showToast('success', 'Password updated successfully');
      reset();
    } catch (error: any) {
      if (error.message.includes('password')) {
        showToast('error', 'Current password is incorrect');
      } else {
        showToast('error', error.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionCard
      title="Password"
      description="Update your account password. Choose a strong password to keep your account secure."
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-stone-500">
            <Shield size={14} />
            <span>Password must be at least 8 characters</span>
          </div>
          <button
            type="submit"
            form="password-form"
            disabled={isLoading}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium text-sm tracking-wider rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      }
    >
      <form id="password-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          label="Current Password"
          placeholder="Enter your current password"
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />

        <PasswordField
          label="New Password"
          placeholder="Enter new password"
          error={errors.newPassword?.message}
          showStrengthMeter={true}
          strengthScore={passwordStrength}
          helperText="Must contain at least 8 characters, 1 number, and 1 special character"
          {...register('newPassword')}
        />

        <PasswordField
          label="Confirm New Password"
          placeholder="Confirm your new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700">
            <div className="font-medium mb-1">Password Security Tips:</div>
            <ul className="text-xs space-y-1">
              <li>• Use a unique password you don't use elsewhere</li>
              <li>• Include uppercase, lowercase, numbers, and symbols</li>
              <li>• Avoid personal information like names or birthdays</li>
            </ul>
          </div>
        </div>
      </form>
    </SectionCard>
  );
};

export default PasswordForm;