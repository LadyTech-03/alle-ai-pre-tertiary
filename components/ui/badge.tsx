import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-0.5 py-0.3 text-[0.6rem] transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'text-foreground bg-green-500/50',
        warning: 'text-foreground bg-yellow-500/50',
        bronze: 'bg-gradient-to-r from-orange-900 via-amber-700 to-orange-600 text-transparent bg-clip-text',
        silver: 'bg-gradient-to-r from-gray-300 via-gray-500 to-gray-200 text-transparent bg-clip-text',
        gold: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 text-transparent bg-clip-text',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
