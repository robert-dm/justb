import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Pitch Deck - Investor Portal | justB',
  description: 'Complete investor presentation for justB',
};

const slides = [
  {
    number: 1,
    title: 'Cover',
    content: 'justB - Breakfast, Delivered Fresh\nConnecting travelers with local breakfast artisans',
  },
  {
    number: 2,
    title: 'The Problem',
    content: 'Tourists in vacation rentals lack access to quality breakfast options. Hotels have room service, but Airbnb guests are left to fend for themselves.',
  },
  {
    number: 3,
    title: 'Our Solution',
    content: 'A marketplace connecting travelers with local breakfast providers. Fresh, authentic morning meals delivered to your vacation rental.',
  },
  {
    number: 4,
    title: 'Market Opportunity',
    content: '$12B vacation breakfast market. 500M+ vacation rental nights annually. Only 2% currently served by dedicated breakfast delivery.',
  },
  {
    number: 5,
    title: 'Business Model',
    content: 'Commission-based marketplace (15-20%). Additional revenue from provider subscriptions and premium placement.',
  },
  {
    number: 6,
    title: 'Traction',
    content: '15K+ active users. 350+ providers. $480K ARR. 4.8/5 customer rating. 92% provider retention.',
  },
  {
    number: 7,
    title: 'Growth Strategy',
    content: 'Phase 1: Coastal markets. Phase 2: Mountain/ski resorts. Phase 3: Urban vacation hotspots. Phase 4: International expansion.',
  },
  {
    number: 8,
    title: 'Competition',
    content: 'DoorDash/UberEats: General delivery, no breakfast focus. Hotel room service: Limited to hotels. Local cafes: No delivery infrastructure.',
  },
  {
    number: 9,
    title: 'Team',
    content: 'Experienced founders from hospitality tech, food delivery, and marketplace platforms. Advisory board includes vacation rental executives.',
  },
  {
    number: 10,
    title: 'Financials',
    content: '2024: $480K. 2025: $1.8M. 2026: $5.2M. Path to profitability: 2027. Gross margin: 45%.',
  },
  {
    number: 11,
    title: 'The Ask',
    content: '$2.5M Seed Round. Use: 40% Product, 30% Marketing, 15% Operations, 15% Team. 18-month runway.',
  },
  {
    number: 12,
    title: 'Thank You',
    content: 'Contact: investors@justb.app\nWebsite: justb.app',
  },
];

export default function InvestorDeckPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/investors">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investor Portal
        </Button>
      </Link>

      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pitch Deck</h1>
            <p className="mt-2 text-text-light">
              Complete investor presentation - {slides.length} slides
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        {/* Slide Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {slides.map((slide) => (
            <Card
              key={slide.number}
              className="overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="bg-gradient-to-br from-primary to-secondary p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-75">Slide {slide.number}</span>
                  <span className="font-semibold">{slide.title}</span>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="whitespace-pre-line text-sm text-text-light">
                  {slide.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Presentation Note */}
        <section className="mt-12 rounded-lg border-2 border-dashed border-muted p-8 text-center">
          <h2 className="text-xl font-semibold">Request Full Presentation</h2>
          <p className="mt-2 text-text-light">
            For a detailed walkthrough of our pitch deck with full visuals and
            supporting data, please schedule a call with our team.
          </p>
          <Button className="mt-4">
            Schedule Presentation
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </section>

        {/* Navigation */}
        <section className="mt-12 rounded-lg bg-background-light p-6">
          <h2 className="text-xl font-semibold">Continue Exploring</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/investors/financials">
              <Button>View Financials</Button>
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
