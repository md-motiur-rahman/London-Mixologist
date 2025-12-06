import React, { useState } from 'react';
import { AppView, UserProfile } from '../types';
import { Martini, ShoppingBag, Home, Sun, Moon, Camera, ChevronLeft, ChevronRight, Gamepad2, User, Calculator, Menu, X, Settings, LogOut } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: UserProfile | null;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, isDarkMode, toggleTheme, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: AppView) => {
      setView(view);
      setIsMobileMenuOpen(false);
  };

  // Desktop Nav Item Component
  const DesktopNavItem = ({ view, label, icon: Icon }: { view: AppView, label: string, icon: any }) => {
      const isActive = currentView === view;
      return (
        <button 
            onClick={() => setView(view)} 
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-bold border
                ${isActive 
                    ? 'bg-quicksand text-royalblue border-quicksand shadow-[0_0_15px_rgba(224,197,143,0.3)]' 
                    : 'bg-transparent border-transparent text-shellstone hover:text-swanwing hover:bg-white/5 hover:border-white/10'
                }
            `}
        >
            <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
            {label}
        </button>
      );
  };

  return (
    <>
        {/* MOBILE TOP HEADER BAR */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-royalblue/95 backdrop-blur-xl border-b border-sapphire/20 z-40 flex items-center justify-between px-4">
            {/* Brand Logo */}
            <div 
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => handleMobileNav(AppView.DASHBOARD)}
            >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-quicksand to-[#b89b5e] flex items-center justify-center text-royalblue font-black shadow-lg shadow-quicksand/20 text-base group-hover:scale-105 transition-transform duration-300">
                    LM
                </div>
                <div className="flex flex-col">
                    <span className="font-serif font-bold text-lg text-swanwing leading-none tracking-tight">London</span>
                    <span className="text-[8px] text-quicksand uppercase tracking-[0.2em] font-bold mt-0.5">Mixologist</span>
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-full text-shellstone hover:text-quicksand hover:bg-white/5 transition-all"
                >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {user?.avatar ? (
                    <button onClick={() => handleMobileNav(AppView.PROFILE)}>
                        <img src={user.avatar} className="w-8 h-8 rounded-full border-2 border-sapphire" alt="Profile" />
                    </button>
                ) : (
                    <button 
                        onClick={() => handleMobileNav(AppView.PROFILE)}
                        className="p-2 rounded-full text-shellstone hover:text-quicksand hover:bg-white/5 transition-all"
                    >
                        <User size={18} />
                    </button>
                )}
            </div>
        </header>

        {/* MOBILE MENU OVERLAY (Drawer) */}
        <div className={`md:hidden fixed inset-0 z-50 bg-royalblue/95 backdrop-blur-xl transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} flex flex-col pt-8 px-6 pb-24 overflow-y-auto`}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-sapphire/30">
                {/* Brand Logo */}
                <div 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => handleMobileNav(AppView.DASHBOARD)}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-quicksand to-[#b89b5e] flex items-center justify-center text-royalblue font-black shadow-lg shadow-quicksand/20 text-lg group-hover:scale-105 transition-transform duration-300">
                        LM
                    </div>
                    <div className="flex flex-col">
                        <span className="font-serif font-bold text-xl text-swanwing leading-none tracking-tight group-hover:text-quicksand transition-colors">London</span>
                        <span className="text-[9px] text-quicksand uppercase tracking-[0.2em] font-bold mt-0.5">Mixologist</span>
                    </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-shellstone hover:text-quicksand">
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-3">
                <p className="text-xs font-bold text-quicksand uppercase tracking-widest mb-2">Tools & Features</p>
                <button onClick={() => handleMobileNav(AppView.CALCULATOR)} className="w-full flex items-center gap-4 p-4 bg-sapphire/20 rounded-xl text-swanwing font-bold hover:bg-sapphire/40 transition-colors border border-sapphire/30">
                    <div className="bg-royalblue p-2 rounded-lg text-quicksand"><Calculator size={20} /></div>
                    Party Planner
                </button>
                <button onClick={() => handleMobileNav(AppView.SHOPPING)} className="w-full flex items-center gap-4 p-4 bg-sapphire/20 rounded-xl text-swanwing font-bold hover:bg-sapphire/40 transition-colors border border-sapphire/30">
                    <div className="bg-royalblue p-2 rounded-lg text-quicksand"><ShoppingBag size={20} /></div>
                    Shopping Assistant
                </button>
                <button onClick={() => handleMobileNav(AppView.GAMES)} className="w-full flex items-center gap-4 p-4 bg-sapphire/20 rounded-xl text-swanwing font-bold hover:bg-sapphire/40 transition-colors border border-sapphire/30">
                    <div className="bg-royalblue p-2 rounded-lg text-quicksand"><Gamepad2 size={20} /></div>
                    Party Games
                </button>
            </div>

            <div className="mt-8 pt-6 border-t border-sapphire/30 space-y-3">
                 <p className="text-xs font-bold text-quicksand uppercase tracking-widest mb-2">Settings</p>
                 <button onClick={toggleTheme} className="w-full flex items-center gap-4 p-4 rounded-xl text-shellstone hover:text-swanwing hover:bg-sapphire/20 transition-colors border border-transparent hover:border-sapphire/30">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                 </button>
                 <button onClick={() => handleMobileNav(AppView.COOKIE_POLICY)} className="w-full flex items-center gap-4 p-4 rounded-xl text-shellstone hover:text-swanwing hover:bg-sapphire/20 transition-colors border border-transparent hover:border-sapphire/30">
                    <Settings size={20} />
                    Privacy & Legal
                 </button>
            </div>
            
            <div className="mt-auto pt-8 text-center text-xs text-shellstone/50">
                &copy; 2025 London Mixologist
            </div>
        </div>

        {/* DESKTOP TOP BAR */}
        <nav className="hidden md:flex fixed top-0 left-0 right-0 h-24 bg-royalblue/80 backdrop-blur-xl border-b border-white/5 z-50 items-center justify-between px-8 transition-all duration-300">
            {/* Logo Area */}
            <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setView(AppView.DASHBOARD)}
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-quicksand to-[#b89b5e] flex items-center justify-center text-royalblue font-black shadow-lg shadow-quicksand/20 text-xl group-hover:scale-105 transition-transform duration-300">
                    LM
                </div>
                <div className="flex flex-col">
                    <span className="font-serif font-bold text-2xl text-swanwing leading-none tracking-tight group-hover:text-quicksand transition-colors">London</span>
                    <span className="text-[10px] text-quicksand uppercase tracking-[0.25em] font-bold mt-1">Mixologist</span>
                </div>
            </div>

            {/* Centered Navigation */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/10 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
                <DesktopNavItem view={AppView.DASHBOARD} label="Home" icon={Home} />
                <DesktopNavItem view={AppView.GENERATOR} label="My Bar" icon={Martini} />
                <DesktopNavItem view={AppView.VISION} label="Tipsy Vision" icon={Camera} />
                <DesktopNavItem view={AppView.CALCULATOR} label="Plan" icon={Calculator} />
                <DesktopNavItem view={AppView.SHOPPING} label="Shop" icon={ShoppingBag} />
                <DesktopNavItem view={AppView.GAMES} label="Play" icon={Gamepad2} />
            </div>

             {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleTheme} 
                    className="p-3 rounded-full text-shellstone hover:text-quicksand hover:bg-white/5 transition-all"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {user ? (
                    <button 
                        onClick={() => setView(AppView.PROFILE)} 
                        className={`flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border transition-all duration-300 group ${currentView === AppView.PROFILE ? 'border-quicksand bg-quicksand/10' : 'border-white/10 hover:bg-white/5 hover:border-white/20'}`}
                    >
                        <img src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} alt="User" className="w-10 h-10 rounded-full border-2 border-sapphire group-hover:border-quicksand transition-colors" />
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-shellstone leading-none mb-0.5">Hello,</span>
                            <span className="text-sm font-bold text-swanwing leading-none group-hover:text-quicksand transition-colors">{user.name.split(' ')[0]}</span>
                        </div>
                    </button>
                ) : (
                    <button 
                         onClick={() => setView(AppView.PROFILE)}
                         className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-quicksand text-royalblue font-bold hover:bg-[#d4b475] transition-all shadow-lg hover:shadow-quicksand/20 text-sm"
                    >
                        <User size={18} /> Login
                    </button>
                )}
            </div>
        </nav>

        {/* MOBILE BOTTOM BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-20 bg-royalblue/95 backdrop-blur-xl border-t border-sapphire/30 flex items-center justify-around px-2 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
            <button 
                onClick={() => handleMobileNav(AppView.DASHBOARD)} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 ${currentView === AppView.DASHBOARD ? 'text-quicksand' : 'text-shellstone'}`}
            >
                <Home size={22} strokeWidth={currentView === AppView.DASHBOARD ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Home</span>
            </button>
            
            <button 
                onClick={() => handleMobileNav(AppView.GENERATOR)} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 ${currentView === AppView.GENERATOR ? 'text-quicksand' : 'text-shellstone'}`}
            >
                <Martini size={22} strokeWidth={currentView === AppView.GENERATOR ? 2.5 : 2} />
                <span className="text-[10px] font-bold">Mix</span>
            </button>
            
            <button 
                onClick={() => handleMobileNav(AppView.VISION)} 
                className={`relative -top-5 bg-gradient-to-br from-quicksand to-[#b89b5e] p-4 rounded-full shadow-lg shadow-quicksand/30 text-royalblue flex items-center justify-center transform active:scale-95 transition-transform`}
            >
                <Camera size={26} strokeWidth={2.5} />
            </button>

            <button 
                onClick={() => handleMobileNav(AppView.PROFILE)} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 ${currentView === AppView.PROFILE ? 'text-quicksand' : 'text-shellstone'}`}
            >
                {user?.avatar ? (
                    <img src={user.avatar} className={`w-6 h-6 rounded-full border-2 ${currentView === AppView.PROFILE ? 'border-quicksand' : 'border-transparent'}`} alt="Profile" />
                ) : (
                    <User size={22} strokeWidth={currentView === AppView.PROFILE ? 2.5 : 2} />
                )}
                <span className="text-[10px] font-bold">Profile</span>
            </button>

             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 ${isMobileMenuOpen ? 'text-quicksand' : 'text-shellstone'}`}
            >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                <span className="text-[10px] font-bold">More</span>
            </button>
        </nav>
    </>
  );
};