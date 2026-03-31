import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        aria-busy={loading}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {loading ? <span className="spinner" aria-hidden="true" /> : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
