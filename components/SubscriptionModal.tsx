import React, { useState } from 'react';
import { X, Check, CreditCard, Crown, Shield, Lock, Smartphone, Globe } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

type PaymentMethod = 'stripe' | 'paypal' | 'google_pay';

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = () => {
    setProcessing(true);
    setError(null);

    // Simulate Payment Gateway Interaction
    setTimeout(() => {
      // 10% chance of random "decline" to simulate robust error handling
      if (Math.random() < 0.1) {
          setProcessing(false);
          setError("Transaction declined. Please check your payment details or try a different method.");
          return;
      }

      setProcessing(false);
      onSubscribe();
      onClose();
    }, 2500);
  };

  const handleCardInput = (field: keyof typeof cardData, value: string) => {
      let formatted = value;
      if (field === 'number') formatted = value.replace(/\D/g, '').slice(0, 16);
      if (field === 'expiry') formatted = value.replace(/\D/g, '').slice(0, 4);
      if (field === 'cvc') formatted = value.replace(/\D/g, '').slice(0, 3);
      setCardData(prev => ({ ...prev, [field]: formatted }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-royalblue/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gradient-to-br from-royalblue to-sapphire/20 border border-quicksand rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative my-auto">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-shellstone hover:text-swanwing transition-colors z-10"
        >
            <X size={24} />
        </button>

        {/* Header Section */}
        <div className="p-8 text-center border-b border-sapphire/30 bg-sapphire/10">
            <div className="w-16 h-16 bg-quicksand/20 rounded-full flex items-center justify-center mx-auto mb-4 text-quicksand border border-quicksand/50 shadow-[0_0_15px_rgba(224,197,143,0.3)]">
                <Crown size={32} />
            </div>
            <h2 className="text-3xl font-serif font-bold text-swanwing mb-2">Unlock Premium</h2>
            <p className="text-shellstone text-sm">Monthly recurring subscription. Cancel anytime.</p>
        </div>

        <div className="p-6 md:p-8">
            {/* Price Tag */}
            <div className="flex justify-between items-center bg-sapphire/20 rounded-xl p-4 mb-6 border border-sapphire/30">
                <div>
                    <p className="text-xs text-shellstone uppercase tracking-widest font-bold mb-1">Total Due Today</p>
                    <div className="text-sm text-quicksand font-bold">Recurring Monthly</div>
                </div>
                <div className="text-right">
                    <span className="text-3xl font-bold text-swanwing">£4.99</span>
                </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <button 
                    onClick={() => setPaymentMethod('stripe')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'stripe' ? 'bg-quicksand text-royalblue border-quicksand font-bold shadow-lg' : 'bg-sapphire/10 text-shellstone border-sapphire/30 hover:bg-sapphire/30'}`}
                >
                    <CreditCard size={20} />
                    <span className="text-[10px] uppercase font-bold">Card</span>
                </button>
                <button 
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'paypal' ? 'bg-[#0070BA] text-white border-[#0070BA] font-bold shadow-lg' : 'bg-sapphire/10 text-shellstone border-sapphire/30 hover:bg-sapphire/30'}`}
                >
                    <Globe size={20} />
                    <span className="text-[10px] uppercase font-bold">PayPal</span>
                </button>
                <button 
                    onClick={() => setPaymentMethod('google_pay')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'google_pay' ? 'bg-white text-gray-800 border-white font-bold shadow-lg' : 'bg-sapphire/10 text-shellstone border-sapphire/30 hover:bg-sapphire/30'}`}
                >
                    <Smartphone size={20} />
                    <span className="text-[10px] uppercase font-bold">GPay</span>
                </button>
            </div>

            {/* Dynamic Payment Form */}
            <div className="space-y-4 mb-8 min-h-[120px]">
                {paymentMethod === 'stripe' && (
                    <div className="animate-fade-in space-y-3">
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3.5 text-shellstone" size={18} />
                            <input 
                                type="text" 
                                placeholder="Card Number" 
                                value={cardData.number}
                                onChange={(e) => handleCardInput('number', e.target.value)}
                                className="w-full bg-royalblue border border-sapphire/50 rounded-lg pl-10 pr-4 py-3 text-swanwing focus:border-quicksand outline-none text-sm font-mono placeholder-shellstone/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input 
                                type="text" 
                                placeholder="MM/YY" 
                                value={cardData.expiry}
                                onChange={(e) => handleCardInput('expiry', e.target.value)}
                                className="w-full bg-royalblue border border-sapphire/50 rounded-lg px-4 py-3 text-swanwing focus:border-quicksand outline-none text-sm font-mono placeholder-shellstone/50 text-center"
                            />
                            <div className="relative">
                                <Lock className="absolute right-3 top-3.5 text-shellstone" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="CVC" 
                                    value={cardData.cvc}
                                    onChange={(e) => handleCardInput('cvc', e.target.value)}
                                    className="w-full bg-royalblue border border-sapphire/50 rounded-lg px-4 py-3 text-swanwing focus:border-quicksand outline-none text-sm font-mono placeholder-shellstone/50 text-center"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-shellstone justify-center mt-2">
                             <Shield size={12} className="text-emerald-400" /> 
                             Payments processed securely by <strong className="text-swanwing">Stripe</strong>
                        </div>
                    </div>
                )}

                {paymentMethod === 'paypal' && (
                    <div className="animate-fade-in text-center py-4 bg-sapphire/10 rounded-xl border border-dashed border-sapphire/30">
                        <p className="text-sm text-swanwing mb-2 font-bold">Continue with PayPal</p>
                        <p className="text-xs text-shellstone px-4">You will be redirected to PayPal's secure portal to complete your subscription setup.</p>
                    </div>
                )}

                {paymentMethod === 'google_pay' && (
                    <div className="animate-fade-in text-center py-4 bg-sapphire/10 rounded-xl border border-dashed border-sapphire/30">
                         <p className="text-sm text-swanwing mb-2 font-bold">Google Pay</p>
                         <p className="text-xs text-shellstone px-4">Checkout instantly using the card saved to your Google Account.</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-300 text-xs text-center animate-fade-in">
                    {error}
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={processing}
                className={`w-full font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 
                    ${paymentMethod === 'paypal' ? 'bg-[#FFC439] text-royalblue' : 
                      paymentMethod === 'google_pay' ? 'bg-black text-white' : 
                      'bg-quicksand text-royalblue'}`}
            >
                {processing ? (
                    <>Processing...</>
                ) : (
                    <>
                        {paymentMethod === 'stripe' && <Lock size={18} />}
                        {paymentMethod === 'stripe' ? 'Pay Securely' : 
                         paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Pay with GPay'}
                    </>
                )}
            </button>
            
            <div className="mt-6 space-y-2">
                <div className="flex justify-center gap-4 text-shellstone opacity-50">
                    <CreditCard size={20} />
                    <Globe size={20} />
                    <Smartphone size={20} />
                </div>
                <p className="text-[10px] text-shellstone text-center">
                    By confirming, you agree to our Terms of Service. Your subscription will auto-renew monthly until cancelled.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
