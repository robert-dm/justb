'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, UtensilsCrossed, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTab, MenuTab, ProfileTab } from '@/components/dashboard';
import { providersApi } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { Provider } from '@/types';

export default function DashboardPage() {
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
          <p className="mt-4 text-text-light">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error === 'no-profile') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-bold">Welcome, Provider!</h1>
          <p className="mt-2 text-text-light">
            You need to set up your business profile to start receiving orders.
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
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="mt-2 text-text-light">{error || 'Something went wrong'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{provider.businessName}</h1>
        <p className="text-text-light">Provider Dashboard</p>
      </div>

      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="orders" className="gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="menu" className="gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Settings className="h-4 w-4" />
            Profile
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

// Geocode address using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { 'User-Agent': 'justB-App' } }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// Simple form to create provider profile
function CreateProviderForm({
  onSuccess,
}: {
  onSuccess: (provider: Provider) => void;
}) {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !description.trim() || !street.trim() || !city.trim() || !zipCode.trim() || !country.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Geocode the address
      const fullAddress = `${street}, ${city}, ${zipCode}, ${country}`;
      const coordinates = await geocodeAddress(fullAddress);

      if (!coordinates) {
        toast.error('Could not geocode address. Please check the address and try again.');
        setIsSubmitting(false);
        return;
      }

      const response = await providersApi.create({
        businessName,
        description,
        address: {
          street,
          city,
          zipCode,
          country,
          coordinates,
        },
      });
      toast.success('Profile created! You can now add menu items.');
      onSuccess(response.provider);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <label htmlFor="businessName" className="text-sm font-medium">
          Business Name *
        </label>
        <input
          id="businessName"
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Your business name"
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell customers about your breakfast offerings..."
          className="w-full rounded-md border px-3 py-2 min-h-[80px]"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="street" className="text-sm font-medium">
          Street Address *
        </label>
        <input
          id="street"
          type="text"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="123 Main St"
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium">
            City *
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="zipCode" className="text-sm font-medium">
            ZIP Code *
          </label>
          <input
            id="zipCode"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="12345"
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="country" className="text-sm font-medium">
          Country *
        </label>
        <input
          id="country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Country"
          className="w-full rounded-md border px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Creating...' : 'Create Profile'}
      </button>
    </form>
  );
}
