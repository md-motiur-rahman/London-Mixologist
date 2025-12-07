import { createClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Safely handle environment variables with fallbacks to prevent runtime errors
const getEnvVar = (key: string) => {
  try {
    // Cast import.meta to any to avoid TypeScript errors regarding ImportMeta type definition
    return (import.meta as any).env?.[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const mapSupabaseUserToProfile = (user: User): UserProfile => {
  const meta = user.user_metadata || {};
  
  return {
    id: user.id,
    email: user.email || '',
    name: meta.full_name || user.email?.split('@')[0] || 'Mixologist',
    avatar: meta.avatar_url,
    role: meta.role || 'user',
    provider: user.app_metadata.provider || 'email',
    joinedDate: user.created_at,
    subscriptionStatus: meta.subscriptionStatus || 'inactive',
    subscriptionPlan: meta.subscriptionPlan || 'free',
    isAffiliate: meta.isAffiliate || false,
    amazonAssociateId: meta.amazonAssociateId,
    phoneNumber: meta.phoneNumber,
    address: meta.address,
    affiliateStats: meta.affiliateStats,
    notificationPreferences: meta.notificationPreferences
  };
};