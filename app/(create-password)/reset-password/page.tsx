"use client";

import { Suspense } from 'react';
import { ResetPasswordContent } from './ResetPasswordContent';
import { LoadingScreen } from '@/components/features/auth/LoadingScreen';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPasswordContent />
    </Suspense>
  );
}