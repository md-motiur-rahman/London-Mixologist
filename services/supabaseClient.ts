import { createClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = 'https://ktwsxsiffczcxxiauxby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d3N4c2lmZmN6Y3h4aWF1eGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTcxNDksImV4cCI6MjA4MDMzMzE0OX0.AxiNNilaWEEezvMkhPZZ6o67u_G5eWBvpIbX-hO7znw';

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