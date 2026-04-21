'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Package, UtensilsCrossed, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTab, MenuTab, ProfileTab } from '@/components/dashboard';
import { AddressSelector } from '@/components/address';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { providersApi } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Provider } from '@/types';

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProvider() {
      // Redirect non-providers
      if (user?.role !== 'provider') {
        router.push('/profile');
        return;
      }

      try {
        const response = await providersApi.getMyProfile();
        setProvider(response.provider);
      } catch (err) {
        // If no provider profile exists, user needs to create one
        if (err instanceof Error && err.message.includes('not found')) {
          setError('no-profile');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProvider();
  }, [user, router]);

  const handleProviderUpdate = (updatedProvider: Provider) => {
    setProvider(updatedProvider);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-text-light">{t('dashboard', 'loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  if (error === 'no-profile') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">{t('dashboard', 'welcomeProvider')}</h1>
          <p className="mt-2 text-text-light">
            {t('dashboard', 'setupProfile')}
          </p>
          <CreateProviderForm
            onSuccess={(newProvider) => {
              setProvider(newProvider);
              setError(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold text-destructive">{t('common', 'error')}</h1>
          <p className="mt-2 text-text-light">{error || t('dashboard', 'somethingWentWrong')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{provider.businessName}</h1>
        <p className="text-text-light">{t('dashboard', 'providerDashboard')}</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            {t('dashboard', 'orders')}
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            {t('dashboard', 'menu')}
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            {t('dashboard', 'profile')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="menu">
          <MenuTab providerId={provider._id} />
        </TabsContent>

        <TabsContent value="profile">
          <ProfileTab provider={provider} onUpdate={handleProviderUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Zod schema for provider creation form
const providerCreationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().min(10, 'Please provide a description (at least 10 characters)'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

type ProviderCreationData = z.infer<typeof providerCreationSchema>;

// Form to create provider profile with map-based address selection
function CreateProviderForm({
  onSuccess,
}: {
  onSuccess: (provider: Provider) => void;
}) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProviderCreationData>({
    resolver: zodResolver(providerCreationSchema),
    defaultValues: {
      businessName: '',
      description: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  const onSubmit = async (data: ProviderCreationData) => {
    // Validate coordinates are present
    if (!data.address.coordinates?.lat || !data.address.coordinates?.lng) {
      toast.error(t('dashboard', 'selectLocation'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await providersApi.create({
        businessName: data.businessName,
        description: data.description,
        address: data.address,
      });
      toast.success(t('dashboard', 'profileCreated'));
      onSuccess(response.provider);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('dashboard', 'failedToCreateProfile'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 max-w-2xl mx-auto">
      {/* Business Name */}
      <div>
        <Label htmlFor="businessName">{t('dashboard', 'businessName')}</Label>
        <Input
          id="businessName"
          {...register('businessName')}
          placeholder={t('dashboard', 'businessNamePlaceholder')}
          className="mt-1.5"
        />
        {errors.businessName && (
          <p className="text-sm text-destructive mt-1">{errors.businessName.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">{t('dashboard', 'description')}</Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t('dashboard', 'descriptionPlaceholder')}
          className="mt-1.5 min-h-[80px]"
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Address Selector with Map */}
      <AddressSelector
        control={control}
        setValue={setValue}
        watch={watch}
        register={register}
        errors={errors.address}
        namePrefix="address"
      />

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('dashboard', isSubmitting ? 'creatingProfile' : 'createProfile')}
      </Button>
    </form>
  );
}
