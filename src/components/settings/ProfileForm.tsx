import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { profileSchema, ProfileFormData } from '../../lib/validations';
import { database } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SectionCard from './SectionCard';
import TextField from './TextField';

const ProfileForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: ''
    }
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await database.getUserProfile(user.id);
      
      if (error) {
        throw error;
      }

      if (data) {
        setValue('name', data.full_name || user.name || '');
        setLastUpdated(data.updated_at);
        reset({ name: data.full_name || user.name || '' });
      } else {
        // Profile doesn't exist, use auth user data
        setValue('name', user.name || '');
        reset({ name: user.name || '' });
      }
    } catch (error: any) {
      showToast('error', 'Failed to load profile information');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await database.updateUserProfile(user.id, {
        full_name: data.name.trim(),
        updated_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      showToast('success', 'Profile updated successfully');
      setLastUpdated(new Date().toISOString());
      reset(data); // Reset form dirty state
    } catch (error: any) {
      showToast('error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return 'Unknown';
    }
  };

  return (
    <SectionCard
      title="Profile Information"
      description="Update your personal information and display name."
      footer={
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Last updated: {formatLastUpdated(lastUpdated)}
          </span>
          <button
            type="submit"
            form="profile-form"
            disabled={isLoading || !isDirty}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-medium text-sm tracking-wider rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      }
    >
      <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          helperText="This name will be displayed on your account and orders."
          {...register('name')}
        />

        <div className="flex items-center space-x-3 p-3 bg-stone-50 rounded-lg">
          <User size={16} className="text-stone-400" />
          <div>
            <div className="text-sm font-medium text-stone-700">Account Email</div>
            <div className="text-sm text-stone-500">{user?.email}</div>
          </div>
        </div>
      </form>
    </SectionCard>
  );
};

export default ProfileForm;