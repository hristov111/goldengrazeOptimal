import React from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onMenuClick, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Golden Graze Admin
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </div>
            </div>
            
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </span>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;