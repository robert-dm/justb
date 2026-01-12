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
import { ImageUpload } from '@/components/ui/image-upload';
import { AddressSelector } from '@/components/address';
import { providersApi } from '@/lib/api';
import { Provider } from '@/types';

const providerSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
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
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
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
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      businessName: provider.businessName,
      description: provider.description || '',
      image: provider.images?.[0] || '',
      deliveryRadius: provider.deliveryRadius || 5,
      minimumOrder: provider.minimumOrder || 0,
      deliveryFee: provider.deliveryFee || 0,
      serviceType: provider.serviceType || { delivery: true, pickup: false },
      address: provider.address || {},
    },
  });

  const serviceType = watch('serviceType');
  const imageValue = watch('image');

  const onSubmit = async (data: ProviderFormData) => {
    setIsSaving(true);
    try {
      const response = await providersApi.update(provider._id, {
        businessName: data.businessName,
        description: data.description,
        images: data.image ? [data.image] : [],
        deliveryRadius: data.deliveryRadius,
        minimumOrder: data.minimumOrder,
        deliveryFee: data.deliveryFee,
        serviceType: data.serviceType,
        address: {
          ...data.address,
          // Use coordinates from form data if available, otherwise preserve existing
          coordinates: data.address.coordinates || provider.address?.coordinates,
        } as Provider['address'],
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

            <div className="space-y-2">
              <Label>Business Image</Label>
              <ImageUpload
                value={imageValue}
                onChange={(url) => setValue('image', url || '', { shouldDirty: true })}
                disabled={isSaving}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <AddressSelector
              control={control}
              setValue={setValue}
              watch={watch}
              register={register}
              errors={errors.address}
              namePrefix="address"
              defaultCenter={provider.address?.coordinates}
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
    </div>
  );
}
