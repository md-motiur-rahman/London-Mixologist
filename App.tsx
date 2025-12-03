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
import { supabase, mapSupabaseUserToProfile } from './services/supabaseClient';

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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const profile = mapSupabaseUserToProfile(session.user);
            setUser(profile);
            fetchRecipes(profile.id);
        }
        setCheckingAuth(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
            const profile = mapSupabaseUserToProfile(session.user);
            setUser(profile);
            // Fetch recipes only if we just logged in (savedRecipes empty or user changed)
            // But simple way is just fetch always on auth change
            fetchRecipes(profile.id);
        } else {
            setUser(null);
            setSavedRecipes([]);
        }
    });

    return () => subscription.unsubscribe();
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
        return <DrinkCalculator />;
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
          />
        ) : (
          <UserAuth onLogin={handleLogin} />
        );
      case AppView.ADMIN:
        return user?.role === 'admin' ? <AdminDashboard /> : <Dashboard setView={setCurrentView} />;
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
        className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth bg-royalblue transition-colors duration-500 pt-0 md:pt-24"
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