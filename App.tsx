import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { CocktailGenerator } from './components/CocktailGenerator';
import { ShoppingAssistant } from './components/ShoppingAssistant';
import { CocktailVision } from './components/CocktailVision';
import { PartyGames } from './components/PartyGames';
import { DrinkCalculator } from './components/DrinkCalculator';
import { Navigation } from './components/Navigation';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { UserAuth } from './components/UserAuth';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CookiePolicy, Disclaimer, PrivacyPolicy, TermsAndConditions } from './components/LegalPages';
import { AppView, UserProfile, SavedRecipe, CocktailRecipe } from './types';
import { supabase, mapSupabaseUserToProfile, fetchUserProfile, createOrUpdateUserProfile } from './services/supabaseClient';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // User State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  // Scroll Ref
  const mainContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  // Admin emails - add your email here for admin access
  const ADMIN_EMAILS = ['cse.motiur@gmail.com'];
  
  // Check if user is admin (by email or database role)
  const isUserAdmin = (userProfile: UserProfile | null): boolean => {
    if (!userProfile) return false;
    return userProfile.role === 'admin' || ADMIN_EMAILS.includes(userProfile.email.toLowerCase());
  };

  // Check for admin access when URL hash changes or user changes
  useEffect(() => {
    const checkAdminAccess = () => {
      if (isUserAdmin(user) && window.location.hash === '#adminmixlock') {
        setCurrentView(AppView.ADMIN);
      }
    };

    // Check on mount and when hash changes
    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminAccess);
    };
  }, [user]);

  // Fetch Recipes function
  const fetchRecipes = async (userId: string) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('date_created', { ascending: false });

    if (!error && data) {
       // Map snake_case database fields to camelCase types
       const mapped: SavedRecipe[] = data.map(r => ({
           id: r.id,
           name: r.name,
           description: r.description,
           ingredients: r.ingredients,
           instructions: r.instructions,
           glassware: r.glassware,
           difficulty: r.difficulty,
           estimatedCostGBP: r.estimated_cost_gbp,
           recommendedProducts: r.recommended_products,
           dateCreated: r.date_created
       }));
       setSavedRecipes(mapped);
    } else {
        console.error("Error fetching recipes:", error);
    }
  };

  useEffect(() => {
    // Check Age Verification
    const verified = localStorage.getItem('london_mixologist_age_verified');
    if (verified === 'true') {
      setIsAgeVerified(true);
    }

    // Check Theme Preference
    const storedTheme = localStorage.getItem('london_mixologist_theme');
    if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
    }

    // SUPABASE AUTH INITIALIZATION
    const initAuth = async () => {
      try {
        // Check for OAuth callback in URL hash (has access_token)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const isAdminHash = window.location.hash === '#adminmixlock';
        
        if (accessToken) {
          // Clear the hash from URL for cleaner look
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session?.user) {
          let profile = mapSupabaseUserToProfile(session.user);
          setUser(profile);
          fetchRecipes(profile.id);
          
          // Try to get role from database
          try {
            const dbProfile = await fetchUserProfile(session.user.id);
            if (dbProfile) {
              profile = dbProfile;
              setUser(dbProfile);
              
              // Check for admin access
              if (dbProfile.role === 'admin' && isAdminHash) {
                setCurrentView(AppView.ADMIN);
              }
            }
          } catch (dbErr) {
            console.warn('Could not fetch profile from database:', dbErr);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setCheckingAuth(false);
      }
    };

    // Small delay to ensure Supabase processes the OAuth callback
    const timer = setTimeout(() => {
      initAuth();
    }, 100);

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Always use auth metadata first for immediate response
        const profile = mapSupabaseUserToProfile(session.user);
        setUser(profile);
        fetchRecipes(profile.id);
        
        // Only create/update profile on SIGNED_IN event (not on every auth state change)
        if (event === 'SIGNED_IN') {
          // Check if we've already created profile in this session
          const profileCreatedKey = `profile_created_${session.user.id}`;
          const alreadyCreated = sessionStorage.getItem(profileCreatedKey);
          
          if (!alreadyCreated) {
            const meta = session.user.user_metadata || {};
            createOrUpdateUserProfile(
              session.user.id,
              session.user.email || '',
              meta.full_name || meta.name || session.user.email?.split('@')[0] || 'User',
              session.user.app_metadata?.provider || 'email',
              'user'
            ).then(() => {
              sessionStorage.setItem(profileCreatedKey, 'true');
            }).catch(err => {
              console.warn('Could not create user profile in database:', err);
            });
          }
          
          // Fetch profile from database for role info
          fetchUserProfile(session.user.id).then(dbProfile => {
            if (dbProfile) {
              setUser(dbProfile);
              // Check for admin access via URL hash
              if (dbProfile.role === 'admin' && window.location.hash === '#adminmixlock') {
                setCurrentView(AppView.ADMIN);
              }
            }
          }).catch(err => {
            console.warn('Could not fetch user profile from database:', err);
          });
        }
      } else {
        setUser(null);
        setSavedRecipes([]);
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleVerify = () => {
    localStorage.setItem('london_mixologist_age_verified', 'true');
    setIsAgeVerified(true);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('london_mixologist_theme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('london_mixologist_theme', 'light');
    }
  };

  const handleLogin = (newUser: UserProfile) => {
    // Auth state change listener handles this mostly, but this forces view update
    setUser(newUser);
    if (newUser.role === 'admin' && window.location.hash === '#adminmixlock') {
        setCurrentView(AppView.ADMIN);
    } else {
        setCurrentView(AppView.PROFILE);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
      if (!user) return;
      const newUser = { ...user, ...updated };
      setUser(newUser);
      // Actual database updates handled in UserDashboard component via supabase calls
  };

  const handleSaveRecipe = async (recipe: CocktailRecipe) => {
    if (!user) {
      setCurrentView(AppView.PROFILE);
      return;
    }

    const { data, error } = await supabase.from('recipes').insert({
        user_id: user.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        glassware: recipe.glassware,
        difficulty: recipe.difficulty,
        estimated_cost_gbp: recipe.estimatedCostGBP,
        recommended_products: recipe.recommendedProducts
    }).select();

    if (error) {
        alert("Failed to save recipe: " + error.message);
    } else if (data) {
        // Optimistic update or refetch
        fetchRecipes(user.id);
        setCurrentView(AppView.PROFILE);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard setView={setCurrentView} />;
      case AppView.GENERATOR:
        return (
            <CocktailGenerator 
                onSave={handleSaveRecipe} 
                user={user}
                onSubscribe={() => handleUpdateProfile({ subscriptionStatus: 'active', subscriptionPlan: 'premium' })}
            />
        );
      case AppView.SHOPPING:
        return <ShoppingAssistant />;
      case AppView.VISION:
        return (
            <CocktailVision 
                user={user}
                onSubscribe={() => handleUpdateProfile({ subscriptionStatus: 'active', subscriptionPlan: 'premium' })}
            />
        );
      case AppView.CALCULATOR:
        return <DrinkCalculator onNavigate={setCurrentView} />;
      case AppView.GAMES:
        return <PartyGames />;
      case AppView.PROFILE:
        return user ? (
          <UserDashboard 
             user={user} 
             savedRecipes={savedRecipes} 
             onLogout={handleLogout} 
             onNavigate={setCurrentView}
             onUpdateProfile={handleUpdateProfile}
             onDeleteRecipe={(recipeId) => setSavedRecipes(prev => prev.filter(r => r.id !== recipeId))}
          />
        ) : (
          <UserAuth onLogin={handleLogin} />
        );
      case AppView.ADMIN:
        return isUserAdmin(user) ? <AdminDashboard /> : <Dashboard setView={setCurrentView} />;
      case AppView.COOKIE_POLICY:
        return <CookiePolicy onNavigate={setCurrentView} />;
      case AppView.PRIVACY_POLICY:
        return <PrivacyPolicy onNavigate={setCurrentView} />;
      case AppView.TERMS:
        return <TermsAndConditions onNavigate={setCurrentView} />;
      case AppView.DISCLAIMER:
        return <Disclaimer onNavigate={setCurrentView} />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  if (checkingAuth) return null;

  const isLegalPage = [
    AppView.COOKIE_POLICY, 
    AppView.PRIVACY_POLICY, 
    AppView.TERMS, 
    AppView.DISCLAIMER
  ].includes(currentView);

  if (!isAgeVerified) {
    return (
      <div className="h-screen bg-royalblue text-swanwing font-sans relative overflow-hidden flex flex-col">
        {isLegalPage ? (
           <div className="flex-1 overflow-y-auto">
             {renderView()}
           </div>
        ) : (
           <AgeVerificationModal onVerify={handleVerify} onNavigate={setCurrentView} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-royalblue text-swanwing font-sans selection:bg-quicksand selection:text-royalblue overflow-hidden relative transition-colors duration-500">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        user={user}
      />
      
      <main 
        ref={mainContentRef}
        className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth bg-royalblue transition-colors duration-500 pt-16 md:pt-24"
      >
         <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-quicksand/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
         <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-sapphire/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
         
         <div className="pb-24 md:pb-0 min-h-full relative z-10">
           <div key={currentView} className="animate-fade-in">
              {renderView()}
           </div>
         </div>
      </main>
    </div>
  );
}

export default App;