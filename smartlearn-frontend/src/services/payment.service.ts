import { apiService } from './api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentOptions {
  planType: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  onSuccess?: (subscription: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export class PaymentService {
  private isTestMode = import.meta.env.VITE_USE_MOCK_PAYMENTS === 'true';

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  private async initiateMockPayment(options: PaymentOptions) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful payment response that matches backend pricing
    const planAmounts = {
      starter: { monthly: 29900, yearly: 299900 },
      pro: { monthly: 79900, yearly: 799900 },
      enterprise: { monthly: 199900, yearly: 1999900 }
    };

    const mockSubscription = {
      id: `mock_sub_${Date.now()}`,
      planType: options.planType,
      billingCycle: options.billingCycle,
      status: 'active',
      startedAt: new Date().toISOString(),
      expiresAt: options.billingCycle === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 365 days
      amount: planAmounts[options.planType][options.billingCycle]
    };

    options.onSuccess?.(mockSubscription);
  }

  async initiatePayment(options: PaymentOptions) {
    try {
      // Use mock payment in test mode
      if (this.isTestMode) {
        return this.initiateMockPayment(options);
      }

      // Load Razorpay SDK
      await this.loadRazorpayScript();

      // Create payment order
      const orderResponse = await apiService.createPaymentOrder(
        options.planType,
        options.billingCycle
      );

      if (!orderResponse.success) {
        throw new Error((orderResponse as any).error || 'Failed to create payment order');
      }

      const { orderId, amount, currency, planType, billingCycle } = orderResponse.data;

      // Configure Razorpay options
      const razorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_id_here', // Replace with your Razorpay key ID
        amount: amount,
        currency: currency,
        name: 'SmartLearn',
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan (${billingCycle})`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            const verificationResponse = await apiService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType,
              billingCycle,
            });

            if (verificationResponse.success) {
              options.onSuccess?.(verificationResponse.data.subscription);
            } else {
              options.onError?.(new Error((verificationResponse as any).error || 'Payment verification failed'));
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            options.onError?.(error);
          }
        },
        modal: {
          ondismiss: () => {
            options.onClose?.();
          },
        },
        prefill: {
          name: '', // You can pre-fill user data here
          email: '',
          contact: '',
        },
        notes: {
          planType,
          billingCycle,
          source: 'SmartLearn Web App',
        },
        theme: {
          color: '#3385ff',
        },
      };

      // Create and open Razorpay payment modal
      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation error:', error);
      options.onError?.(error);
    }
  }

  async getUserSubscription() {
    try {
      const response = await apiService.getUserSubscription();
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  async cancelSubscription() {
    try {
      const response = await apiService.cancelSubscription();
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return null;
    }
  }

  // Format currency for display
  formatINR(amountInPaise: number): string {
    const amountInRupees = amountInPaise / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amountInRupees);
  }

  // Get plan display name
  getPlanDisplayName(planType: string): string {
    const planNames: Record<string, string> = {
      starter: 'Starter',
      pro: 'Pro',
      enterprise: 'Enterprise',
      free: 'Free',
    };
    return planNames[planType] || planType.charAt(0).toUpperCase() + planType.slice(1);
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    const subscriptionData = await this.getUserSubscription();
    return subscriptionData?.subscription?.status === 'active' || false;
  }

  // Get user's current plan type
  async getCurrentPlan(): Promise<string> {
    const subscriptionData = await this.getUserSubscription();
    return subscriptionData?.subscription?.planType || subscriptionData?.planType || 'free';
  }
}

export const paymentService = new PaymentService();