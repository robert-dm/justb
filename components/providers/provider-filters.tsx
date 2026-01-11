'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ProviderFiltersProps {
  onUseLocation: () => void;
  isLoadingLocation?: boolean;
}

export function ProviderFilters({
  onUseLocation,
  isLoadingLocation,
}: ProviderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.has(key)) {
        params.delete(key);
      } else {
        params.set(key, 'true');
      }
      router.push(`/providers?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4 rounded-lg bg-background-light p-6">
      {/* Search and Location */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Enter your location..."
            defaultValue={searchParams.get('location') || ''}
            onChange={(e) => updateFilter('location', e.target.value || null)}
            className="bg-white"
          />
          <Button
            variant="secondary"
            onClick={onUseLocation}
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Use My Location</span>
          </Button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-6">
        <span className="font-medium text-text-dark">Filters:</span>

        {/* Delivery */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="delivery"
            checked={searchParams.has('delivery')}
            onCheckedChange={() => toggleFilter('delivery')}
          />
          <Label htmlFor="delivery" className="cursor-pointer text-sm">
            Delivery Available
          </Label>
        </div>

        {/* Pickup */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="pickup"
            checked={searchParams.has('pickup')}
            onCheckedChange={() => toggleFilter('pickup')}
          />
          <Label htmlFor="pickup" className="cursor-pointer text-sm">
            Pickup Available
          </Label>
        </div>

        {/* Cuisine */}
        <Select
          value={searchParams.get('cuisine') || 'all'}
          onValueChange={(value) => updateFilter('cuisine', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-40 bg-white">
            <SelectValue placeholder="All Cuisines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cuisines</SelectItem>
            <SelectItem value="traditional">Traditional</SelectItem>
            <SelectItem value="continental">Continental</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="gluten-free">Gluten-Free</SelectItem>
          </SelectContent>
        </Select>

        {/* Rating */}
        <Select
          value={searchParams.get('minRating') || 'all'}
          onValueChange={(value) => updateFilter('minRating', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
