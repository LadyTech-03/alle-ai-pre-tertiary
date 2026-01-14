'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';

export function NavBarItems({ iconName }: { iconName: React.ElementType }) {

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-8 h-8 p-1 text-muted-foreground rounded-full border border-borderColorPrimary"
    >
      {React.createElement(iconName, {
        className: "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all"
      })}
    </Button>
  );
}