import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, UtensilsCrossed, Truck } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 px-6 py-20 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-4 text-4xl font-bold text-text-dark md:text-5xl">
            Start Your Vacation Day with Local Breakfast
          </h1>
          <p className="mb-8 text-lg text-text-light md:text-xl">
            Connect with local breakfast providers and get fresh, authentic meals
            delivered to your rental
          </p>

          {/* Search Bar */}
          <div className="mx-auto flex max-w-2xl gap-2 rounded-full bg-white p-2 shadow-lg">
            <input
              type="text"
              placeholder="Where are you staying?"
              className="flex-1 rounded-full px-6 py-3 text-base outline-none placeholder:text-text-light"
            />
            <Button size="lg" className="rounded-full px-8">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-text-dark">
          How It Works
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <MapPin className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Find Local Providers</h3>
              <p className="text-text-light">
                Search for breakfast providers near your vacation rental
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <UtensilsCrossed className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Browse Menus</h3>
              <p className="text-text-light">
                Discover local and traditional breakfast options
              </p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="mb-4 text-5xl">
                <Truck className="mx-auto h-12 w-12 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Get Delivered</h3>
              <p className="text-text-light">
                Schedule delivery to your door or choose pickup
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background-light px-6 py-20">
        <div className="container mx-auto">
          <h2 className="mb-12 text-center text-3xl font-bold text-text-dark">
            Why justB?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">🌍</span>Authentic Local Food
              </h3>
              <p className="text-text-light">
                Experience the true taste of your destination with traditional
                breakfast dishes
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">⏰</span>Scheduled Deliveries
              </h3>
              <p className="text-text-light">
                Set up recurring breakfast deliveries for your entire vacation stay
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">👨‍🍳</span>Support Local
              </h3>
              <p className="text-text-light">
                Help local breakfast makers and small businesses in your vacation
                area
              </p>
            </div>
            <div className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                <span className="mr-2">💳</span>Easy Payment
              </h3>
              <p className="text-text-light">
                Secure online payment with no hassle. Pay once and enjoy your
                vacation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 px-6 py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-text-dark">
            Ready to start your morning right?
          </h2>
          <p className="mb-8 text-lg text-text-light">
            Join justB and discover local breakfast options
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/providers">Find Breakfast</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">Become a Provider</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
