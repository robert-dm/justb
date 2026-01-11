import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  TrendingUp,
  PresentationIcon,
  HelpCircle,
  BarChart3,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Investor Portal - justB',
  description: 'Investment information and resources for justB stakeholders',
};

const stats = [
  { number: '$2.5M', label: 'Seed Funding Target' },
  { number: '10x', label: 'Revenue Growth YoY' },
  { number: '45%', label: 'Gross Margin' },
  { number: '15K+', label: 'Active Users' },
];

const navCards = [
  {
    icon: FileText,
    title: 'Executive Summary',
    description: 'Company overview, mission, and key value propositions',
    href: '/investors/summary',
  },
  {
    icon: TrendingUp,
    title: 'Financials',
    description: 'Revenue projections, unit economics, and funding details',
    href: '/investors/financials',
  },
  {
    icon: PresentationIcon,
    title: 'Pitch Deck',
    description: 'Complete investor presentation with market analysis',
    href: '/investors/deck',
  },
  {
    icon: HelpCircle,
    title: 'Investor FAQ',
    description: 'Common questions about the investment opportunity',
    href: '/investors/faq',
  },
  {
    icon: BarChart3,
    title: 'Market Research',
    description: 'Industry analysis, competition, and growth trends',
    href: '/investors/market',
  },
];

export default function InvestorsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary px-4 py-20 text-center text-white">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold md:text-5xl">Investor Portal</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl opacity-95">
            Welcome to the justB investor portal. Access comprehensive information
            about our investment opportunity.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="py-8 text-center">
                <p className="text-4xl font-bold text-primary">{stat.number}</p>
                <p className="mt-2 text-text-light">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Confidential Notice */}
      <section className="container mx-auto px-4">
        <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-yellow-800">
            <Lock className="h-5 w-5" />
            <span className="font-medium">Confidential Information</span>
          </div>
          <p className="mt-2 text-sm text-yellow-700">
            The information contained in this portal is confidential and intended
            solely for potential investors. Please do not distribute without
            authorization.
          </p>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Investment Resources
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card, index) => (
            <Link key={index} href={card.href}>
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6">
                  <card.icon className="h-12 w-12 text-primary" />
                  <h3 className="mt-4 text-lg font-semibold text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-text-light">{card.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-background-light px-4 py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold">Ready to Learn More?</h2>
          <p className="mx-auto mt-4 max-w-lg text-text-light">
            Contact our investor relations team to schedule a call or request
            additional information.
          </p>
          <a
            href="mailto:investors@justb.app"
            className="mt-6 inline-block rounded-lg bg-primary px-8 py-3 font-medium text-white hover:bg-primary/90"
          >
            Contact Investor Relations
          </a>
        </div>
      </section>
    </div>
  );
}
