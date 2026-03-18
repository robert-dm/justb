'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, MapPin, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AddressSelector } from '@/components/address';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { providersApi } from '@/lib/api';
import { Address } from '@/types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, refreshUser, updateProfile: storeUpdateProfile, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [providerAddress, setProviderAddress] = useState<Address | undefined>();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        await refreshUser();
      } catch (error) {
        toast.error(t('profilePage', 'failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [refreshUser]);

  // For providers, fetch provider profile to get the address if user has none
  useEffect(() => {
    async function fetchProviderAddress() {
      if (user?.role !== 'provider' || user?.address?.coordinates) return;
      try {
        const response = await providersApi.getMyProfile();
        if (response.provider?.address) {
          setProviderAddress(response.provider.address);
        }
      } catch {
        // Provider profile may not exist yet
      }
    }

    fetchProviderAddress();
  }, [user]);

  // Set form values when user is loaded (use provider address as fallback)
  useEffect(() => {
    if (user) {
      const address = user.address?.coordinates ? user.address : (providerAddress || user.address || {});
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address,
      });
    }
  }, [user, providerAddress, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await storeUpdateProfile(data);
      toast.success(t('profilePage', 'profileUpdated'));
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('profilePage', 'failedToUpdate'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success(t('profilePage', 'loggedOut'));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">{t('profilePage', 'loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">{t('profilePage', 'myProfile')}</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profilePage', 'personalInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('profilePage', 'fullName')}</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder={t('profilePage', 'namePlaceholder')}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('profilePage', 'email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder={t('profilePage', 'emailPlaceholder')}
                    disabled
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('profilePage', 'phoneOptional')}</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder={t('profilePage', 'phonePlaceholder')}
                />
              </div>

              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common', 'saving')}
                  </>
                ) : (
                  t('common', 'saveChanges')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('profilePage', 'address')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {t('profilePage', 'addressHelper')}
              </p>

              <AddressSelector
                control={control}
                setValue={setValue}
                watch={watch}
                register={register}
                errors={errors.address}
                namePrefix="address"
                defaultCenter={user?.address?.coordinates || providerAddress?.coordinates}
              />

              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common', 'saving')}
                  </>
                ) : (
                  t('common', 'saveAddress')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('profilePage', 'account')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('profilePage', 'role')}</p>
                <p className="text-sm text-text-light capitalize">{user?.role}</p>
              </div>
              {user?.role === 'provider' && (
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  {t('profilePage', 'goToDashboard')}
                </Button>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('profilePage', 'signOut')}</p>
                <p className="text-sm text-text-light">
                  {t('profilePage', 'signOutDesc')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('profilePage', 'signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
