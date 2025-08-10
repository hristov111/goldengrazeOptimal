import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  showStrengthMeter?: boolean;
  strengthScore?: number;
}

const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, error, helperText, showStrengthMeter, strengthScore, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = props.id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className="space-y-2">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-700"
        >
          {label}
        </label>
        
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-colors ${
              error 
                ? 'border-red-300 focus:ring-red-200 focus:border-red-400' 
                : 'border-stone-300'
            } ${className}`}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {showStrengthMeter && strengthScore !== undefined && (
          <div className="space-y-1">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < strengthScore
                      ? strengthScore <= 1 ? 'bg-red-400'
                      : strengthScore <= 2 ? 'bg-yellow-400'
                      : strengthScore <= 3 ? 'bg-blue-400'
                      : 'bg-green-400'
                      : 'bg-stone-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-stone-500">
              {strengthScore <= 1 ? 'Weak' :
               strengthScore <= 2 ? 'Fair' :
               strengthScore <= 3 ? 'Good' : 'Strong'}
            </p>
          </div>
        )}
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="text-sm text-stone-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

export default PasswordField;