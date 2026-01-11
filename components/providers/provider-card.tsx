import Link from 'next/link';
import { Star, MapPin, Truck, Store, UtensilsCrossed } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const hasImage = provider.images && provider.images.length > 0 && provider.images[0];

  return (
    <Link href={`/providers/${provider._id}`}>
      <Card className="cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          {hasImage ? (
            <img
              src={provider.images[0]}
              alt={provider.businessName}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <UtensilsCrossed className="h-12 w-12 text-primary/40" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="mb-0.5 text-base font-semibold text-text-dark line-clamp-1">
            {provider.businessName}
          </h3>
          <p className="mb-2 line-clamp-1 text-sm text-text-light">
            {provider.description}
          </p>

          {/* Service badges */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {provider.serviceType.delivery && (
              <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                <Truck className="h-3 w-3" />
                Delivery
              </Badge>
            )}
            {provider.serviceType.pickup && (
              <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                <Store className="h-3 w-3" />
                Pickup
              </Badge>
            )}
          </div>

          {/* Rating and location */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {provider.rating.average.toFixed(1)}
              </span>
              <span className="text-text-light">
                ({provider.rating.count})
              </span>
            </div>
            <div className="flex items-center gap-1 text-text-light">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">
                {provider.address.city}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
