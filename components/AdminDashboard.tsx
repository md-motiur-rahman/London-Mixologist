import React, { useState } from 'react';
import { Users, Database, Link, Power, Activity, Search, Trash2, Edit } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'users' | 'app' | 'affiliate'>('users');

  // Mock Data
  const users = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', provider: 'google', status: 'Active', lastLogin: '2 mins ago' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', provider: 'email', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Charlie Day', email: 'charlie@apple.com', provider: 'apple', status: 'Suspended', lastLogin: '1 week ago' },
  ];

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
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-quicksand">Active User Management (AUM)</h3>
                  <div className="relative">
                     <Search className="absolute left-3 top-2.5 text-shellstone" size={16} />
                     <input type="text" placeholder="Search users..." className="bg-royalblue border border-sapphire/50 rounded-lg pl-10 pr-4 py-2 text-sm text-swanwing focus:border-quicksand outline-none" />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="text-xs text-shellstone uppercase border-b border-sapphire/30">
                           <th className="p-4">User</th>
                           <th className="p-4">Provider</th>
                           <th className="p-4">Status</th>
                           <th className="p-4">Last Login</th>
                           <th className="p-4">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {users.map(u => (
                           <tr key={u.id} className="border-b border-sapphire/10 hover:bg-sapphire/5">
                              <td className="p-4">
                                 <div className="font-bold text-swanwing">{u.name}</div>
                                 <div className="text-xs text-shellstone">{u.email}</div>
                              </td>
                              <td className="p-4">
                                 <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${u.provider === 'google' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : u.provider === 'apple' ? 'border-gray-500/30 text-gray-300 bg-gray-500/10' : 'border-quicksand/30 text-quicksand bg-quicksand/10'}`}>
                                    {u.provider}
                                 </span>
                              </td>
                              <td className="p-4">
                                 <span className={`flex items-center gap-1 ${u.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                    {u.status}
                                 </span>
                              </td>
                              <td className="p-4 text-shellstone">{u.lastLogin}</td>
                              <td className="p-4 flex gap-2">
                                 <button className="p-2 bg-sapphire/20 rounded hover:text-quicksand"><Edit size={14} /></button>
                                 <button className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20"><Trash2 size={14} /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
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
                           <span className="text-shellstone">Database Latency</span>
                           <span className="text-swanwing">24ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-shellstone">Active Sessions</span>
                           <span className="text-swanwing">412</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-sapphire/30">
                           <button className="w-full py-2 bg-sapphire/20 text-shellstone text-xs hover:text-swanwing hover:bg-sapphire/40 rounded transition-all">View System Logs</button>
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
