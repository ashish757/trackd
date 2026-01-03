import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: 'purple' | 'green' | 'blue' | 'red' | 'yellow' | 'pink';
}

const colorConfig = {
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
  },
} as const;

/**
 * Reusable stat card component for displaying statistics.
 * Shows an icon, value, and label with customizable colors.
 */
export default function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  const colors = colorConfig[color];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-3 ${colors.bg} rounded-lg`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

