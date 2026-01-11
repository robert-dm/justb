import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Financial Projections - Investor Portal | justB',
  description: 'Revenue projections, unit economics, and funding details for justB',
};

const revenueProjections = [
  { year: '2024', revenue: '$480K', growth: '-' },
  { year: '2025', revenue: '$1.8M', growth: '275%' },
  { year: '2026', revenue: '$5.2M', growth: '189%' },
  { year: '2027', revenue: '$12.5M', growth: '140%' },
  { year: '2028', revenue: '$28M', growth: '124%' },
];

const unitEconomics = [
  { label: 'Average Order Value (AOV)', value: '$28' },
  { label: 'Commission Rate', value: '18%' },
  { label: 'Revenue per Order', value: '$5.04' },
  { label: 'Customer Acquisition Cost', value: '$12' },
  { label: 'Customer Lifetime Value', value: '$145' },
  { label: 'LTV:CAC Ratio', value: '12:1' },
];

const fundingUse = [
  { category: 'Product Development', percentage: 40, amount: '$1M' },
  { category: 'Marketing & Growth', percentage: 30, amount: '$750K' },
  { category: 'Operations', percentage: 15, amount: '$375K' },
  { category: 'Team Expansion', percentage: 15, amount: '$375K' },
];

export default function InvestorFinancialsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/investors">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investor Portal
        </Button>
      </Link>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Financial Projections</h1>
        <p className="mt-2 text-text-light">
          Comprehensive financial overview and growth projections
        </p>

        {/* Funding Round */}
        <section className="mt-12">
          <Card className="border-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">$2.5M Seed Round</h2>
                  <p className="text-text-light">
                    Pre-money valuation: $10M | Target close: Q2 2025
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Revenue Projections */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Year</th>
                      <th className="py-3 text-right">Revenue</th>
                      <th className="py-3 text-right">YoY Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueProjections.map((row, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 font-medium">{row.year}</td>
                        <td className="py-3 text-right text-primary">
                          {row.revenue}
                        </td>
                        <td className="py-3 text-right text-text-light">
                          {row.growth}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Unit Economics */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Unit Economics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {unitEconomics.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-background-light p-4"
                  >
                    <span className="text-text-light">{item.label}</span>
                    <span className="font-semibold text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Use of Funds */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Use of Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundingUse.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium">
                        {item.amount} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Assumptions */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold">Key Assumptions</h2>
          <ul className="space-y-2 text-text-light">
            <li>- Geographic expansion to 5 new markets by 2026</li>
            <li>- Provider base growth of 50% annually</li>
            <li>- Average orders per user increasing from 3 to 5 per month</li>
            <li>- Gradual commission rate optimization</li>
            <li>- Premium subscription tier launch in Q3 2025</li>
          </ul>
        </section>

        {/* Navigation */}
        <section className="mt-12 rounded-lg bg-background-light p-6">
          <h2 className="text-xl font-semibold">Continue Exploring</h2>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link href="/investors/deck">
              <Button>View Pitch Deck</Button>
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
