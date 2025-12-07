import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Lock, User, Loader2, AlertCircle, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { supabase, mapSupabaseUserToProfile, createOrUpdateUserProfile } from '../services/supabaseClient';

interface UserAuthProps {
  onLogin: (user: UserProfile) => void;
}

export const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSocialLogin = async (provider: 'google') => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Get the current URL for redirect
      const redirectUrl = window.location.origin;
      console.log('OAuth redirect URL:', redirectUrl);
      
      // IMPORTANT: For Google OAuth to work, you must:
      // 1. Enable Google provider in Supabase Dashboard -> Authentication -> Providers
      // 2. Add your Google OAuth Client ID and Secret from Google Cloud Console
      // 3. Add the redirect URL to Supabase Dashboard -> Authentication -> URL Configuration
      // 4. Add the redirect URL to Google Cloud Console -> OAuth 2.0 Client -> Authorized redirect URIs
      //    Format: https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('OAuth response:', { data, error });
      
      if (error) {
        throw error;
      }
      
      // If we have a URL, redirect manually (fallback)
      if (data?.url) {
        console.log('Redirecting to:', data.url);
        window.location.href = data.url;
      }
      
    } catch (err: any) {
      console.error('Social login error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to connect with Google. Please try again.';
      
      if (err.message?.includes('provider is not enabled')) {
        errorMessage = 'Google sign-in is not configured. Please use email/password instead.';
      } else if (err.message?.includes('redirect')) {
        errorMessage = 'Redirect URL not configured. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (isSignUp && !fullName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              subscriptionStatus: 'inactive',
              subscriptionPlan: 'free'
            }
          }
        });
        
        if (error) {
          // Handle specific error cases
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw error;
        }
        
        if (data.user) {
           // Try to create user profile in database (non-blocking)
           createOrUpdateUserProfile(
             data.user.id,
             email,
             fullName.trim(),
             'email',
             'user'
           ).catch(err => {
             console.warn('Could not create user profile in database:', err);
           });

           // Login immediately after signup if auto-confirm is on, or inform user
           if (data.session) {
             setSuccess('Account created successfully! Welcome aboard.');
             setTimeout(() => {
               onLogin(mapSupabaseUserToProfile(data.user!));
             }, 1000);
           } else {
             setSuccess("Account created! Please check your email to confirm your account before signing in.");
             // Clear form
             setEmail('');
             setPassword('');
             setFullName('');
           }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Handle specific error cases
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email before signing in. Check your inbox.');
          }
          throw error;
        }

        if (data.user) {
          setSuccess('Welcome back!');
          setTimeout(() => {
            onLogin(mapSupabaseUserToProfile(data.user));
          }, 500);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
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
            Sign in to sync your recipes across devices.
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6 relative z-10">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="relative flex py-4 items-center mb-6 z-10">
          <div className="flex-grow border-t border-sapphire/50"></div>
          <span className="flex-shrink-0 mx-4 text-xs text-shellstone uppercase tracking-widest">Or with email</span>
          <div className="flex-grow border-t border-sapphire/50"></div>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleStandardAuth} className="space-y-4 relative z-10">
          {isSignUp && (
             <div className="space-y-1 animate-fade-in">
              <label className="text-xs text-quicksand font-bold uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-shellstone" size={18} />
                <input 
                  type="text" 
                  required={isSignUp}
                  className="w-full bg-royalblue/60 border border-sapphire/50 rounded-xl py-3 pl-12 pr-4 text-swanwing focus:border-quicksand focus:ring-1 focus:ring-quicksand outline-none transition-all placeholder-shellstone/50"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-quicksand font-bold uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-shellstone" size={18} />
              <input 
                type="email" 
                required
                autoComplete="email"
                className="w-full bg-royalblue/60 border border-sapphire/50 rounded-xl py-3 pl-12 pr-4 text-swanwing focus:border-quicksand focus:ring-1 focus:ring-quicksand outline-none transition-all placeholder-shellstone/50"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); setSuccess(''); }}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-quicksand font-bold uppercase ml-1">Password</label>
              {!isSignUp && (
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-shellstone hover:text-quicksand transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-shellstone" size={18} />
              <input 
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="w-full bg-royalblue/60 border border-sapphire/50 rounded-xl py-3 pl-12 pr-12 text-swanwing focus:border-quicksand focus:ring-1 focus:ring-quicksand outline-none transition-all placeholder-shellstone/50"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); setSuccess(''); }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-shellstone hover:text-quicksand transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-xs text-shellstone/70 ml-1 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 animate-fade-in">
                <CheckCircle size={14} /> {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
                <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-quicksand text-royalblue font-bold py-3.5 rounded-xl shadow-lg hover:bg-quicksand/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6 z-10 relative space-y-2">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
            className="text-sm text-shellstone hover:text-quicksand transition-colors underline decoration-dotted"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};