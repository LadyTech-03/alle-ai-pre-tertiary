'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ToastDemo() {
  const showSuccessToast = () => {
    toast.success('Operation completed successfully!');
  };

  const showErrorToast = () => {
    toast.error('Something went wrong!', {
      description: 'Please try again or contact support.',
    });
  };

  const showWarningToast = () => {
    toast.warning('Please review your input', {
      description: 'Some fields may need attention.',
    });
  };

  const showInfoToast = () => {
    toast.info('New feature available!', {
      description: 'Check out our latest updates.',
    });
  };

  const showCustomToast = () => {
    toast('Custom toast with action', {
      description: 'This is a custom toast with an action button.',
      action: {
        label: 'Undo',
        onClick: () => toast.info('Action undone!'),
      },
    });
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Toast Demo</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={showSuccessToast} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
          Success Toast
        </Button>
        <Button onClick={showErrorToast} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
          Error Toast
        </Button>
        <Button onClick={showWarningToast} variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50">
          Warning Toast
        </Button>
        <Button onClick={showInfoToast} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
          Info Toast
        </Button>
        <Button onClick={showCustomToast} variant="outline" className="col-span-2">
          Custom Toast with Action
        </Button>
      </div>
    </div>
  );
}
