export interface RecommendedProduct {
  name: string;
  category: 'Ingredient' | 'Tool' | 'Garnish' | 'Glassware';
  reason: string;
}

export interface CocktailRecipe {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  glassware: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedCostGBP: number;
  recommendedProducts: RecommendedProduct[];
}

export interface SavedRecipe extends CocktailRecipe {
  id: string;
  dateCreated: string;
}

export interface ShoppingLocation {
  name: string;
  address: string;
  mapLink: string;
}

export interface ShoppingRecommendation {
  intro: string;
  locations: ShoppingLocation[];
  onlineLinks: {
    amazonSearch: string;
    uberEatsSearch: string;
    waitroseSearch: string;
  };
}

export interface PartyGameSuggestion {
  title: string;
  description: string;
  setup: string;
  rules: string[];
  vibeMatch: string;
}

export interface SpicyDiceResult {
  action: string;
  detail: string;
  instruction: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  GENERATOR = 'GENERATOR',
  SHOPPING = 'SHOPPING',
  VISION = 'VISION',
  GAMES = 'GAMES',
  CALCULATOR = 'CALCULATOR',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  TERMS = 'TERMS',
  COOKIE_POLICY = 'COOKIE_POLICY',
  DISCLAIMER = 'DISCLAIMER'
}

export interface AffiliateStats {
  clicks: number;
  earnings: number;
}

export interface NotificationPreferences {
  newsletter: boolean;
  newFeatures: boolean;
  partnerOffers: boolean;
  securityAlerts: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  provider: string;
  joinedDate: string;
  subscriptionStatus: 'active' | 'inactive';
  subscriptionPlan: 'free' | 'premium';
  isAffiliate: boolean;
  amazonAssociateId?: string;
  phoneNumber?: string;
  address?: string;
  affiliateStats?: AffiliateStats;
  notificationPreferences?: NotificationPreferences;
}