import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Users, Globe, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Market Research - Investor Portal | justB',
  description: 'Industry analysis, competition, and market trends for justB',
};

const marketSize = [
  { segment: 'Total Addressable Market (TAM)', value: '$12B', description: 'Global vacation rental breakfast opportunity' },
  { segment: 'Serviceable Addressable Market (SAM)', value: '$3B', description: 'English-speaking markets' },
  { segment: 'Serviceable Obtainable Market (SOM)', value: '$500M', description: 'High-tourism coastal regions (initial target)' },
];

const industryTrends = [
  {
    icon: TrendingUp,
    title: 'Vacation Rental Growth',
    stat: '15% CAGR',
    description: 'The vacation rental market continues to outpace traditional hospitality, with Airbnb and VRBO driving mainstream adoption.',
  },
  {
    icon: Users,
    title: 'Experience-Seeking Travelers',
    stat: '78%',
    description: 'Of millennial travelers prioritize local culinary experiences over convenience dining options.',
  },
  {
    icon: Globe,
    title: 'Food Delivery Expansion',
    stat: '$150B+',
    description: 'Global food delivery market size, with breakfast as the fastest-growing meal category.',
  },
  {
    icon: Target,
    title: 'Local Food Movement',
    stat: '3x Growth',
    description: 'Consumer preference for locally-sourced food has tripled in the past 5 years.',
  },
];

const competitors = [
  {
    name: 'General Delivery Apps',
    examples: 'DoorDash, UberEats, Grubhub',
    strengths: 'Brand recognition, logistics infrastructure, restaurant partnerships',
    weaknesses: 'No breakfast focus, limited vacation rental integration, no local artisan curation',
  },
  {
    name: 'Hotel Room Service',
    examples: 'Major hotel chains',
    strengths: 'Convenience, established process, captive audience',
    weaknesses: 'Limited to hotels only, generic menus, high markups',
  },
  {
    name: 'Local Cafes/Restaurants',
    examples: 'Independent breakfast spots',
    strengths: 'Authentic local experience, quality food',
    weaknesses: 'No delivery infrastructure, limited hours, difficult to discover',
  },
  {
    name: 'Meal Kit Services',
    examples: 'HelloFresh, Blue Apron',
    strengths: 'Subscription model, quality ingredients',
    weaknesses: 'Requires cooking, not suited for short stays, no local flavor',
  },
];

const targetCustomers = [
  { segment: 'Vacation Rental Guests', percentage: 60, description: 'Primary target - travelers staying in Airbnb, VRBO, and similar rentals' },
  { segment: 'Business Travelers', percentage: 20, description: 'Extended stay travelers seeking home-like breakfast options' },
  { segment: 'Local Event Attendees', percentage: 15, description: 'Wedding guests, conference attendees in vacation rentals' },
  { segment: 'Staycationers', percentage: 5, description: 'Local residents treating themselves to special breakfast delivery' },
];

export default function InvestorMarketPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/investors">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investor Portal
        </Button>
      </Link>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Market Research</h1>
        <p className="mt-2 text-text-light">
          Industry analysis, competitive landscape, and growth opportunities
        </p>

        {/* Market Size */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Market Size</h2>
          <div className="space-y-4">
            {marketSize.map((item, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="font-medium">{item.segment}</p>
                    <p className="text-sm text-text-light">{item.description}</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Industry Trends */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Industry Trends</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {industryTrends.map((trend, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <trend.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{trend.title}</p>
                      <p className="text-2xl font-bold text-primary">{trend.stat}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-text-light">{trend.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Competitive Landscape */}
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-semibold">Competitive Landscape</h2>
          <div className="space-y-4">
            {competitors.map((comp, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{comp.name}</CardTitle>
                  <p className="text-sm text-text-light">{comp.examples}</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-green-600">Strengths</p>
                    <p className="mt-1 text-sm text-text-light">{comp.strengths}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Weaknesses</p>
                    <p className="mt-1 text-sm text-text-light">{comp.weaknesses}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Target Customers */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Target Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetCustomers.map((customer, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{customer.segment}</span>
                      <span className="text-primary">{customer.percentage}%</span>
                    </div>
                    <p className="mt-1 text-xs text-text-light">{customer.description}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${customer.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Insights */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Key Market Insights</h2>
          <div className="rounded-lg bg-background-light p-6">
            <ul className="space-y-3 text-text-light">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>The vacation breakfast market is underserved with no dedicated solution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Travelers increasingly seek authentic local experiences over generic options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Vacation rental platforms are actively seeking value-add services for guests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Local food entrepreneurs need distribution channels to reach tourists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">5.</span>
                <span>Scheduled delivery (vs. on-demand) creates operational efficiency</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Navigation */}
        <section className="mt-12 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Continue Exploring</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/investors/summary">
              <Button>Executive Summary</Button>
            </Link>
            <Link href="/investors/financials">
              <Button variant="outline">Financials</Button>
            </Link>
            <Link href="/investors/deck">
              <Button variant="outline">Pitch Deck</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
