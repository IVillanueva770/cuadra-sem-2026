import * as React from 'react';
import {cn} from '@/lib/utils';
import {cva, type VariantProps} from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        secondary: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
        ghost: 'text-blue-500 hover:bg-blue-50',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
      },
      size: {
        default: 'h-12 px-5 text-base',
        sm: 'h-10 px-4 text-sm',
        lg: 'h-14 px-6 text-lg',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {variant: 'default', size: 'default'},
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({className, variant, size, ...props}, ref) => {
    return <button className={cn(buttonVariants({variant, size, className}))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export {buttonVariants};
