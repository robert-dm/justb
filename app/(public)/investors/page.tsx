import { Metadata } from 'next';
import { MapPin, Building2, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Strategic Overview - justB',
  description: 'justB strategic overview for corporate development',
};

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b bg-white px-6 py-12">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-text-dark">justB</h1>
          <p className="mt-2 text-lg text-text-light">
            Local breakfast delivery to vacation rentals
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto max-w-4xl px-6 py-12">
        <div className="space-y-10">
          {/* What it is */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-dark">What it is</h2>
            <p className="leading-relaxed text-text-dark">
              A marketplace connecting tourists in short-term rentals with local breakfast providers for scheduled morning delivery or pickup.
            </p>
          </div>

          {/* Why Lisbon First */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-text-dark">
              <MapPin className="h-5 w-5" />
              Why Lisbon first
            </h2>
            <div className="space-y-3 leading-relaxed text-text-dark">
              <p>
                Lisbon ranks <strong>5th in the EU</strong> for short-stay platform nights with <strong>11.6M guest nights</strong> (Eurostat 2025). 
                Approximately 20,000 registered STRs, with ~75% concentrated in six historic parishes: Santa Maria Maior (Alfama), Misericórdia (Bairro Alto), 
                Arroios, Santo António (Avenida da Liberdade), São Vicente, and Estrela.
              </p>
              <p>
                This density makes morning delivery operationally viable. Portuguese breakfast culture—pastelarias, padarias, traditional cafés—is 
                embedded in these neighborhoods, providing a natural supply base.
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-blue-900">
              <Calendar className="h-5 w-5" />
              Current status
            </h2>
            <div className="space-y-2 text-blue-900">
              <p>
                <strong>Product:</strong> Live prototype at <a href="https://justb-psi.vercel.app" className="underline hover:text-blue-700">justb-psi.vercel.app</a>
              </p>
              <p>
                <strong>Marketplace data:</strong> Demo listings (seeded providers and menus for Lisbon)
              </p>
              <p>
                <strong>Real providers:</strong> 0
              </p>
              <p>
                <strong>Real orders:</strong> 0
              </p>
            </div>
          </div>

          {/* Why Airbnb */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-text-dark">
              <Building2 className="h-5 w-5" />
              Why Airbnb
            </h2>
            <div className="space-y-3 leading-relaxed text-text-dark">
              <p>
                Airbnb Summer Release 2026 introduced <strong>Services</strong>: Instacart grocery delivery (US), CookUnity prepared meals (US), 
                airport pickups, luggage storage. Gap justB addresses: <strong>authentic local breakfast</strong> delivered to the rental in 
                tourist STR cities.
              </p>
              <p>
                This is not US grocery staples or heat-and-eat kits—it's the daily morning ritual at the listing. Benefits:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>Host differentiation and guest retention</li>
                <li>Take-rate on a daily habit vs. one-time airport transfer</li>
                <li>City-module approach: plug local providers into Services infrastructure</li>
                <li>Enhances "live like a local" positioning</li>
              </ul>
            </div>
          </div>

          {/* What a buyer underwrites */}
          <div>
            <h2 className="mb-3 text-xl font-semibold text-text-dark">What a buyer is underwriting</h2>
            <p className="leading-relaxed text-text-dark">
              Density of 7–9am deliveries in one compact STR neighborhood, not a global platform story. Unit of execution is the 
              parish-level provider cluster, not the city. Scale via replication: if Alfama works, Bairro Alto is next, then Príncipe Real, 
              then Porto's Ribeira, then Barcelona's Gòtic—one neighborhood at a time.
            </p>
          </div>

          {/* Contact */}
          <div className="border-t pt-8">
            <p className="text-text-dark">
              <strong>Contact:</strong> Robert · justB
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
