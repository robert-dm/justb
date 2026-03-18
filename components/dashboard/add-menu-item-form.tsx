'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { menuItemsApi } from '@/lib/api';
import { MenuItem, MenuCategory, Allergen } from '@/types';
import { useTranslation } from '@/hooks';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  category: z.string().optional(),
  image: z.string().optional(),
  preparationTime: z.number().min(1).optional(),
  allergens: z.string().optional(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface AddMenuItemFormProps {
  providerId: string;
  item?: MenuItem;
  onSuccess: (item: MenuItem, isNew: boolean) => void;
  onCancel: () => void;
}

export function AddMenuItemForm({
  providerId,
  item,
  onSuccess,
  onCancel,
}: AddMenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!item;
  const { t } = useTranslation();

  const categories: { value: MenuCategory; label: string }[] = [
    { value: 'traditional', label: t('dashboardMenuItem', 'traditional') },
    { value: 'continental', label: t('dashboardMenuItem', 'continental') },
    { value: 'vegan', label: t('dashboardMenuItem', 'vegan') },
    { value: 'gluten-free', label: t('dashboardMenuItem', 'glutenFree') },
    { value: 'sweet', label: t('dashboardMenuItem', 'sweet') },
    { value: 'savory', label: t('dashboardMenuItem', 'savory') },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      category: item?.category || '',
      image: item?.image || '',
      preparationTime: item?.preparationTime || undefined,
      allergens: item?.allergens?.join(', ') || '',
    },
  });

  const selectedCategory = watch('category');
  const imageValue = watch('image');

  const onSubmit = async (data: MenuItemFormData) => {
    setIsSubmitting(true);

    const payload = {
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      category: data.category as MenuCategory || undefined,
      image: data.image || undefined,
      preparationTime: data.preparationTime || undefined,
      allergens: data.allergens
        ? data.allergens.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean) as Allergen[]
        : undefined,
    };

    try {
      if (isEditing) {
        const response = await menuItemsApi.update(item._id, payload);
        toast.success(t('dashboardMenuItem', 'itemUpdated'));
        onSuccess(response.menuItem, false);
      } else {
        const response = await menuItemsApi.create(providerId, payload);
        toast.success(t('dashboardMenuItem', 'itemCreated'));
        onSuccess(response.menuItem, true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('dashboardMenuItem', 'failedToSave'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>{t('dashboardMenuItem', isEditing ? 'editMenuItem' : 'addMenuItem')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('dashboardMenuItem', 'nameLabel')}</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t('dashboardMenuItem', 'namePlaceholder')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t('dashboardMenuItem', 'priceLabel')}</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('dashboardMenuItem', 'descriptionLabel')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('dashboardMenuItem', 'descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">{t('dashboardMenuItem', 'categoryLabel')}</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboardMenuItem', 'selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparationTime">{t('dashboardMenuItem', 'preparationTime')}</Label>
              <Input
                id="preparationTime"
                type="number"
                {...register('preparationTime', { valueAsNumber: true })}
                placeholder="e.g., 15"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('dashboardMenuItem', 'image')}</Label>
            <ImageUpload
              value={imageValue}
              onChange={(url) => setValue('image', url || '')}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergens">{t('dashboardMenuItem', 'allergensLabel')}</Label>
            <Input
              id="allergens"
              {...register('allergens')}
              placeholder="e.g., gluten, dairy, nuts"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('common', 'cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('dashboardMenuItem', isEditing ? 'updating' : 'creating')}
                </>
              ) : (
                t('dashboardMenuItem', isEditing ? 'updateItem' : 'createItem')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
