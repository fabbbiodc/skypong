'use client';

/**
 * ErrorBox component using design system error classes
 * @param {string} size - Size variant: 'mini', 'small', 'medium', 'big', 'extra'
 * @param {string} box - Box variant: 'none', 'regular' (with border and background)
 * @param {boolean} display - Whether to display the error (unused, kept for API compatibility)
 * @param {string} msg - Error message to display
 */

const sizeClasses = {
  mini: 'text-xs',
  small: 'text-sm',
  medium: 'text-base',
  big: 'text-lg',
  extra: 'text-xl',
};

const boxClasses = {
  none: '',
  regular: 'rounded-lg border border-red-500 bg-red-50 p-3',
};

export default function ErrorBox({ size = 'small', box = 'none', display, msg }) {
  if (!msg) return null;

  const sizeClass = sizeClasses[size] || sizeClasses.small;
  const boxClass = boxClasses[box] || boxClasses.none;

  return (
    <p className={`error-message ${sizeClass} ${boxClass}`}>
      {msg}
    </p>
  );
}