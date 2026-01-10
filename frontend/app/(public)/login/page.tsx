import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your justB account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background-light px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
