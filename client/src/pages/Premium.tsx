import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Star, Shield, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

import type { RootState } from '../store/store';
import { 
  useCreateOrderMutation, 
  useVerifyPaymentMutation, 
  useActivateBoostMutation 
} from '../store/api/premiumApi';
import { loadRazorpayScript } from '../features/premium/useRazorpay';
import { Button } from '../components/ui/Button';

export const Premium = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [activateBoost, { isLoading: isBoosting }] = useActivateBoostMutation();

  const handleSubscribe = async () => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Create order on backend
      const orderData = await createOrder({ planId: 'premium_monthly' }).unwrap();

      const options = {
        key: orderData.data.keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'HeartSync Premium',
        description: 'Monthly Subscription',
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            toast.success('Welcome to HeartSync Premium! 🎉');
          } catch (err) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.username + '@example.com', // Placeholder
        },
        theme: {
          color: '#FF4D6D',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Failed to initiate payment.');
    }
  };

  const handleBoost = async () => {
    try {
      await activateBoost().unwrap();
      toast.success('Profile Boost Activated! 🚀');
    } catch (err) {
      toast.error('Failed to activate boost. Ensure you have boosts available.');
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8 flex flex-col pt-safe-top pb-safe-bottom">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-accent text-white mb-3">
          HeartSync <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Premium</span>
        </h1>
        <p className="text-text-secondary max-w-lg mx-auto">
          Upgrade your experience. Get more matches, stand out from the crowd, and find the one faster.
        </p>
      </div>

      {user.isPremium ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-3xl text-center border border-primary/30 relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
          <h2 className="text-2xl font-bold text-white mb-2">You are Premium!</h2>
          <p className="text-text-secondary mb-8">Enjoy all your exclusive benefits.</p>

          <div className="p-6 rounded-2xl glass border border-secondary/20 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-secondary" /> Profile Boost
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Skip the line! Be the top profile in your area for 30 minutes.
            </p>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={handleBoost}
              isLoading={isBoosting}
            >
              Activate Boost Now
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto w-full">
          {/* Features List */}
          <div className="glass p-6 sm:p-8 rounded-3xl border border-border">
            <h3 className="text-xl font-bold text-white mb-6">Premium Benefits</h3>
            <ul className="space-y-4">
              {[
                { icon: Heart, text: 'Unlimited Likes' },
                { icon: Star, text: 'See Who Liked You' },
                { icon: Shield, text: 'Advanced Filters' },
                { icon: Zap, text: '1 Free Boost per week' },
                { icon: Crown, text: 'Premium Badge' },
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-white">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border-2 border-primary relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-white mb-2 text-center">1 Month</h3>
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-4xl font-black text-white">₹499</span>
                <span className="text-text-secondary">/mo</span>
              </div>
              <p className="text-center text-sm text-text-secondary mb-8">
                Cancel anytime. Billed monthly.
              </p>
            </div>

            <Button 
              onClick={handleSubscribe} 
              isLoading={isCreatingOrder || isVerifying}
              className="w-full py-4 text-lg rounded-xl shadow-lg shadow-primary/30"
            >
              Get Premium Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
