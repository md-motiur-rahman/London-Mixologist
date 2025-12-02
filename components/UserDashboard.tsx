import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, SavedRecipe, AppView, NotificationPreferences } from '../types';
import { LogOut, User, Clock, Heart, Settings, Shield, ShoppingCart, ChevronRight, LayoutDashboard, Crown, CreditCard, Camera, Link as LinkIcon, TrendingUp, CheckCircle, Upload, Bell, Mail } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';

interface UserDashboardProps {
  user: UserProfile;
  savedRecipes: SavedRecipe[];
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, savedRecipes, onLogout, onNavigate, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'saved' | 'settings' | 'subscription' | 'affiliate' | 'notifications'>('history');
  
  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Affiliate Edit State
  const [affiliateId, setAffiliateId] = useState(user.amazonAssociateId || '');

  // Notification State
  const [notifications, setNotifications] = useState<NotificationPreferences>(user.notificationPreferences || {
      newsletter: true,
      newFeatures: true,
      partnerOffers: false,
      securityAlerts: true
  });

  // Modal State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
      // Sync local state if user prop updates
      if (user.notificationPreferences) {
          setNotifications(user.notificationPreferences);
      }
  }, [user]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              onUpdateProfile({ avatar: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleProfileSave = () => {
      onUpdateProfile({ name: editName, email: editEmail });
      setIsEditing(false);
  };

  const handleAffiliateSave = () => {
      onUpdateProfile({ 
          amazonAssociateId: affiliateId,
          isAffiliate: !!affiliateId 
      });
  };

  const handleNotificationToggle = (key: keyof NotificationPreferences) => {
      const updated = { ...notifications, [key]: !notifications[key] };
      setNotifications(updated);
      onUpdateProfile({ notificationPreferences: updated });
  };

  const handleUpgradeClick = () => {
      setShowSubscriptionModal(true);
  };

  const handleSubscriptionSuccess = () => {
      onUpdateProfile({ subscriptionStatus: 'active', subscriptionPlan: 'premium' });
      setShowSubscriptionModal(false);
  };

  // Helper for smoother toggle switch
  const ToggleSwitch = ({ active, onClick, disabled }: { active: boolean, onClick?: () => void, disabled?: boolean }) => (
      <div 
        onClick={!disabled ? onClick : undefined}
        className={`w-14 h-8 rounded-full relative transition-all duration-300 border border-transparent ${disabled ? 'opacity-60 cursor-not-allowed bg-emerald-500/20' : 'cursor-pointer'} ${active ? 'bg-quicksand shadow-[0_0_10px_rgba(224,197,143,0.3)]' : 'bg-sapphire/30 hover:bg-sapphire/50'}`}
      >
          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${active ? 'left-7' : 'left-1'}`}></div>
      </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in space-y-8">
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscriptionSuccess}
      />

      {/* Header Profile Card */}
      <div className="bg-sapphire/10 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-sapphire/30 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden transition-all hover:border-sapphire/50">
         <div className="absolute top-0 right-0 w-64 h-64 bg-quicksand/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
         
         <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-quicksand shadow-xl overflow-hidden bg-royalblue relative transition-transform duration-300 group-hover:scale-105">
                <img 
                    src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                />
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white backdrop-blur-sm"
                >
                    <Camera size={24} />
                </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            
            {user.subscriptionStatus === 'active' && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 border border-yellow-200 text-white p-1.5 rounded-full shadow-lg z-10 animate-bounce delay-1000">
                    <Crown size={14} fill="currentColor" />
                </div>
            )}
         </div>

         <div className="text-center md:text-left flex-1 z-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-swanwing mb-2">{user.name}</h1>
            <p className="text-shellstone mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
               <span className="bg-sapphire/30 px-3 py-1 rounded-full text-xs text-shellstone border border-sapphire/30 flex items-center gap-1">
                  <Clock size={12} /> Joined {new Date(user.joinedDate).toLocaleDateString()}
               </span>
               <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 font-bold ${user.subscriptionStatus === 'active' ? 'bg-quicksand/20 text-quicksand border-quicksand/50' : 'bg-sapphire/30 text-shellstone border-sapphire/30'}`}>
                  {user.subscriptionStatus === 'active' ? <><Crown size={12} /> Premium Member</> : 'Free Plan'}
               </span>
               {user.role === 'admin' && (
                  <button 
                     onClick={() => onNavigate(AppView.ADMIN)}
                     className="bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-full text-xs text-red-400 border border-red-500/30 flex items-center gap-1 transition-colors font-bold cursor-pointer"
                  >
                     <LayoutDashboard size={12} /> Admin
                  </button>
               )}
            </div>
         </div>

         <button 
            onClick={onLogout}
            className="absolute top-6 right-6 p-2 text-shellstone hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
            title="Sign Out"
         >
            <LogOut size={20} />
         </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-sapphire/30 overflow-x-auto pb-1 custom-scrollbar">
         {[
             { id: 'history', label: 'History', icon: <Clock size={16} /> },
             { id: 'saved', label: 'Saved', icon: <Heart size={16} /> },
             { id: 'subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
             { id: 'affiliate', label: 'Affiliate Program', icon: <TrendingUp size={16} /> },
             { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
             { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
         ].map(tab => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 flex items-center gap-2 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-quicksand text-quicksand' : 'border-transparent text-shellstone hover:text-swanwing'}`}
             >
                {tab.icon} {tab.label}
             </button>
         ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
         {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
               {savedRecipes.length > 0 ? (
                  savedRecipes.map((recipe) => (
                     <div key={recipe.id} className="bg-sapphire/10 border border-sapphire/30 rounded-xl overflow-hidden group hover:border-quicksand/50 transition-all shadow-lg hover:shadow-quicksand/10">
                        <div className="h-32 bg-royalblue relative overflow-hidden">
                           <img 
                              src={`https://picsum.photos/seed/${recipe.name.replace(/\s/g, '')}/400/200`} 
                              alt={recipe.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-royalblue to-transparent opacity-80"></div>
                           <div className="absolute bottom-3 left-3">
                              <h3 className="font-bold serif text-swanwing text-lg">{recipe.name}</h3>
                              <p className="text-xs text-quicksand">{new Date(recipe.dateCreated).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <div className="p-4">
                           <p className="text-sm text-shellstone line-clamp-2 mb-3 h-10">{recipe.description}</p>
                           <div className="flex gap-2 mb-4">
                              <span className="text-[10px] uppercase font-bold px-2 py-1 bg-sapphire/20 rounded text-shellstone">{recipe.difficulty}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-1 bg-sapphire/20 rounded text-shellstone">{recipe.glassware}</span>
                           </div>
                           <button className="w-full py-2 bg-sapphire/20 hover:bg-quicksand text-quicksand hover:text-royalblue font-bold rounded-lg text-sm transition-colors">
                              View Recipe
                           </button>
                        </div>
                     </div>
                  ))
               ) : (
                  <div className="col-span-full text-center py-12 bg-sapphire/5 rounded-2xl border border-dashed border-sapphire/30">
                     <Clock className="w-12 h-12 text-shellstone mx-auto mb-4 opacity-50" />
                     <h3 className="text-lg font-bold text-swanwing mb-2">No recipes yet</h3>
                     <p className="text-shellstone mb-6">Start mixing to save your creations here.</p>
                     <button 
                        onClick={() => onNavigate(AppView.GENERATOR)}
                        className="px-6 py-2 bg-quicksand text-royalblue rounded-lg font-bold hover:bg-quicksand/90 transition-all hover:scale-105"
                     >
                        Go to Mixer
                     </button>
                  </div>
               )}
            </div>
         )}

         {activeTab === 'saved' && (
             <div className="animate-fade-in">
                 <div className="bg-sapphire/10 rounded-xl p-6 border border-sapphire/30">
                     <h3 className="text-lg font-bold text-quicksand mb-4 flex items-center gap-2">
                        <ShoppingCart size={20} /> Affiliate Wishlist
                     </h3>
                     <p className="text-shellstone mb-6 text-sm">Items you've viewed or saved from recipe recommendations appear here.</p>
                     
                     <div className="space-y-4">
                         {/* Mock Saved Items */}
                         {[
                             { name: 'Crystal Coupe Glasses', price: '£24.99', store: 'Amazon' },
                             { name: 'Angostura Aromatic Bitters', price: '£12.00', store: 'Waitrose' },
                             { name: 'Copper Cocktail Shaker Set', price: '£35.50', store: 'Amazon' }
                         ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-royalblue border border-sapphire/20 rounded-lg hover:border-quicksand/30 transition-all hover:translate-x-1 group cursor-pointer shadow-sm hover:shadow-lg">
                                 <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-swanwing/10 rounded-md flex items-center justify-center text-swanwing font-serif font-bold text-xl">
                                         {item.name[0]}
                                     </div>
                                     <div>
                                         <h4 className="font-bold text-swanwing group-hover:text-quicksand transition-colors">{item.name}</h4>
                                         <p className="text-xs text-shellstone">Saved from {item.store}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <span className="font-bold text-quicksand">{item.price}</span>
                                     <ChevronRight size={16} className="text-shellstone group-hover:translate-x-1 transition-transform" />
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'subscription' && (
             <div className="animate-fade-in max-w-3xl mx-auto">
                 <div className="bg-gradient-to-br from-royalblue to-sapphire/20 rounded-2xl border border-sapphire/30 overflow-hidden shadow-2xl">
                     <div className="p-8">
                         <div className="flex items-center justify-between mb-8">
                             <div>
                                 <h3 className="text-2xl font-serif font-bold text-swanwing mb-2">Membership Status</h3>
                                 <p className="text-shellstone">Manage your access and billing.</p>
                             </div>
                             {user.subscriptionStatus === 'active' ? (
                                 <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-bold flex items-center gap-2 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                                     <CheckCircle size={18} /> Active
                                 </div>
                             ) : (
                                 <div className="px-4 py-2 bg-shellstone/10 border border-shellstone/30 rounded-full text-shellstone font-bold">
                                     Free Plan
                                 </div>
                             )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${user.subscriptionStatus !== 'active' ? 'border-quicksand bg-quicksand/5 shadow-lg' : 'border-sapphire/30 bg-sapphire/10 opacity-50'}`}>
                                 <div className="flex justify-between items-start mb-4">
                                     <h4 className="font-bold text-lg text-swanwing">Free Tier</h4>
                                     {user.subscriptionStatus !== 'active' && <CheckCircle size={20} className="text-quicksand" />}
                                 </div>
                                 <ul className="space-y-3 mb-6 text-sm text-shellstone">
                                     <li className="flex items-center gap-2"><CheckCircle size={14} /> Basic Cocktail Generation</li>
                                     <li className="flex items-center gap-2"><CheckCircle size={14} /> Shopping Assistant</li>
                                     <li className="flex items-center gap-2"><CheckCircle size={14} /> Basic Game Access</li>
                                 </ul>
                             </div>

                             <div className={`p-6 rounded-xl border-2 transition-all duration-300 relative ${user.subscriptionStatus === 'active' ? 'border-quicksand bg-quicksand/5 shadow-lg' : 'border-sapphire/30 bg-sapphire/10'}`}>
                                 {user.subscriptionStatus !== 'active' && (
                                     <div className="absolute top-0 right-0 bg-quicksand text-royalblue text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md">
                                         RECOMMENDED
                                     </div>
                                 )}
                                 <div className="flex justify-between items-start mb-4">
                                     <h4 className="font-bold text-lg text-swanwing flex items-center gap-2"><Crown size={18} className="text-quicksand" /> Premium</h4>
                                     {user.subscriptionStatus === 'active' && <CheckCircle size={20} className="text-quicksand" />}
                                 </div>
                                 <ul className="space-y-3 mb-6 text-sm text-shellstone">
                                     <li className="flex items-center gap-2"><CheckCircle size={14} className="text-quicksand" /> <strong>Unlimited</strong> Recipe Saving</li>
                                     <li className="flex items-center gap-2"><CheckCircle size={14} className="text-quicksand" /> <strong>AI Vision</strong> Analysis</li>
                                     <li className="flex items-center gap-2"><CheckCircle size={14} className="text-quicksand" /> Affiliate Income Program</li>
                                 </ul>
                                 <div className="text-2xl font-bold text-swanwing mb-1">£4.99 <span className="text-sm text-shellstone font-normal">/month</span></div>
                             </div>
                         </div>
                     </div>
                     <div className="bg-sapphire/10 p-6 border-t border-sapphire/30 text-right">
                         {user.subscriptionStatus === 'active' ? (
                             <button className="text-shellstone hover:text-red-400 text-sm font-bold transition-colors">Cancel Subscription</button>
                         ) : (
                             <button 
                                onClick={handleUpgradeClick}
                                className="px-8 py-3 bg-quicksand text-royalblue font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
                             >
                                Upgrade Now
                             </button>
                         )}
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'affiliate' && (
             <div className="animate-fade-in max-w-3xl mx-auto">
                 <div className="bg-sapphire/10 p-8 rounded-2xl border border-sapphire/30 mb-8">
                     <h3 className="text-2xl font-serif font-bold text-swanwing mb-2 flex items-center gap-3">
                         <TrendingUp className="text-quicksand" /> Affiliate Dashboard
                     </h3>
                     <p className="text-shellstone mb-6">Monetize your cocktail creations. Add your Amazon Associate ID to earn when others buy ingredients from your recipes.</p>
                     
                     {user.subscriptionStatus !== 'active' ? (
                         <div className="bg-sapphire/20 p-6 rounded-xl text-center border border-sapphire/30">
                             <Crown size={32} className="mx-auto text-shellstone mb-2" />
                             <h4 className="font-bold text-swanwing mb-2">Premium Feature</h4>
                             <p className="text-sm text-shellstone mb-4">Upgrade to Premium to enable the Affiliate Program.</p>
                             <button onClick={() => setActiveTab('subscription')} className="text-quicksand font-bold hover:underline">Go to Subscription</button>
                         </div>
                     ) : (
                         <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-royalblue p-4 rounded-xl border border-sapphire/30">
                                     <label className="block text-xs font-bold text-shellstone uppercase mb-2">Amazon Associate Tag</label>
                                     <div className="flex gap-2">
                                         <input 
                                            type="text" 
                                            value={affiliateId}
                                            onChange={(e) => setAffiliateId(e.target.value)}
                                            placeholder="e.g. mixologist-21"
                                            className="flex-1 bg-sapphire/20 border border-sapphire/50 rounded-lg px-3 py-2 text-swanwing focus:border-quicksand outline-none transition-colors"
                                         />
                                         <button 
                                            onClick={handleAffiliateSave}
                                            className="px-4 py-2 bg-quicksand text-royalblue font-bold rounded-lg hover:bg-quicksand/90 transition-colors"
                                         >
                                            Save
                                         </button>
                                     </div>
                                 </div>
                                 <div className="bg-royalblue p-4 rounded-xl border border-sapphire/30 flex items-center justify-between">
                                     <div>
                                         <div className="text-xs font-bold text-shellstone uppercase mb-1">Status</div>
                                         <div className={`font-bold ${user.isAffiliate ? 'text-emerald-400' : 'text-shellstone'}`}>
                                             {user.isAffiliate ? 'Active' : 'Inactive'}
                                         </div>
                                     </div>
                                     <div className={`w-3 h-3 rounded-full ${user.isAffiliate ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-shellstone'}`}></div>
                                 </div>
                             </div>

                             {user.isAffiliate && (
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                         <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Total Clicks</div>
                                         <div className="text-2xl font-bold text-swanwing">{user.affiliateStats?.clicks || 0}</div>
                                     </div>
                                     <div className="bg-quicksand/10 border border-quicksand/20 p-4 rounded-xl">
                                         <div className="text-xs font-bold text-quicksand uppercase mb-1">Est. Earnings</div>
                                         <div className="text-2xl font-bold text-swanwing">£{user.affiliateStats?.earnings?.toFixed(2) || '0.00'}</div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
             </div>
         )}

         {activeTab === 'notifications' && (
             <div className="animate-fade-in max-w-2xl mx-auto">
                 <div className="bg-sapphire/10 p-6 rounded-2xl border border-sapphire/30">
                     <h3 className="text-xl font-serif font-bold text-swanwing mb-6 flex items-center gap-2">
                         <Mail size={20} className="text-quicksand" /> Email Notifications
                     </h3>
                     
                     <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-royalblue rounded-xl border border-sapphire/20 transition-all hover:border-sapphire/40">
                             <div>
                                 <h4 className="font-bold text-swanwing text-sm">Weekly Digest</h4>
                                 <p className="text-xs text-shellstone">Get a summary of trending cocktails and tips.</p>
                             </div>
                             <ToggleSwitch 
                                active={notifications.newsletter} 
                                onClick={() => handleNotificationToggle('newsletter')} 
                             />
                         </div>

                         <div className="flex items-center justify-between p-4 bg-royalblue rounded-xl border border-sapphire/20 transition-all hover:border-sapphire/40">
                             <div>
                                 <h4 className="font-bold text-swanwing text-sm">New Feature Alerts</h4>
                                 <p className="text-xs text-shellstone">Be the first to know about new AI capabilities.</p>
                             </div>
                             <ToggleSwitch 
                                active={notifications.newFeatures} 
                                onClick={() => handleNotificationToggle('newFeatures')} 
                             />
                         </div>

                         <div className="flex items-center justify-between p-4 bg-royalblue rounded-xl border border-sapphire/20 transition-all hover:border-sapphire/40">
                             <div>
                                 <h4 className="font-bold text-swanwing text-sm">Partner Offers</h4>
                                 <p className="text-xs text-shellstone">Exclusive deals on spirits and glassware.</p>
                             </div>
                             <ToggleSwitch 
                                active={notifications.partnerOffers} 
                                onClick={() => handleNotificationToggle('partnerOffers')} 
                             />
                         </div>

                         <div className="flex items-center justify-between p-4 bg-royalblue rounded-xl border border-sapphire/20 opacity-70">
                             <div>
                                 <h4 className="font-bold text-swanwing text-sm">Security Alerts</h4>
                                 <p className="text-xs text-shellstone">Important account security notifications (Always On).</p>
                             </div>
                             <ToggleSwitch active={true} disabled={true} />
                         </div>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'settings' && (
             <div className="animate-fade-in max-w-2xl mx-auto">
                 <div className="bg-sapphire/10 p-6 rounded-2xl border border-sapphire/30 mb-6">
                     <div className="flex justify-between items-center mb-6 border-b border-sapphire/30 pb-4">
                        <h3 className="font-bold text-swanwing">Profile Details</h3>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-quicksand hover:underline">Edit</button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-shellstone hover:text-swanwing">Cancel</button>
                                <button onClick={handleProfileSave} className="text-xs font-bold text-quicksand hover:underline">Save</button>
                            </div>
                        )}
                     </div>
                     <div className="grid grid-cols-1 gap-4">
                         <div>
                             <label className="text-xs text-shellstone uppercase font-bold">Display Name</label>
                             <input 
                                type="text" 
                                value={isEditing ? editName : user.name} 
                                readOnly={!isEditing}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`w-full bg-royalblue border rounded-xl p-3 text-sm text-swanwing mt-1 transition-all ${isEditing ? 'border-quicksand shadow-lg' : 'border-sapphire/30 opacity-70'}`} 
                             />
                         </div>
                         <div>
                             <label className="text-xs text-shellstone uppercase font-bold">Email</label>
                             <input 
                                type="email" 
                                value={isEditing ? editEmail : user.email} 
                                readOnly={!isEditing}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className={`w-full bg-royalblue border rounded-xl p-3 text-sm text-swanwing mt-1 transition-all ${isEditing ? 'border-quicksand shadow-lg' : 'border-sapphire/30 opacity-70'}`} 
                             />
                         </div>
                         {isEditing && (
                             <div className="animate-fade-in">
                                 <label className="text-xs text-shellstone uppercase font-bold">New Password</label>
                                 <input 
                                    type="password" 
                                    placeholder="Leave blank to keep current"
                                    className="w-full bg-royalblue border border-quicksand rounded-xl p-3 text-sm text-swanwing mt-1 shadow-lg" 
                                 />
                             </div>
                         )}
                         <div>
                             <label className="text-xs text-shellstone uppercase font-bold">Phone Number</label>
                             <input 
                                type="tel" 
                                value={user.phoneNumber || ''} 
                                readOnly={!isEditing}
                                onChange={(e) => onUpdateProfile({ phoneNumber: e.target.value })}
                                placeholder="+44"
                                className={`w-full bg-royalblue border rounded-xl p-3 text-sm text-swanwing mt-1 transition-all ${isEditing ? 'border-quicksand shadow-lg' : 'border-sapphire/30 opacity-70'}`} 
                             />
                         </div>
                         <div>
                             <label className="text-xs text-shellstone uppercase font-bold">Address</label>
                             <input 
                                type="text" 
                                value={user.address || ''} 
                                readOnly={!isEditing}
                                onChange={(e) => onUpdateProfile({ address: e.target.value })}
                                placeholder="Street Address"
                                className={`w-full bg-royalblue border rounded-xl p-3 text-sm text-swanwing mt-1 transition-all ${isEditing ? 'border-quicksand shadow-lg' : 'border-sapphire/30 opacity-70'}`} 
                             />
                         </div>
                     </div>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};