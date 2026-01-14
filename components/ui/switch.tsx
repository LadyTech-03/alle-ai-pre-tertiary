'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const switchVariants = {
  default: {
    root: 'h-4 w-8',
    thumb: 'h-3 w-3 data-[state=checked]:translate-x-4'
  },
  sm: {
    root: 'h-3 w-6',
    thumb: 'h-2 w-2 data-[state=checked]:translate-x-3'
  },
  lg: {
    root: 'h-6 w-12',
    thumb: 'h-5 w-5 data-[state=checked]:translate-x-6'
  },
  custom: {
    root: 'h-5 w-10',
    thumb: 'h-4 w-4 data-[state=checked]:translate-x-5'
  }
} as const;

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: keyof typeof switchVariants;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant = 'default', ...props }, ref) => {
  const variantStyles = switchVariants[variant];

  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-primary',
        variantStyles.root,
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
          variantStyles.thumb
        )}
      />
    </SwitchPrimitives.Root>
  )
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
