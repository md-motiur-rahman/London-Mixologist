import React, { useState, useEffect } from 'react';
import { Users, Database, Link, Power, Activity, Search, Trash2, Edit, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  provider: string;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRecipes: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'users' | 'app' | 'affiliate'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRecipes: 0
  });

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const premium = data?.filter(u => u.subscription_plan === 'premium').length || 0;
      const active = data?.filter(u => u.subscription_status === 'active').length || 0;
      
      setStats(prev => ({
        ...prev,
        totalUsers: total,
        premiumUsers: premium,
        activeUsers: active
      }));

    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe count
  const fetchRecipeCount = async () => {
    try {
      const { count, error } = await supabase
        .from('recipes')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setStats(prev => ({ ...prev, totalRecipes: count }));
      }
    } catch (err) {
      console.warn('Could not fetch recipe count:', err);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  // Update user role
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Change user role to ${newRole}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Refresh users list
      fetchUsers();
    } catch (err: any) {
      alert('Failed to update user role: ' + err.message);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    fetchRecipeCount();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Affiliate links (still mock for now - can be connected to a table later)
  const affiliateLinks = [
    { id: 'ASIN001', name: 'Premium Shaker Set', ctr: '4.5%', clicks: 120, category: 'Tools' },
    { id: 'ASIN002', name: 'Crystal Coupe Glass', ctr: '2.1%', clicks: 45, category: 'Glassware' },
    { id: 'ASIN003', name: 'Luxardo Cherries', ctr: '6.8%', clicks: 310, category: 'Garnish' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-serif font-bold text-swanwing">Admin Console</h2>
           <p className="text-shellstone text-sm">System oversight and configuration.</p>
        </div>
        <div className="flex gap-2 bg-sapphire/20 p-1 rounded-lg">
           <button 
             onClick={() => setActiveModule('users')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeModule === 'users' ? 'bg-quicksand text-royalblue' : 'text-shellstone hover:text-swanwing'}`}
           >
              <Users size={16} /> Users
           </button>
           <button 
             onClick={() => setActiveModule('app')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeModule === 'app' ? 'bg-quicksand text-royalblue' : 'text-shellstone hover:text-swanwing'}`}
           >
              <Database size={16} /> App Tools
           </button>
           <button 
             onClick={() => setActiveModule('affiliate')}
             className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeModule === 'affiliate' ? 'bg-quicksand text-royalblue' : 'text-shellstone hover:text-swanwing'}`}
           >
              <Link size={16} /> Affiliate
           </button>
        </div>
      </div>

      <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6 min-h-[500px]">
         
         {/* ACTIVE USER MANAGEMENT */}
         {activeModule === 'users' && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold text-quicksand">Active User Management (AUM)</h3>
                    <button 
                      onClick={fetchUsers}
                      disabled={loading}
                      className="p-2 bg-sapphire/20 rounded-lg hover:bg-sapphire/40 transition-colors disabled:opacity-50"
                      title="Refresh users"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 text-shellstone" size={16} />
                     <input 
                       type="text" 
                       placeholder="Search users..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="bg-royalblue border border-sapphire/50 rounded-lg pl-10 pr-4 py-2 text-sm text-swanwing focus:border-quicksand outline-none" 
                     />
                  </div>
               </div>

               {/* Stats Cards */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-royalblue/50 p-4 rounded-xl border border-sapphire/30">
                   <p className="text-xs text-shellstone uppercase">Total Users</p>
                   <p className="text-2xl font-bold text-swanwing">{stats.totalUsers}</p>
                 </div>
                 <div className="bg-royalblue/50 p-4 rounded-xl border border-sapphire/30">
                   <p className="text-xs text-shellstone uppercase">Premium Users</p>
                   <p className="text-2xl font-bold text-quicksand">{stats.premiumUsers}</p>
                 </div>
                 <div className="bg-royalblue/50 p-4 rounded-xl border border-sapphire/30">
                   <p className="text-xs text-shellstone uppercase">Active Subscriptions</p>
                   <p className="text-2xl font-bold text-emerald-400">{stats.activeUsers}</p>
                 </div>
                 <div className="bg-royalblue/50 p-4 rounded-xl border border-sapphire/30">
                   <p className="text-xs text-shellstone uppercase">Total Recipes</p>
                   <p className="text-2xl font-bold text-swanwing">{stats.totalRecipes}</p>
                 </div>
               </div>

               {/* Error Message */}
               {error && (
                 <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                   <AlertCircle size={18} />
                   <span>{error}</span>
                   <button onClick={fetchUsers} className="ml-auto text-sm underline">Retry</button>
                 </div>
               )}

               {/* Loading State */}
               {loading && (
                 <div className="flex items-center justify-center py-12">
                   <Loader2 className="animate-spin text-quicksand" size={32} />
                 </div>
               )}

               {/* Users Table */}
               {!loading && !error && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="text-xs text-shellstone uppercase border-b border-sapphire/30">
                             <th className="p-4">User</th>
                             <th className="p-4">Provider</th>
                             <th className="p-4">Role</th>
                             <th className="p-4">Plan</th>
                             <th className="p-4">Joined</th>
                             <th className="p-4">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="text-sm">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-shellstone">
                                {searchTerm ? 'No users found matching your search.' : 'No users found. Users will appear here after they sign up.'}
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map(u => (
                               <tr key={u.id} className="border-b border-sapphire/10 hover:bg-sapphire/5">
                                  <td className="p-4">
                                     <div className="font-bold text-swanwing">{u.full_name || 'No name'}</div>
                                     <div className="text-xs text-shellstone">{u.email}</div>
                                  </td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                                       u.provider === 'google' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 
                                       u.provider === 'apple' ? 'border-gray-500/30 text-gray-300 bg-gray-500/10' : 
                                       'border-quicksand/30 text-quicksand bg-quicksand/10'
                                     }`}>
                                        {u.provider || 'email'}
                                     </span>
                                  </td>
                                  <td className="p-4">
                                     <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                                       u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                                       'bg-sapphire/20 text-shellstone border border-sapphire/30'
                                     }`}>
                                        {u.role || 'user'}
                                     </span>
                                  </td>
                                  <td className="p-4">
                                     <span className={`flex items-center gap-1 ${
                                       u.subscription_plan === 'premium' ? 'text-quicksand' : 'text-shellstone'
                                     }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                          u.subscription_plan === 'premium' ? 'bg-quicksand' : 'bg-shellstone'
                                        }`}></div>
                                        {u.subscription_plan || 'free'}
                                     </span>
                                  </td>
                                  <td className="p-4 text-shellstone">{formatRelativeTime(u.created_at)}</td>
                                  <td className="p-4 flex gap-2">
                                     <button 
                                       onClick={() => handleToggleRole(u.id, u.role)}
                                       className="p-2 bg-sapphire/20 rounded hover:text-quicksand"
                                       title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                                     >
                                       <Edit size={14} />
                                     </button>
                                     <button 
                                       onClick={() => handleDeleteUser(u.id, u.email)}
                                       className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"
                                       title="Delete user"
                                     >
                                       <Trash2 size={14} />
                                     </button>
                                  </td>
                               </tr>
                            ))
                          )}
                       </tbody>
                    </table>
                 </div>
               )}
            </div>
         )}

         {/* APPLICATION MANAGEMENT */}
         {activeModule === 'app' && (
            <div className="space-y-6 animate-fade-in">
               <h3 className="text-xl font-bold text-quicksand mb-4">Application & Tool Management (ATM)</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-royalblue/50 p-6 rounded-xl border border-sapphire/30">
                     <h4 className="font-bold text-swanwing mb-4 flex items-center gap-2"><Power size={18} /> Feature Toggles</h4>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-swanwing">High-Res Image Gen</p>
                              <p className="text-xs text-shellstone">Enable 4K generation (High Cost)</p>
                           </div>
                           <div className="w-10 h-5 bg-quicksand rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-3 h-3 bg-royalblue rounded-full"></div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-sm font-bold text-swanwing">Social Login</p>
                              <p className="text-xs text-shellstone">Allow new registrations</p>
                           </div>
                           <div className="w-10 h-5 bg-quicksand rounded-full relative cursor-pointer">
                              <div className="absolute right-1 top-1 w-3 h-3 bg-royalblue rounded-full"></div>
                           </div>
                        </div>
                        <div className="flex items-center justify-between opacity-50">
                           <div>
                              <p className="text-sm font-bold text-swanwing">Maintenance Mode</p>
                              <p className="text-xs text-shellstone">Disable all user access</p>
                           </div>
                           <div className="w-10 h-5 bg-sapphire/50 rounded-full relative cursor-pointer">
                              <div className="absolute left-1 top-1 w-3 h-3 bg-shellstone rounded-full"></div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-royalblue/50 p-6 rounded-xl border border-sapphire/30">
                     <h4 className="font-bold text-swanwing mb-4 flex items-center gap-2"><Activity size={18} /> System Status</h4>
                     <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                           <span className="text-shellstone">API Status</span>
                           <span className="text-emerald-400 font-bold">Operational</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-shellstone">Total Users</span>
                           <span className="text-swanwing">{stats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-shellstone">Total Recipes</span>
                           <span className="text-swanwing">{stats.totalRecipes}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-shellstone">Premium Users</span>
                           <span className="text-quicksand">{stats.premiumUsers}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-sapphire/30">
                           <button 
                             onClick={() => { fetchUsers(); fetchRecipeCount(); }}
                             className="w-full py-2 bg-sapphire/20 text-shellstone text-xs hover:text-swanwing hover:bg-sapphire/40 rounded transition-all flex items-center justify-center gap-2"
                           >
                             <RefreshCw size={14} /> Refresh Stats
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* AFFILIATE MANAGEMENT */}
         {activeModule === 'affiliate' && (
            <div className="space-y-6 animate-fade-in">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-quicksand">Affiliate Link Management (ALM)</h3>
                  <button className="px-4 py-2 bg-quicksand text-royalblue font-bold rounded-lg text-sm shadow hover:scale-105 transition-transform">
                     + Add Link
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {affiliateLinks.map(link => (
                     <div key={link.id} className="bg-royalblue p-4 rounded-xl border border-sapphire/30 hover:border-quicksand/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] bg-sapphire/20 px-2 py-0.5 rounded text-shellstone border border-sapphire/30">{link.category}</span>
                           <span className="text-xs text-emerald-400 font-bold">{link.ctr} CTR</span>
                        </div>
                        <h4 className="font-bold text-swanwing mb-1 line-clamp-1">{link.name}</h4>
                        <p className="text-xs text-shellstone mb-3">ID: {link.id}</p>
                        <div className="w-full bg-sapphire/20 rounded-full h-1.5 overflow-hidden">
                           <div className="bg-quicksand h-full" style={{ width: `${Math.random() * 100}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-shellstone mt-1">
                           <span>Performance</span>
                           <span>{link.clicks} Clicks</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
