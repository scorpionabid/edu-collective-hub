
import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
  suggestion?: string;
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

export const FormError = React.forwardRef<HTMLDivElement, FormErrorProps>(
  (
    {
      error,
      suggestion,
      showIcon = true,
      dismissible = false,
      onDismiss,
      severity = 'error',
      className,
      ...props
    },
    ref
  ) => {
    if (!error) return null;

    const iconMap = {
      error: <AlertTriangle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      info: <HelpCircle className="h-4 w-4" />,
    };

    const colorMap = {
      error: 'text-destructive',
      warning: 'text-yellow-600 dark:text-yellow-500',
      info: 'text-blue-600 dark:text-blue-500',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 text-sm font-medium rounded-md py-1',
          colorMap[severity],
          className
        )}
        {...props}
      >
        {showIcon && iconMap[severity]}
        <div className="flex-1">
          <p>{error}</p>
          {suggestion && (
            <p className="text-xs opacity-80 mt-0.5">{suggestion}</p>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            className="rounded-full p-1 hover:bg-background-muted"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

FormError.displayName = 'FormError';
