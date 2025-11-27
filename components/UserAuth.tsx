import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Mail, Loader2, Lock, User } from 'lucide-react';

interface UserAuthProps {
  onLogin: (user: UserProfile) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  // Mock Login Handlers
  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockUser: UserProfile = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name: provider === 'google' ? 'Alex Google' : provider === 'apple' ? 'Alex Apple' : 'Alex Facebook',
        email: `alex.${provider}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        role: 'user',
        provider: provider,
        joinedDate: new Date().toISOString(),
        subscriptionStatus: 'inactive', // Default to free
        subscriptionPlan: 'free',
        isAffiliate: false
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      // Admin Credential Check
      // User ID: admin
      // Password: admin123
      const isAdmin = email.trim() === 'admin' && password === 'admin123';
      
      if (email.trim() === 'admin' && !isAdmin) {
          setLoading(false);
          setError("Invalid admin credentials");
          return;
      }

      const mockUser: UserProfile = {
        id: isAdmin ? 'admin-master-id' : `user-${Math.random().toString(36).substr(2, 9)}`,
        name: isAdmin ? 'London Admin' : email.split('@')[0],
        email: isAdmin ? 'admin@londonmixologist.app' : email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isAdmin ? 'AdminBoss' : email}`,
        role: isAdmin ? 'admin' : 'user',
        provider: 'email',
        joinedDate: new Date().toISOString(),
        subscriptionStatus: isAdmin ? 'active' : 'inactive',
        subscriptionPlan: isAdmin ? 'premium' : 'free',
        isAffiliate: false
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
      <div className="max-w-md w-full bg-sapphire/10 backdrop-blur-md rounded-3xl p-8 border border-sapphire/30 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-quicksand/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-royalblue/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-bold serif text-swanwing mb-2">
            {isSignUp ? 'Join the Club' : 'Welcome Back'}
          </h2>
          <p className="text-shellstone text-sm">
            Sign in to save your recipes and access exclusive features.
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6 relative z-10">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
          >
            {/* Google SVG Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin('apple')}
            disabled={loading}
            className="w-full bg-black text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.02 3.65-.95.6.02 2.31.2 3.22 1.51-.84.45-2.2 2.48-1.57 5.08.06.31.2 1.54 1.25 2.18-.75 1.76-1.63 3.08-2.63 4.41zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            className="w-full bg-[#1877F2] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
               <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
             </svg>
            Continue with Facebook
          </button>
        </div>

        <div className="relative flex py-4 items-center mb-6 z-10">
          <div className="flex-grow border-t border-sapphire/50"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-shellstone uppercase tracking-widest">Or with username</span>
          <div className="flex-grow border-t border-sapphire/50"></div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4 relative z-10">
          <div className="space-y-1">
            <label className="text-xs text-quicksand font-bold uppercase ml-1">Email or Username</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-shellstone" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-royalblue/60 border border-sapphire/50 rounded-xl py-3 pl-12 pr-4 text-swanwing focus:border-quicksand focus:ring-1 focus:ring-quicksand outline-none transition-all placeholder-shellstone/50"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-quicksand font-bold uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-shellstone" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-royalblue/60 border border-sapphire/50 rounded-xl py-3 pl-12 pr-4 text-swanwing focus:border-quicksand focus:ring-1 focus:ring-quicksand outline-none transition-all placeholder-shellstone/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded text-center border border-red-500/20">
                {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-quicksand text-royalblue font-bold py-3.5 rounded-xl shadow-lg hover:bg-quicksand/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="text-center mt-6 z-10 relative">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-shellstone hover:text-quicksand transition-colors underline decoration-dotted"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};