'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { providersApi } from '@/lib/api';
import { Provider } from '@/types';

const providerSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().optional(),
  deliveryRadius: z.number().min(1).optional(),
  minimumOrder: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  serviceType: z.object({
    delivery: z.boolean(),
    pickup: z.boolean(),
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }),
});

type ProviderFormData = z.infer<typeof providerSchema>;

interface ProfileTabProps {
  provider: Provider;
  onUpdate: (provider: Provider) => void;
}

export function ProfileTab({ provider, onUpdate }: ProfileTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      businessName: provider.businessName,
      description: provider.description || '',
      deliveryRadius: provider.deliveryRadius || 5,
      minimumOrder: provider.minimumOrder || 0,
      deliveryFee: provider.deliveryFee || 0,
      serviceType: provider.serviceType || { delivery: true, pickup: false },
      address: provider.address || {},
    },
  });

  const serviceType = watch('serviceType');

  const onSubmit = async (data: ProviderFormData) => {
    setIsSaving(true);
    try {
      const response = await providersApi.update(provider._id, {
        businessName: data.businessName,
        description: data.description,
        deliveryRadius: data.deliveryRadius,
        minimumOrder: data.minimumOrder,
        deliveryFee: data.deliveryFee,
        serviceType: data.serviceType,
        address: data.address as Provider['address'],
      });
      toast.success('Profile updated successfully');
      onUpdate(response.provider);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                {...register('businessName')}
                placeholder="Your business name"
              />
              {errors.businessName && (
                <p className="text-sm text-destructive">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Tell customers about your business..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                <Input
                  id="deliveryRadius"
                  type="number"
                  {...register('deliveryRadius', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
                <Input
                  id="minimumOrder"
                  type="number"
                  step="0.01"
                  {...register('minimumOrder', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  step="0.01"
                  {...register('deliveryFee', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Service Types</Label>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="delivery"
                    checked={serviceType.delivery}
                    onCheckedChange={(checked) =>
                      setValue('serviceType.delivery', checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="delivery" className="cursor-pointer">
                    Delivery
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="pickup"
                    checked={serviceType.pickup}
                    onCheckedChange={(checked) =>
                      setValue('serviceType.pickup', checked, { shouldDirty: true })
                    }
                  />
                  <Label htmlFor="pickup" className="cursor-pointer">
                    Pickup
                  </Label>
                </div>
              </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                {...register('address.street')}
                placeholder="123 Main St"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('address.city')}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...register('address.state')}
                  placeholder="State"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                <Input
                  id="zipCode"
                  {...register('address.zipCode')}
                  placeholder="12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register('address.country')}
                  placeholder="Country"
                />
              </div>
            </div>

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
    </div>
  );
}
