'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group text-white"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:shadow-lg group-[.toaster]:border group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-1 group-[.toaster]:w-[300px] group-[.toaster]:max-w-[400px]',
          description: 'group-[.toast]:text-sm group-[.toaster]:text-white text-white',
          actionButton:
            'group-[.toast]:bg-white group-[.toast]:text-gray-900 group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-gray-100',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:rounded group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:hover:bg-gray-200',
          title: 'group-[.toast]:font-semibold group-[.toast]:text-sm',
          loader: 'group-[.toast]:flex group-[.toast]:items-center',
          icon: 'group-[.toast]:flex-shrink-0 group-[.toast]:w-4 group-[.toast]:h-4',
          // Custom toast type styles
          success: 'group-[.toaster]:bg-green-700 group-[.toaster]:border-none group-[.toaster]:text-white',
          error: 'group-[.toaster]:bg-red-700 group-[.toaster]:border-nonered-200 group-[.toaster]:text-white',
          warning: 'group-[.toaster]:bg-yellow-700 group-[.toaster]:border-none group-[.toaster]:text-white',
          info: 'group-[.toaster]:bg-blue-700 group-[.toaster]:border-none group-[.toaster]:text-white',
        },
      }}
      icons={{
        success: <CheckCircle className="w-4 h-4 text-white" />,
        error: <XCircle className="w-4 h-4 text-white" />,
        warning: <AlertTriangle className="w-4 h-4 text-white" />,
        info: <Info className="w-4 h-4 text-white" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
