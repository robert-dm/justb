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
  const router = useRouter();
  const { user, refreshUser, updateProfile: storeUpdateProfile, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [refreshUser]);

  // Set form values when user is loaded
  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || {},
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await storeUpdateProfile(data);
      toast.success('Profile updated successfully');
      reset(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="your@email.com"
                    disabled
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
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
              Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Adding your address helps us recommend nearby providers and estimate delivery times.
              </p>

              <AddressSelector
                control={control}
                setValue={setValue}
                watch={watch}
                register={register}
                errors={errors.address}
                namePrefix="address"
                defaultCenter={user?.address?.coordinates}
              />

              <Button type="submit" disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Address'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Role</p>
                <p className="text-sm text-text-light capitalize">{user?.role}</p>
              </div>
              {user?.role === 'provider' && (
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              )}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sign Out</p>
                <p className="text-sm text-text-light">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
