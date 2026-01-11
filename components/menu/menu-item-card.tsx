'use client';

import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuantityControl } from './quantity-control';
import { MenuItem } from '@/types';
import { useCartStore } from '@/stores';
import { formatCurrency } from '@/lib/utils/format';

interface MenuItemCardProps {
  item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const cartItem = items.find((i) => i.menuItemId === item._id);
  const quantity = cartItem?.quantity || 0;

  const handleIncrease = () => {
    if (quantity === 0) {
      addItem(item);
    } else {
      updateQuantity(item._id, quantity + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity === 1) {
      removeItem(item._id);
    } else {
      updateQuantity(item._id, quantity - 1);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary hover:bg-primary/5">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-text-dark">{item.name}</h4>
            {item.description && (
              <p className="mt-1 text-sm text-text-light line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="ml-4 h-16 w-16 rounded-lg object-cover"
            />
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-primary">
            {formatCurrency(item.price)}
          </span>

          {item.category && (
            <Badge variant="secondary" className="text-xs capitalize">
              {item.category}
            </Badge>
          )}

          {item.preparationTime && (
            <span className="flex items-center gap-1 text-xs text-text-light">
              <Clock className="h-3 w-3" />
              {item.preparationTime} min
            </span>
          )}
        </div>

        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.allergens.map((allergen) => (
              <Badge
                key={allergen}
                variant="outline"
                className="text-xs capitalize"
              >
                {allergen}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="ml-4">
        {quantity === 0 ? (
          <Button onClick={handleIncrease} size="sm">
            Add
          </Button>
        ) : (
          <QuantityControl
            quantity={quantity}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
          />
        )}
      </div>
    </div>
  );
}
