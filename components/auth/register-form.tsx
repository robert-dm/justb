'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthStore } from '@/stores';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { useTranslation } from '@/hooks';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'provider' ? 'provider' : 'tourist';

  const { register: registerUser } = useAuthStore();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success(t('auth', 'accountCreated'));

      // Redirect based on role
      if (data.role === 'provider') {
        toast.info(t('auth', 'completeProfile'));
        router.push('/dashboard');
      } else {
        router.push('/providers');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('auth', 'registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t('auth', 'createAccount')}</CardTitle>
        <CardDescription>
          {t('auth', 'joinJustB')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('auth', 'fullName')}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t('auth', 'fullNamePlaceholder')}
              {...register('name')}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('auth', 'email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth', 'emailPlaceholder')}
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('auth', 'password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('auth', 'phoneOptional')}</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('auth', 'phonePlaceholder')}
              {...register('phone')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('auth', 'iWantTo')}</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: 'tourist' | 'provider') => setValue('role', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('auth', 'selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourist">
                  {t('auth', 'findBreakfastTourist')}
                </SelectItem>
                <SelectItem value="provider">
                  {t('auth', 'sellBreakfastProvider')}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {selectedRole === 'provider' && (
            <div className="rounded-lg bg-secondary/10 p-3 text-sm text-muted-foreground">
              {t('auth', 'providerNote')}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth', 'creatingAccount')}
              </>
            ) : (
              t('auth', 'createAccount')
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {t('auth', 'alreadyHaveAccount')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('auth', 'signInLink')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
