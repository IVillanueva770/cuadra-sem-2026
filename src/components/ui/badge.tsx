import * as React from 'react';
import {cn} from '@/lib/utils';
import {cva, type VariantProps} from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-blue-500 text-white',
        secondary: 'bg-gray-100 text-gray-900',
        outline: 'border border-gray-200 text-gray-900',
        success: 'bg-emerald-50 text-emerald-800',
        warning: 'bg-amber-50 text-amber-900',
        destructive: 'bg-red-50 text-red-900',
        accent: 'bg-gold-50 text-gold-700',
      },
    },
    defaultVariants: {variant: 'default'},
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({className, variant, ...props}: BadgeProps) {
  return <div className={cn(badgeVariants({variant}), className)} {...props} />;
}
