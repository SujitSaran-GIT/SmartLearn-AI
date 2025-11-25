import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Sparkles, Loader2 } from 'lucide-react';
import { paymentService } from '../services/payment.service';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  savings: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  ctaText: string;
  icon: React.ReactNode;
  gradient: string;
}

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null); // Track which plan is being purchased
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserSubscription();
  }, []);

  const fetchUserSubscription = async () => {
    try {
      const data = await paymentService.getUserSubscription();
      setUserSubscription(data);
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanPurchase = async (planId: string, planName: string) => {
    if (loading) return; // Prevent multiple clicks

    setLoading(planId);

    try {
      await paymentService.initiatePayment({
        planType: planId as 'starter' | 'pro' | 'enterprise',
        billingCycle,
        onSuccess: (subscription) => {
          setUserSubscription({
            subscription,
            planType: subscription.planType,
          });
          alert(`Successfully upgraded to ${planName}! 🎉`);
          setLoading(null);
        },
        onError: (error) => {
          console.error('Payment failed:', error);
          alert('Payment failed. Please try again.');
          setLoading(null);
        },
        onClose: () => {
          setLoading(null);
        },
      });
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setLoading(null);
    }
  };

  const handleContactSales = () => {
    // You can implement this to open a contact form or redirect to contact page
    window.open('mailto:sales@smartlearn.com?subject=Enterprise Plan Inquiry', '_blank');
  };

  const pricingPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for individual learners and students',
      monthlyPrice: 299,
      yearlyPrice: 2999,
      savings: 589,
      features: [
        '5 quiz attempts per month',
        'Basic AI question generation',
        'Up to 10MB file uploads',
        'Standard support',
        '7-day history retention',
        'Basic analytics'
      ],
      ctaText: 'Get Started',
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-[var(--primary-500)] to-[var(--secondary-500)]'
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Ideal for serious learners and professionals',
      monthlyPrice: 799,
      yearlyPrice: 7999,
      savings: 1589,
      popular: true,
      features: [
        'Unlimited quiz attempts',
        'Advanced AI question generation',
        'Up to 100MB file uploads',
        'Priority support',
        '30-day history retention',
        'Advanced analytics & insights',
        'Custom quiz templates',
        'Export results to PDF'
      ],
      ctaText: 'Go Pro',
      icon: <Sparkles className="w-6 h-6" />,
      gradient: 'from-[var(--secondary-500)] to-[var(--accent-500)]'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For institutions and corporate training',
      monthlyPrice: 1999,
      yearlyPrice: 19999,
      savings: 3989,
      bestValue: true,
      features: [
        'Everything in Pro, plus:',
        'Unlimited storage',
        'Dedicated account manager',
        'Custom AI model training',
        'White-label solutions',
        'API access',
        'Bulk user management',
        'Advanced security features',
        'SLA guarantee'
      ],
      ctaText: 'Contact Sales',
      icon: <Crown className="w-6 h-6" />,
      gradient: 'from-[var(--warning-500)] to-[var(--accent-500)]'
    }
  ];

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateMonthlyEquivalent = (yearlyPrice: number) => {
    return Math.round(yearlyPrice / 12);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[var(--primary-500)]" />
          <p className="text-[var(--text-secondary)]">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Choose Your Learning Plan
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
            Invest in your growth with affordable pricing designed for Indian learners.
            Start free, upgrade when you're ready.
          </p>

          {/* Current Subscription Status */}
          {userSubscription?.subscription?.status === 'active' && (
            <div className="inline-flex items-center bg-[var(--success-50)] text-[var(--success-800)] px-4 py-2 rounded-full text-sm font-medium dark:bg-[var(--success-900)] dark:text-[var(--success-300)]">
              <Check className="w-4 h-4 mr-2" />
              Current Plan: {paymentService.getPlanDisplayName(userSubscription.subscription.planType)} - Active until {new Date(userSubscription.subscription.expiresAt).toLocaleDateString()}
            </div>
          )}

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-[var(--bg-tertiary)] rounded-lg p-1 border border-[var(--border-primary)]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                billingCycle === 'yearly'
                  ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>Yearly</span>
              <span className="bg-[var(--success-100)] text-[var(--success-800)] text-xs px-2 py-1 rounded-full dark:bg-[var(--success-900)] dark:text-[var(--success-300)]">
                Save up to 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pricingPlans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const monthlyEquivalent = billingCycle === 'yearly' 
              ? calculateMonthlyEquivalent(plan.yearlyPrice)
              : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 card-hover ${
                  plan.popular
                    ? 'border-2 border-[var(--primary-500)] shadow-2xl'
                    : 'border border-[var(--border-primary)] shadow-lg'
                } ${plan.bestValue ? 'ring-2 ring-[var(--accent-500)] ring-opacity-50' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>MOST POPULAR</span>
                    </div>
                  </div>
                )}

                {/* Best Value Badge */}
                {plan.bestValue && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[var(--warning-500)] to-[var(--accent-500)] text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1">
                      <Crown className="w-4 h-4 fill-current" />
                      <span>BEST VALUE</span>
                    </div>
                  </div>
                )}

                <div className="bg-[var(--bg-primary)] rounded-2xl p-8 h-full flex flex-col">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} text-white mb-4`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-[var(--text-secondary)]">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-[var(--text-primary)]">
                        {formatINR(billingCycle === 'monthly' ? plan.monthlyPrice : monthlyEquivalent)}
                      </span>
                      {billingCycle === 'yearly' && (
                        <span className="text-lg text-[var(--text-secondary)] ml-1">/month</span>
                      )}
                    </div>
                    
                    {billingCycle === 'yearly' ? (
                      <div className="space-y-1">
                        <div className="text-sm text-[var(--text-secondary)]">
                          {formatINR(plan.yearlyPrice)} billed annually
                        </div>
                        <div className="text-[var(--success-600)] text-sm font-semibold dark:text-[var(--success-400)]">
                          Save {formatINR(plan.savings)} vs monthly
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[var(--text-secondary)]">per month</div>
                    )}
                  </div>

                  {/* CTA Button */}
                  {plan.id === 'enterprise' ? (
                    <button
                      onClick={handleContactSales}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all mb-8 bg-gradient-to-r from-[var(--warning-500)] to-[var(--accent-500)] hover:from-[var(--warning-600)] hover:to-[var(--accent-600)] shadow-lg`}
                    >
                      {plan.ctaText}
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlanPurchase(plan.id, plan.name)}
                      disabled={loading === plan.id || (userSubscription?.subscription?.status === 'active' && userSubscription?.subscription?.planType === plan.id)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all mb-8 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-gradient-to-r from-[var(--secondary-500)] to-[var(--accent-500)] hover:from-[var(--secondary-600)] hover:to-[var(--accent-600)] shadow-lg'
                          : 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--secondary-500)] hover:from-[var(--primary-600)] hover:to-[var(--secondary-600)]'
                      }`}
                    >
                      {loading === plan.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : userSubscription?.subscription?.status === 'active' && userSubscription?.subscription?.planType === plan.id ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Current Plan</span>
                        </>
                      ) : (
                        <span>{plan.ctaText}</span>
                      )}
                    </button>
                  )}

                  {/* Features */}
                  <div className="flex-1 space-y-4">
                    <h4 className="font-semibold text-[var(--text-primary)] text-lg">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-[var(--success-500)] mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--text-secondary)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free Trial Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[var(--primary-50)] to-[var(--secondary-50)] rounded-2xl p-8 border border-[var(--border-primary)] dark:from-[var(--primary-900)] dark:to-[var(--secondary-900)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Start with our Free Plan
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
              Get started immediately with our free tier. No credit card required. 
              Experience the power of AI-powered learning with basic features.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="text-left bg-[var(--bg-primary)] rounded-lg p-4 shadow-sm border border-[var(--border-primary)]">
                <h4 className="font-semibold text-[var(--text-primary)]">Free Plan Includes:</h4>
                <ul className="text-sm text-[var(--text-secondary)] mt-2 space-y-1">
                  <li>• 2 quiz attempts per month</li>
                  <li>• Basic AI features</li>
                  <li>• 5MB file upload limit</li>
                  <li>• 3-day history retention</li>
                </ul>
              </div>
              <button className="bg-[var(--bg-primary)] text-[var(--primary-600)] border border-[var(--primary-300)] px-8 py-4 rounded-xl font-semibold hover:bg-[var(--primary-50)] transition-colors shadow-sm dark:bg-[var(--primary-900)] dark:text-[var(--primary-400)] dark:border-[var(--primary-700)]">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Do you offer educational discounts?",
                answer: "Absolutely! We offer special pricing for students and educational institutions. Contact our sales team."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept UPI, Net Banking, Credit/Debit Cards, and all major Indian payment methods."
              },
              {
                question: "Is there a commitment period?",
                answer: "No long-term contracts. You can cancel your subscription at any time."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-[var(--bg-secondary)] rounded-xl p-6 shadow-sm border border-[var(--border-primary)]">
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{faq.question}</h3>
                <p className="text-[var(--text-secondary)] text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-secondary)] mb-6">Trusted by students and professionals across India</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">50,000+</div>
              <div className="text-sm text-[var(--text-secondary)]">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">4.8/5</div>
              <div className="text-sm text-[var(--text-secondary)]">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--primary-600)] dark:text-[var(--primary-400)]">99.9%</div>
              <div className="text-sm text-[var(--text-secondary)]">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;