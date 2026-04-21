'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddMenuItemForm } from './add-menu-item-form';
import { menuItemsApi } from '@/lib/api';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/utils/format';
import { useTranslation } from '@/hooks';

interface MenuTabProps {
  providerId: string;
}

export function MenuTab({ providerId }: MenuTabProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchMenuItems();
  }, [providerId]);

  async function fetchMenuItems() {
    try {
      const response = await menuItemsApi.getByProvider(providerId);
      setMenuItems(response.menuItems);
    } catch (error) {
      toast.error(t('dashboardMenu', 'failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingId(item._id);
    try {
      const response = await menuItemsApi.toggleAvailability(item._id);
      setMenuItems((prev) =>
        prev.map((i) => (i._id === item._id ? response.menuItem : i))
      );
      toast.success(response.menuItem.available ? t('dashboardMenu', 'isNowAvailable', { name: item.name }) : t('dashboardMenu', 'isNowUnavailable', { name: item.name }));
    } catch (error) {
      toast.error(t('dashboardMenu', 'failedToToggle'));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(t('dashboardMenu', 'confirmDelete', { name: item.name }))) return;

    setDeletingId(item._id);
    try {
      await menuItemsApi.delete(item._id);
      setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
      toast.success(t('dashboardMenu', 'itemDeleted'));
    } catch (error) {
      toast.error(t('dashboardMenu', 'failedToDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = (item: MenuItem, isNew: boolean) => {
    if (isNew) {
      setMenuItems((prev) => [item, ...prev]);
    } else {
      setMenuItems((prev) =>
        prev.map((i) => (i._id === item._id ? item : i))
      );
    }
    setShowForm(false);
    setEditingItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showForm || editingItem) {
    return (
      <AddMenuItemForm
        providerId={providerId}
        item={editingItem || undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {t('dashboardMenu', 'menuItems', { count: menuItems.length })}
        </h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('dashboardMenu', 'addItem')}
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-light">{t('dashboardMenu', 'noMenuItems')}</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboardMenu', 'addFirstItem')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => (
            <Card key={item._id} className={!item.available ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <Badge
                        variant={item.available ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.available ? t('menu', 'available') : t('menu', 'unavailable')}
                      </Badge>
                    </div>

                    {item.description && (
                      <p className="mt-1 text-sm text-text-light line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {item.category && (
                      <Badge variant="outline" className="mt-2 text-xs capitalize">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(item)}
                    disabled={togglingId === item._id}
                  >
                    {togglingId === item._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : item.available ? (
                      <>
                        <ToggleRight className="mr-1 h-4 w-4" />
                        {t('dashboardMenu', 'disable')}
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="mr-1 h-4 w-4" />
                        {t('dashboardMenu', 'enable')}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    {t('common', 'edit')}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item._id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deletingId === item._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-4 w-4" />
                        {t('common', 'delete')}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
