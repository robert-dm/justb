import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Target, Users, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Executive Summary - Investor Portal | justB',
  description: 'Company overview, mission, and key value propositions for justB',
};

const highlights = [
  {
    icon: Target,
    title: 'The Problem',
    description:
      'Tourists in vacation rentals struggle to find quality local breakfast options. Traditional delivery apps focus on lunch/dinner, leaving a gap in the morning meal market.',
  },
  {
    icon: Zap,
    title: 'Our Solution',
    description:
      'justB connects tourists with local breakfast providers, offering scheduled delivery of fresh, authentic morning meals directly to vacation rentals.',
  },
  {
    icon: Users,
    title: 'Target Market',
    description:
      'Short-term rental guests in tourist destinations who value convenience and local culinary experiences. Initial focus on high-tourism coastal areas.',
  },
  {
    icon: Globe,
    title: 'Business Model',
    description:
      'Commission-based marketplace (15-20% per transaction) with premium subscriptions for providers seeking enhanced visibility and features.',
  },
];

const keyMetrics = [
  { label: 'Monthly Active Users', value: '15,000+' },
  { label: 'Registered Providers', value: '350+' },
  { label: 'Average Order Value', value: '$28' },
  { label: 'Customer Satisfaction', value: '4.8/5' },
  { label: 'Provider Retention', value: '92%' },
  { label: 'Month-over-Month Growth', value: '25%' },
];

export default function InvestorSummaryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/investors">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investor Portal
        </Button>
      </Link>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Executive Summary</h1>
        <p className="mt-2 text-text-light">
          justB: Reimagining the Morning Meal Experience for Travelers
        </p>

        {/* Mission */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-4 text-lg text-text-light">
            To become the leading platform connecting travelers with authentic
            local breakfast experiences, supporting local food entrepreneurs while
            enhancing the vacation experience for millions of tourists worldwide.
          </p>
        </section>

        {/* Highlights */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Key Highlights</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {highlights.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <item.icon className="h-10 w-10 text-primary" />
                  <h3 className="mt-4 font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-light">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Metrics */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-sm text-text-light">{metric.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Competitive Advantage */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Competitive Advantage</h2>
          <ul className="space-y-3 text-text-light">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>
                <strong>First-mover advantage</strong> in the vacation breakfast
                delivery niche
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>
                <strong>Hyperlocal focus</strong> on authentic culinary
                experiences
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>
                <strong>Strategic partnerships</strong> with vacation rental
                platforms
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>
                <strong>Recurring revenue model</strong> through subscription
                offerings
              </span>
            </li>
          </ul>
        </section>

        {/* Next Steps */}
        <section className="mt-12 rounded-lg bg-background-light p-6">
          <h2 className="text-xl font-semibold">Continue Exploring</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/investors/financials">
              <Button>View Financials</Button>
            </Link>
            <Link href="/investors/deck">
              <Button variant="outline">See Pitch Deck</Button>
            </Link>
            <Link href="/investors/market">
              <Button variant="outline">Market Research</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
