import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, Star } from 'lucide-react';

export default function Pricing() {
  const { user, setView } = useStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (plan: 'pro' | 'free') => {
    setSelectedPlan(plan);
    setTimeout(() => {
      setView('bookshelf');
      setSelectedPlan(null);
    }, 500);
  };

  const faqs = [
    {
      question: 'Can I switch plans at any time?',
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges or credits to your account.",
    },
    {
      question: 'Is there a free trial for the Professional plan?',
      answer:
        'We offer a 14-day free trial of the Professional plan so you can experience all features before committing. No credit card required.',
    },
    {
      question: 'What formats can I export my books in?',
      answer:
        'With the Free plan, you can export to PDF (watermarked) and view previews. The Professional plan adds unwatermarked PDFs, ePub, and MOBI formats for digital distribution.',
    },
    {
      question: 'How many team members can I invite?',
      answer:
        'The Free plan is limited to personal use. The Professional plan allows you to invite up to 5 collaborators per project, perfect for working with editors and designers.',
    },
  ];

  const features = {
    free: [
      { text: '1 project', included: true },
      { text: 'Basic typesetting', included: true },
      { text: 'Cover calculator', included: true },
      { text: 'PDF export (watermarked)', included: true },
      { text: 'Cloud storage (1 GB)', included: true },
      { text: 'Full typesetting presets', included: false },
      { text: 'AI cover generation', included: false },
      { text: 'Unwatermarked exports', included: false },
      { text: 'Version history', included: false },
      { text: 'Priority support', included: false },
    ],
    pro: [
      { text: 'Unlimited projects', included: true },
      { text: 'Full typesetting with all presets', included: true },
      { text: 'AI cover generation', included: true },
      { text: 'Unwatermarked PDF export', included: true },
      { text: 'ePub & MOBI exports', included: true },
      { text: 'Cloud storage (50 GB)', included: true },
      { text: 'Complete version history', included: true },
      { text: 'Collaborator invites (5 per project)', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Monthly webinars & training', included: true },
    ],
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=EB+Garamond:wght@400;500&display=swap');

        .decorative-rule {
          width: 60px;
          height: 1px;
          background-color: #8b6914;
          margin: 0 auto;
        }

        .pricing-card {
          background-color: #ffffff;
          border: 1px solid #e8e2d9;
          border-radius: 4px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
        }

        .pricing-card.pro {
          border: 2px solid #8b6914;
          transform: scale(1.02);
        }

        .pricing-card:hover {
          box-shadow: 0 12px 32px rgba(44, 36, 32, 0.12);
        }

        .pricing-card.pro:hover {
          box-shadow: 0 12px 32px rgba(139, 105, 20, 0.2);
        }

        .recommended-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #8b6914;
          color: #ffffff;
          padding: 0.375rem 1rem;
          border-radius: 20px;
          font-family: 'EB Garamond', serif;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .plan-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          color: #2c2420;
          margin-bottom: 0.5rem;
        }

        .plan-price {
          font-family: 'EB Garamond', serif;
          font-size: 2.5rem;
          font-weight: 500;
          color: #2c2420;
          margin-bottom: 0.25rem;
        }

        .plan-price-period {
          font-family: 'EB Garamond', serif;
          font-size: 0.95rem;
          color: #9a8e82;
          margin-bottom: 1.5rem;
        }

        .plan-description {
          font-family: 'EB Garamond', serif;
          color: #9a8e82;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .feature-list {
          flex-grow: 1;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          font-family: 'EB Garamond', serif;
          font-size: 0.95rem;
          border-bottom: 1px solid #f5f3f0;
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .feature-item.included {
          color: #2c2420;
        }

        .feature-item.excluded {
          color: #b8a98d;
        }

        .feature-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .faq-section {
          max-width: 3xl;
          margin: 0 auto;
        }

        .faq-item {
          border-bottom: 1px solid #e8e2d9;
        }

        .faq-trigger {
          font-family: 'EB Garamond', serif;
          font-size: 1.1rem;
          color: #2c2420;
        }

        .faq-content {
          font-family: 'EB Garamond', serif;
          color: #9a8e82;
          line-height: 1.7;
          padding-top: 0.5rem;
        }

        .nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          border-bottom: 1px solid #e8e2d9;
          margin-bottom: 2rem;
        }

        .nav-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #2c2420;
        }

        .nav-button {
          font-family: 'EB Garamond', serif;
          color: #8b6914;
          border: 1px solid #8b6914;
          background-color: transparent;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background-color: #8b6914;
          color: #ffffff;
        }
      `}</style>

      {/* Navigation Header */}
      <div
        className="border-b px-6"
        style={{ backgroundColor: '#ffffff', borderColor: '#e8e2d9' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="nav-header">
            <h1 className="nav-header-title">Booken</h1>
            <button
              onClick={() => setView('bookshelf')}
              className="nav-button"
            >
              Back to Bookshelf
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2
            className="text-5xl mb-3"
            style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}
          >
            Choose Your Plan
          </h2>
          <div className="decorative-rule mb-6"></div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82' }}
          >
            Professional book production tools for independent authors and publishers
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="pricing-card">
            <div className="plan-name">Free</div>
            <div className="plan-price">$0</div>
            <div className="plan-price-period">forever</div>
            <p className="plan-description">
              Perfect for getting started with your first book project.
            </p>

            <div className="feature-list">
              {features.free.map((feature, idx) => (
                <div
                  key={idx}
                  className={`feature-item ${feature.included ? 'included' : 'excluded'}`}
                >
                  {feature.included ? (
                    <Check size={18} style={{ color: '#8b6914' }} className="feature-icon" />
                  ) : (
                    <div className="feature-icon w-5 h-5"></div>
                  )}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleUpgrade('free')}
              disabled={user?.plan === 'free'}
              className="w-full py-2"
              style={{
                fontFamily: 'EB Garamond, serif',
                backgroundColor:
                  user?.plan === 'free'
                    ? '#b8a98d'
                    : '#8b6914',
                color: '#ffffff',
                opacity: selectedPlan === 'free' ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              {user?.plan === 'free' ? 'Your Current Plan' : 'Downgrade to Free'}
            </Button>
          </div>

          {/* Professional Plan */}
          <div className="pricing-card pro">
            <div className="recommended-badge">
              <Star size={12} fill="currentColor" />
              RECOMMENDED
            </div>

            <div className="plan-name">Professional</div>
            <div className="plan-price">$19.99</div>
            <div className="plan-price-period">per month, billed monthly</div>
            <p className="plan-description">
              Everything you need to publish professionally at scale.
            </p>

            <div className="feature-list">
              {features.pro.map((feature, idx) => (
                <div
                  key={idx}
                  className={`feature-item ${feature.included ? 'included' : 'excluded'}`}
                >
                  {feature.included ? (
                    <Check size={18} style={{ color: '#8b6914' }} className="feature-icon" />
                  ) : (
                    <div className="feature-icon w-5 h-5"></div>
                  )}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleUpgrade('pro')}
              disabled={user?.plan === 'pro'}
              className="w-full py-2"
              style={{
                fontFamily: 'EB Garamond, serif',
                backgroundColor:
                  user?.plan === 'pro'
                    ? '#b8a98d'
                    : '#8b6914',
                color: '#ffffff',
                opacity: selectedPlan === 'pro' ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              {user?.plan === 'pro' ? 'Your Current Plan' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3
            className="text-3xl text-center mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#2c2420' }}
          >
            Frequently Asked Questions
          </h3>
          <div className="decorative-rule mb-8"></div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="faq-item">
                <AccordionTrigger className="faq-trigger">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="faq-content">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t mt-16"
        style={{ backgroundColor: '#ffffff', borderColor: '#e8e2d9' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p
            style={{ fontFamily: 'EB Garamond, serif', color: '#9a8e82', fontSize: '0.95rem' }}
          >
            Questions about our plans?{' '}
            <a
              href="mailto:support@booken.io"
              style={{ color: '#8b6914', textDecoration: 'underline' }}
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
