import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
  const spinnerSize = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="d-flex justify-content-center align-items-center p-3">
      <div className={`spinner-border text-${color} ${spinnerSize[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
} 