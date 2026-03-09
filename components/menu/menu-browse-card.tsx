'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Clock, Truck, UtensilsCrossed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuantityControl } from './quantity-control';
import { MenuItem, Provider } from '@/types';
import { useCartStore } from '@/stores';
import { formatCurrency } from '@/lib/utils/format';

// --- Provider header + scrollable items row ---

interface ProviderMenuSectionProps {
  provider: Provider;
  items: (MenuItem & { providerId: Provider })[];
}

export function ProviderMenuSection({ provider, items }: ProviderMenuSectionProps) {
  const hasImage = provider.images && provider.images.length > 0 && provider.images[0];

  return (
    <div>
      {/* Provider header */}
      <Link
        href={`/providers/${provider._id}`}
        className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {hasImage ? (
            <img
              src={provider.images[0]}
              alt={provider.businessName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <UtensilsCrossed className="h-7 w-7 text-primary/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-text-dark text-lg leading-tight">
              {provider.businessName}
            </h3>
            {provider.rating?.average > 0 && (
              <span className="flex items-center gap-1 text-sm flex-shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{provider.rating.average.toFixed(1)}</span>
              </span>
            )}
          </div>

          {provider.cuisine && provider.cuisine.length > 0 && (
            <p className="text-sm text-text-light mt-0.5">
              {provider.cuisine.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(' · ')}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-xs text-text-light">
            {provider.serviceType?.delivery && (
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5" />
                {formatCurrency(provider.deliveryFee || 0)}
              </span>
            )}
            {provider.serviceType?.pickup && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                Pickup
              </Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Horizontal scrollable menu items */}
      <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
        {items.map((item) => (
          <MenuItemTile key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

// --- Individual item tile ---

interface MenuItemTileProps {
  item: MenuItem & { providerId: Provider };
}

function MenuItemTile({ item }: MenuItemTileProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { items, addItem, updateQuantity, removeItem, setProvider } = useCartStore();
  const provider = item.providerId;

  const cartItem = items.find((i) => i.menuItemId === item._id);
  const quantity = cartItem?.quantity || 0;

  const handleIncrease = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (quantity === 0) {
      addItem({ ...item, providerId: provider._id });
      setProvider(provider);
    } else {
      updateQuantity(item._id, quantity + 1);
    }
  };

  const handleDecrease = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (quantity === 1) {
      removeItem(item._id);
    } else {
      updateQuantity(item._id, quantity - 1);
    }
  };

  return (
    <>
      <div
        className="flex-shrink-0 w-40 sm:w-44 cursor-pointer"
        onClick={() => setShowPreview(true)}
      >
        {/* Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}

          {/* Add button overlay */}
          <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
            {quantity === 0 ? (
              <Button
                onClick={(e) => handleIncrease(e)}
                size="sm"
                className="h-8 w-8 rounded-full p-0 shadow-lg"
              >
                +
              </Button>
            ) : (
              <div className="bg-background rounded-full shadow-lg">
                <QuantityControl
                  quantity={quantity}
                  onIncrease={() => handleIncrease()}
                  onDecrease={() => handleDecrease()}
                />
              </div>
            )}
          </div>
        </div>

        {/* Item info */}
        <div className="mt-2 px-0.5">
          <h4 className="text-sm font-medium text-text-dark line-clamp-2 leading-tight">
            {item.name}
          </h4>
          <p className="mt-1 text-sm font-bold text-text-dark">
            {formatCurrency(item.price)}
          </p>
        </div>
      </div>

      {/* Item preview dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          {/* Image */}
          {item.image && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Title + price */}
            <div className="flex items-start justify-between gap-3">
              <DialogTitle className="text-xl font-bold text-text-dark">
                {item.name}
              </DialogTitle>
              <span className="text-xl font-bold text-primary flex-shrink-0">
                {formatCurrency(item.price)}
              </span>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-text-light leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {item.category}
              </Badge>
              {item.preparationTime > 0 && (
                <span className="flex items-center gap-1 text-sm text-text-light">
                  <Clock className="h-3.5 w-3.5" />
                  {item.preparationTime} min
                </span>
              )}
            </div>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-light mb-1.5">Allergens</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.allergens.map((allergen) => (
                    <Badge key={allergen} variant="outline" className="text-xs capitalize">
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="pt-2">
              {quantity === 0 ? (
                <Button onClick={() => handleIncrease()} className="w-full" size="lg">
                  Add to order — {formatCurrency(item.price)}
                </Button>
              ) : (
                <div className="flex items-center justify-between">
                  <QuantityControl
                    quantity={quantity}
                    onIncrease={() => handleIncrease()}
                    onDecrease={() => handleDecrease()}
                  />
                  <span className="text-lg font-bold text-text-dark">
                    {formatCurrency(item.price * quantity)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
