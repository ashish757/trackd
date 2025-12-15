import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  size?: 'small' | 'medium' | 'large';
}

const sizeConfig = {
  small: {
    icon: 'h-12 w-12',
    padding: 'py-8',
    title: 'text-lg',
    description: 'text-sm',
  },
  medium: {
    icon: 'h-16 w-16',
    padding: 'py-12',
    title: 'text-xl',
    description: 'text-base',
  },
  large: {
    icon: 'h-20 w-20',
    padding: 'py-20',
    title: 'text-2xl',
    description: 'text-lg',
  },
} as const;

/**
 * Reusable empty state component for displaying when no content is available.
 * Supports different sizes and optional call-to-action button.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'medium',
}: EmptyStateProps) {
  const sizes = sizeConfig[size];

  return (
    <div className={`text-center ${sizes.padding}`}>
      <Icon className={`${sizes.icon} mx-auto mb-4 text-gray-400`} />
      <h3 className={`${sizes.title} font-bold text-gray-900 mb-2`}>
        {title}
      </h3>
      <p className={`${sizes.description} text-gray-600 mb-4`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

