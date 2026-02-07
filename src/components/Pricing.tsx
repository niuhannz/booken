import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, Star, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen" style={{ backgroundColor: '#08080d' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600&family=Spectral:wght@400;500;600&display=swap');

        /* Glass morphism utilities */
        .bk-glass {
          background: rgba(232, 228, 223, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(232, 228, 223, 0.1);
        }

        .bk-glass-strong {
          background: rgba(232, 228, 223, 0.08);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(232, 228, 223, 0.15);
        }

        .bk-glow-accent {
          box-shadow: 0 0 40px rgba(196, 149, 106, 0.15),
                      inset 0 0 40px rgba(196, 149, 106, 0.05);
        }

        /* Divider */
        .bk-divider {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c4956a, transparent);
          margin: 0 auto;
        }

        /* Navigation Header */
        .nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0;
          margin-bottom: 0;
        }

        .nav-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.75rem;
          font-weight: 500;
          color: #e8e4df;
          letter-spacing: 0.05em;
        }

        .nav-btn-ghost {
          background: transparent;
          border: none;
          color: #8a8490;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .nav-btn-ghost:hover {
          color: #c4956a;
          transform: translateX(-2px);
        }

        /* Hero Section */
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3.5rem;
          font-weight: 300;
          letter-spacing: -0.02em;
          color: #e8e4df;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        /* Pricing Cards */
        .pricing-card {
          position: relative;
          padding: 2.5rem;
          border-radius: 1rem;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation: slideUpCards 0.6s ease-out forwards;
          opacity: 0;
        }

        .pricing-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .pricing-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        @keyframes slideUpCards {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pricing-card-free {
          background: rgba(232, 228, 223, 0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(232, 228, 223, 0.08);
        }

        .pricing-card-pro {
          background: rgba(232, 228, 223, 0.08);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(196, 149, 106, 0.2);
          transform: scale(1.02);
          box-shadow: 0 0 50px rgba(196, 149, 106, 0.12),
                      inset 0 0 50px rgba(196, 149, 106, 0.04);
        }

        .pricing-card:hover {
          border-color: rgba(232, 228, 223, 0.2);
          background: rgba(232, 228, 223, 0.06);
          transform: translateY(-4px);
        }

        .pricing-card-pro:hover {
          border-color: rgba(196, 149, 106, 0.3);
          background: rgba(232, 228, 223, 0.1);
          transform: scale(1.025) translateY(-4px);
          box-shadow: 0 0 60px rgba(196, 149, 106, 0.18),
                      inset 0 0 60px rgba(196, 149, 106, 0.06);
        }

        /* Recommended Badge */
        .recommended-badge {
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, rgba(196, 149, 106, 0.3) 0%, rgba(196, 149, 106, 0.1) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(196, 149, 106, 0.4);
          color: #c4956a;
          padding: 0.5rem 1.25rem;
          border-radius: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
        }

        /* Plan Info */
        .plan-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: #e8e4df;
          margin-bottom: 0.75rem;
          letter-spacing: 0.02em;
        }

        .plan-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 3rem;
          font-weight: 300;
          color: #c4956a;
          margin-bottom: 0.25rem;
          letter-spacing: -0.01em;
        }

        .plan-price-period {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          color: #8a8490;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .plan-description {
          font-family: 'DM Sans', sans-serif;
          color: #a89fa7;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-weight: 400;
        }

        /* Features List */
        .feature-list {
          flex-grow: 1;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.925rem;
          border-bottom: 1px solid rgba(232, 228, 223, 0.05);
          font-weight: 400;
        }

        .feature-item:last-child {
          border-bottom: none;
        }

        .feature-item.included {
          color: #e8e4df;
        }

        .feature-item.excluded {
          color: #6a6270;
        }

        .feature-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .feature-icon-check {
          color: #c4956a;
          width: 18px;
          height: 18px;
        }

        /* Buttons */
        .bk-btn-ghost {
          background: transparent;
          border: 1px solid rgba(232, 228, 223, 0.2);
          color: #e8e4df;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .bk-btn-ghost:hover:not(:disabled) {
          background: rgba(232, 228, 223, 0.08);
          border-color: rgba(232, 228, 223, 0.3);
        }

        .bk-btn-ghost:disabled {
          color: #8a8490;
          border-color: rgba(232, 228, 223, 0.1);
          cursor: not-allowed;
        }

        .bk-btn-accent {
          background: linear-gradient(135deg, rgba(196, 149, 106, 0.3) 0%, rgba(196, 149, 106, 0.15) 100%);
          border: 1px solid rgba(196, 149, 106, 0.4);
          color: #c4956a;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .bk-btn-accent:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(196, 149, 106, 0.4) 0%, rgba(196, 149, 106, 0.25) 100%);
          border-color: rgba(196, 149, 106, 0.6);
          box-shadow: 0 0 20px rgba(196, 149, 106, 0.2);
        }

        .bk-btn-accent:disabled {
          background: linear-gradient(135deg, rgba(138, 132, 144, 0.2) 0%, rgba(138, 132, 144, 0.1) 100%);
          border-color: rgba(138, 132, 144, 0.3);
          color: #8a8490;
          cursor: not-allowed;
        }

        /* FAQ Section */
        .faq-section {
          max-width: 50rem;
          margin: 0 auto;
          padding-top: 2rem;
          border-top: 1px solid rgba(232, 228, 223, 0.1);
        }

        .faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.25rem;
          font-weight: 300;
          color: #e8e4df;
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: -0.01em;
        }

        .faq-item {
          border-bottom: 1px solid rgba(232, 228, 223, 0.08);
          background: rgba(232, 228, 223, 0.02);
          border-radius: 0.5rem;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }

        .faq-item:hover {
          background: rgba(232, 228, 223, 0.04);
          border-color: rgba(232, 228, 223, 0.12);
        }

        .faq-trigger {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.125rem;
          font-weight: 400;
          color: #e8e4df;
          letter-spacing: 0.01em;
          padding: 1.25rem;
        }

        .faq-content {
          font-family: 'Spectral', serif;
          color: #a89fa7;
          line-height: 1.8;
          padding: 0 1.25rem 1.25rem 1.25rem;
          font-size: 0.975rem;
          font-weight: 400;
        }

        /* Footer */
        .footer-section {
          border-top: 1px solid rgba(232, 228, 223, 0.1);
          padding: 2rem 0;
          margin-top: 3rem;
        }

        .footer-text {
          font-family: 'DM Sans', sans-serif;
          color: #8a8490;
          font-size: 0.925rem;
          text-align: center;
        }

        .footer-link {
          color: #c4956a;
          text-decoration: none;
          transition: all 0.3s ease;
          border-bottom: 1px solid rgba(196, 149, 106, 0.3);
        }

        .footer-link:hover {
          color: #e8e4df;
          border-bottom-color: rgba(196, 149, 106, 0.6);
        }

        /* Sections Divider */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(232, 228, 223, 0.1), transparent);
          margin: 3rem 0;
        }
      `}</style>

      {/* Navigation Header */}
      <div className="border-b px-6" style={{ borderColor: 'rgba(232, 228, 223, 0.08)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="nav-header">
            <h1 className="nav-title">Booken</h1>
            <button onClick={() => setView('bookshelf')} className="nav-btn-ghost">
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h2 className="hero-title">Choose Your Plan</h2>
          <div className="bk-divider mb-8"></div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#a89fa7' }}
          >
            Professional book production tools for independent authors and publishers
          </p>
        </div>

        <div className="section-divider"></div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className={`pricing-card bk-glass pricing-card-free`}>
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
                    <Check size={18} className="feature-icon feature-icon-check" />
                  ) : (
                    <div className="feature-icon w-5 h-5"></div>
                  )}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade('free')}
              disabled={user?.plan === 'free'}
              className="bk-btn-ghost"
              style={{
                opacity: selectedPlan === 'free' ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              {user?.plan === 'free' ? 'Your Current Plan' : 'Downgrade to Free'}
            </button>
          </div>

          {/* Professional Plan */}
          <div className={`pricing-card bk-glass-strong pricing-card-pro`}>
            <div className="recommended-badge">
              <Star size={14} fill="currentColor" />
              Recommended
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
                    <Check size={18} className="feature-icon feature-icon-check" />
                  ) : (
                    <div className="feature-icon w-5 h-5"></div>
                  )}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade('pro')}
              disabled={user?.plan === 'pro'}
              className="bk-btn-accent"
              style={{
                opacity: selectedPlan === 'pro' ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              {user?.plan === 'pro' ? 'Your Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>

        <div className="section-divider"></div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h3 className="faq-title">Frequently Asked Questions</h3>
          <div className="bk-divider mb-8"></div>

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
      <div className="footer-section px-6" style={{ borderColor: 'rgba(232, 228, 223, 0.08)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="footer-text">
            Questions about our plans?{' '}
            <a href="mailto:support@booken.io" className="footer-link">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
