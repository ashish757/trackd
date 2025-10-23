import React from 'react';
import { Eye, EyeOff, Loader } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  value: string;
  placeholder: string;
  autoComplete?: string;
  autoFocus?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: LucideIcon;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  isLoading?: boolean;
  helpText?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  type,
  label,
  value,
  placeholder,
  autoComplete,
  autoFocus = false,
  onChange,
  icon: Icon,
  showPassword,
  onTogglePassword,
  isLoading = false,
  helpText,
  className = ''
}) => {
  const hasRightIcon = type === 'password' || isLoading;
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-3">
        {label}
      </label>
      <div className="relative">
        <Icon className="input-icon-left h-5 w-5" />
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className={`input ${hasRightIcon ? 'input-with-both-icons' : 'input-with-left-icon'} text-lg`}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
        {type === 'password' && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="input-icon-right"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="h-5 w-5 animate-spin text-primary-color" />
          </div>
        )}
      </div>
      {helpText && (
        <p className="text-xs text-text-muted mt-3 leading-relaxed">
          {helpText}
        </p>
      )}
    </div>
  );
};
