import Link from 'next/link';
import { Star, MapPin, Truck, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Provider } from '@/types';
import { formatCurrency } from '@/lib/utils/format';

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const defaultImage = '/images/default-breakfast.jpg';

  return (
    <Link href={`/providers/${provider._id}`}>
      <Card className="cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={provider.images[0] || defaultImage}
            alt={provider.businessName}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 text-lg font-semibold text-text-dark">
            {provider.businessName}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-text-light">
            {provider.description}
          </p>

          {/* Service badges */}
          <div className="mb-3 flex flex-wrap gap-2">
            {provider.serviceType.delivery && (
              <Badge variant="secondary" className="gap-1">
                <Truck className="h-3 w-3" />
                Delivery
              </Badge>
            )}
            {provider.serviceType.pickup && (
              <Badge variant="outline" className="gap-1">
                <Store className="h-3 w-3" />
                Pickup
              </Badge>
            )}
          </div>

          {/* Rating and price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {provider.rating.average.toFixed(1)}
              </span>
              <span className="text-sm text-text-light">
                ({provider.rating.count})
              </span>
            </div>
            {provider.minimumOrder > 0 && (
              <span className="text-sm font-medium text-text-dark">
                Min {formatCurrency(provider.minimumOrder)}
              </span>
            )}
          </div>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1 text-xs text-text-light">
            <MapPin className="h-3 w-3" />
            <span>
              {provider.address.city}, {provider.address.state || provider.address.country}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
