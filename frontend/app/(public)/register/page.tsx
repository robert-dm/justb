import { Suspense } from 'react';
import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create your justB account to discover local breakfast options',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-background-light px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
