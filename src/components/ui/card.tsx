import * as React from 'react';
import {cn} from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({className, ...props}, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-gray-100 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_1px_3px_rgba(16,24,40,0.08)]',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-4 sm:p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({className, ...props}, ref) => (
    <h3 ref={ref} className={cn('text-xl font-semibold leading-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({className, ...props}, ref) => (
    <p ref={ref} className={cn('text-sm text-gray-500', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn('p-4 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export {Card, CardHeader, CardTitle, CardDescription, CardContent};
