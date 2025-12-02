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

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // User State - Default to null (logged out)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  // Scroll Ref
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Scroll to top on view change for smooth UX
  useLayoutEffect(() => {
    if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentView]);

  useEffect(() => {
    // Check Age Verification
    const verified = localStorage.getItem('london_mixologist_age_verified');
    if (verified === 'true') {
      setIsAgeVerified(true);
    }
    setCheckingAuth(false);

    // Check Theme Preference
    const storedTheme = localStorage.getItem('london_mixologist_theme');
    if (storedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light-mode');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light-mode');
    }

    // Check Stored User
    const storedUser = localStorage.getItem('london_mixologist_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check Stored Recipes
    const storedRecipes = localStorage.getItem('london_mixologist_saved_recipes');
    if (storedRecipes) {
      setSavedRecipes(JSON.parse(storedRecipes));
    }

    // Admin URL Check (adminmixlock)
    if (window.location.hash === '#adminmixlock') {
        if (user?.role === 'admin') {
            setCurrentView(AppView.ADMIN);
        } else {
            setCurrentView(AppView.PROFILE);
        }
    }
  }, [user?.role]);

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
    setUser(newUser);
    localStorage.setItem('london_mixologist_user', JSON.stringify(newUser));
    if (newUser.role === 'admin' && window.location.hash === '#adminmixlock') {
        setCurrentView(AppView.ADMIN);
    } else {
        setCurrentView(AppView.PROFILE);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('london_mixologist_user');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
      if (!user) return;
      const newUser = { ...user, ...updated };
      setUser(newUser);
      localStorage.setItem('london_mixologist_user', JSON.stringify(newUser));
  };

  const handleSaveRecipe = (recipe: CocktailRecipe) => {
    if (!user) {
      setCurrentView(AppView.PROFILE);
      return;
    }
    const newSavedRecipe: SavedRecipe = {
      ...recipe,
      id: Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString()
    };
    const updatedRecipes = [newSavedRecipe, ...savedRecipes];
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('london_mixologist_saved_recipes', JSON.stringify(updatedRecipes));
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
      // Legal Pages
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

  // STRICT AGE GATE
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
      
      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        user={user}
      />
      
      {/* Main Content Area */}
      {/* Added ref for scroll control and pt-24 for header spacing */}
      <main 
        ref={mainContentRef}
        className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth bg-royalblue transition-colors duration-500 pt-0 md:pt-24"
      >
         {/* Ambient Background Lights */}
         <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-quicksand/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
         <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-sapphire/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
         
         <div className="pb-24 md:pb-0 min-h-full relative z-10">
           {/* Key prop ensures the animation replays when view changes */}
           <div key={currentView} className="animate-fade-in">
              {renderView()}
           </div>
         </div>
      </main>
    </div>
  );
}

export default App;