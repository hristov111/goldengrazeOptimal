import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signUp: (fullName: string, email: string, password: string) => Promise<{success: boolean; error?: string; message?: string}>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and set up auth listener
    const initializeAuth = async () => {
      try {
        const { data: { user: currentUser } } = await auth.getCurrentUser();
        
        if (currentUser) {
          const userData = {
            id: currentUser.id,
            name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || ''
          };
          setUser(userData);
          setIsLoggedIn(true);
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || ''
        };
        setUser(userData);
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || ''
        };
        setUser(userData);
        setIsLoggedIn(true);
        return { success: true };
      }
      
      return { success: false, error: 'No user returned from sign in' };
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSignUp = async (fullName: string, email: string, password: string) => {
    try {
      const { data, error } = await auth.signUp(email, password, fullName);
      
      if (error) {
        throw error;
      }

      if (data.user) {
        const userData = {
          id: data.user.id,
          name: fullName,
          email: email
        };
        setUser(userData);
        setIsLoggedIn(true);
        return { success: true };
      }
      
      return { success: true, message: 'Please check your email to confirm your account.' };
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
    }
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};