import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'Investor FAQ - Investor Portal | justB',
  description: 'Common questions about investing in justB',
};

const faqs = [
  {
    category: 'Investment Opportunity',
    questions: [
      {
        q: 'What is the current funding round?',
        a: 'We are raising a $2.5M Seed round at a $10M pre-money valuation. The round is led by strategic angel investors with experience in food tech and hospitality.',
      },
      {
        q: 'What is the minimum investment amount?',
        a: 'The minimum investment for this round is $50,000. We are open to discussions for larger allocations with strategic value-add investors.',
      },
      {
        q: 'What type of securities are being offered?',
        a: 'We are offering SAFE (Simple Agreement for Future Equity) notes with a valuation cap and standard investor-friendly terms.',
      },
      {
        q: 'What is the expected timeline for this round?',
        a: 'We are targeting to close the round by Q2 2025. Early commitments will receive priority allocation.',
      },
    ],
  },
  {
    category: 'Business Model',
    questions: [
      {
        q: 'How does justB make money?',
        a: 'Our primary revenue comes from commissions on transactions (15-20%). Secondary revenue streams include provider subscription fees for premium features and sponsored placements.',
      },
      {
        q: 'What is your competitive moat?',
        a: 'Our competitive advantages include: (1) First-mover in dedicated vacation breakfast delivery, (2) Deep provider relationships in key markets, (3) Proprietary matching algorithm for breakfast preferences, (4) Strategic partnerships with vacation rental platforms.',
      },
      {
        q: 'How do you acquire customers?',
        a: 'Multi-channel acquisition: (1) Partnerships with vacation rental platforms, (2) SEO/content marketing targeting travelers, (3) Social media presence in foodie communities, (4) Referral programs for both guests and providers.',
      },
    ],
  },
  {
    category: 'Market & Growth',
    questions: [
      {
        q: 'How big is the addressable market?',
        a: 'The global vacation rental market generates 500M+ nights annually. With an average breakfast spend of $25, the total addressable market exceeds $12B. We are initially targeting $500M in high-tourism coastal markets.',
      },
      {
        q: 'What is your expansion strategy?',
        a: 'Phase 1 (Current): Consolidate presence in coastal vacation markets. Phase 2 (2025): Expand to mountain/ski resort communities. Phase 3 (2026): Urban vacation hotspots. Phase 4 (2027+): International expansion.',
      },
      {
        q: 'Who are your main competitors?',
        a: 'Direct competitors are limited - this is a blue ocean opportunity. Indirect competition includes general food delivery (DoorDash, UberEats), hotel room service, and local cafes without delivery infrastructure.',
      },
    ],
  },
  {
    category: 'Financials & Metrics',
    questions: [
      {
        q: 'What are your current unit economics?',
        a: 'AOV: $28, Take rate: 18%, Revenue/order: $5.04, CAC: $12, LTV: $145, LTV:CAC ratio: 12:1. These metrics have been improving quarter over quarter.',
      },
      {
        q: 'When do you expect to be profitable?',
        a: 'We project reaching profitability in 2027 at the operating level, with significant scale achieved in 2026. The path includes improving margins through operational efficiency and increasing order frequency.',
      },
      {
        q: 'How will you use the funds raised?',
        a: '40% Product Development (mobile apps, provider tools), 30% Marketing & Growth (market expansion, user acquisition), 15% Operations (customer support, logistics optimization), 15% Team (key hires in engineering and sales).',
      },
    ],
  },
  {
    category: 'Team & Operations',
    questions: [
      {
        q: 'Who is on the founding team?',
        a: 'Our founding team brings experience from DoorDash, Airbnb, and Toast. Combined 25+ years in food tech, hospitality, and marketplace businesses.',
      },
      {
        q: 'What key hires are planned?',
        a: 'With this funding, we plan to hire: VP of Engineering, Head of Growth, Market Expansion Leads for new regions, and additional engineers for mobile development.',
      },
    ],
  },
];

export default function InvestorFAQPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/investors">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Investor Portal
        </Button>
      </Link>

      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold">Investor FAQ</h1>
        <p className="mt-2 text-text-light">
          Common questions about the justB investment opportunity
        </p>

        {/* FAQ Sections */}
        {faqs.map((section, sectionIndex) => (
          <section key={sectionIndex} className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-primary">
              {section.category}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {section.questions.map((faq, faqIndex) => (
                <AccordionItem
                  key={faqIndex}
                  value={`${sectionIndex}-${faqIndex}`}
                >
                  <AccordionTrigger className="text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-text-light">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        {/* Contact CTA */}
        <section className="mt-12 rounded-lg bg-background-light p-6 text-center">
          <h2 className="text-xl font-semibold">Still Have Questions?</h2>
          <p className="mt-2 text-text-light">
            Our investor relations team is happy to answer any additional
            questions you may have.
          </p>
          <a
            href="mailto:investors@justb.app"
            className="mt-4 inline-block rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-primary/90"
          >
            Contact Us
          </a>
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
