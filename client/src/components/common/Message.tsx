import React from 'react';

interface MessageProps {
  message: string;
  type: 'error' | 'warning' | 'success';
  className?: string;
}

export const Message: React.FC<MessageProps> = ({ message, type, className = '' }) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400'
        };
      case 'warning':
        return {
          container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          dot: 'bg-yellow-400'
        };
      case 'success':
        return {
          container: 'bg-green-500/10 border-green-500/30 text-green-400',
          dot: 'bg-green-400'
        };
      default:
        return {
          container: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`border rounded-lg p-4 ${styles.container} ${className}`}>
      <p className="text-sm font-medium flex items-center">
        <span className={`w-2 h-2 rounded-full mr-2 ${styles.dot}`}></span>
        {message}
      </p>
    </div>
  );
};

interface MessageContainerProps {
  error?: string;
  warning?: string;
  success?: string;
}

export const MessageContainer: React.FC<MessageContainerProps> = ({ 
  error, 
  warning, 
  success 
}) => {
  if (!error && !warning && !success) return null;

  return (
    <div className="space-y-3">
      {error && <Message message={error} type="error" />}
      {warning && <Message message={warning} type="warning" />}
      {success && <Message message={success} type="success" />}
    </div>
  );
};
