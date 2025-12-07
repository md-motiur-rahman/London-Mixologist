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

/**
 * Fetch user profile from the database
 * This retrieves the user's role and other profile data from the user_profiles table
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      name: data.full_name || data.email.split('@')[0] || 'Mixologist',
      avatar: data.avatar_url,
      role: data.role || 'user',
      provider: data.provider || 'email',
      joinedDate: data.created_at,
      subscriptionStatus: data.subscription_status || 'inactive',
      subscriptionPlan: data.subscription_plan || 'free',
      isAffiliate: data.is_affiliate || false,
      amazonAssociateId: data.amazon_associate_id,
      phoneNumber: data.phone_number,
      address: data.address,
      affiliateStats: undefined,
      notificationPreferences: undefined
    };
  } catch (err) {
    console.error('Error in fetchUserProfile:', err);
    return null;
  }
};

/**
 * Map Supabase auth user to UserProfile
 * Falls back to user metadata if database fetch fails
 */
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

/**
 * Create or update user profile in the database
 * Called after user signup or login
 */
export const createOrUpdateUserProfile = async (
  userId: string,
  email: string,
  fullName: string,
  provider: string = 'email',
  role: string = 'user'
): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        provider,
        role,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating/updating user profile:', error);
      return null;
    }

    return fetchUserProfile(userId);
  } catch (err) {
    console.error('Error in createOrUpdateUserProfile:', err);
    return null;
  }
};