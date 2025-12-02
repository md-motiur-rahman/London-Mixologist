import React, { useState, useEffect } from 'react';
import { getShoppingSuggestions } from '../services/geminiService';
import { ShoppingRecommendation } from '../types';
import { Loader2, MapPin, ShoppingCart, ExternalLink, Search, Navigation } from 'lucide-react';
import Markdown from 'react-markdown';
import { SocialShare } from './SocialShare';

export const ShoppingAssistant: React.FC = () => {
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('Central London');
  const [coords, setCoords] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShoppingRecommendation | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
             setCoords({
                 lat: position.coords.latitude,
                 lng: position.coords.longitude
             });
             setLocation("Current Location (Found)");
        },
        (error) => { console.log("Geolocation permission denied or error."); }
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!item.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getShoppingSuggestions(item, location, coords);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full">
      <div className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
           <h2 className="text-3xl md:text-4xl font-bold serif text-swanwing">Stock the Bar</h2>
           <p className="text-shellstone mt-2 text-sm md:text-base">Find premium ingredients near you or online.</p>
        </div>
        <div className="mt-4 md:mt-0">
            <SocialShare title="London Mixologist - Shopping Assistant" text="Found the best places to buy cocktail ingredients in London!" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          {/* Search Column */}
          <div className="lg:col-span-1 bg-sapphire/20 p-4 md:p-6 rounded-xl shadow-lg border border-sapphire/30 sticky top-4">
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-swanwing hidden md:block">Search</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-shellstone" size={18} />
                    <input
                        type="text"
                        placeholder="Item (e.g. Yuzu)"
                        className="w-full bg-royalblue pl-10 pr-4 py-3 rounded-lg text-swanwing border border-sapphire focus:border-quicksand focus:ring-1 focus:ring-quicksand focus:outline-none placeholder-shellstone/50 transition-colors"
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-shellstone" size={18} />
                    <input
                        type="text"
                        placeholder="Location (e.g. Soho)"
                        className="w-full bg-royalblue pl-10 pr-4 py-3 rounded-lg text-swanwing border border-sapphire focus:border-quicksand focus:ring-1 focus:ring-quicksand focus:outline-none placeholder-shellstone/50 transition-colors"
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setCoords(undefined); // Reset coords if user types manually
                        }}
                    />
                    {coords && location.includes("Found") && (
                        <div className="absolute right-3 top-3 text-emerald-400 animate-pulse">
                            <Navigation size={18} fill="currentColor" />
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-quicksand hover:bg-quicksand/90 text-royalblue font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-black/20"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Find Ingredients'}
                </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !loading && (
                <div className="text-center py-12 text-shellstone bg-sapphire/10 rounded-xl border border-sapphire/20 border-dashed">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Search for an ingredient to see purchasing options.</p>
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-fade-in">
                    {/* Quick Affiliate Links */}
                    <div>
                        <h3 className="text-sm font-bold text-shellstone uppercase tracking-widest mb-3">Instant Order</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <a 
                                href={result.onlineLinks.amazonSearch} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex flex-col md:flex-row items-center justify-between p-4 bg-royalblue hover:bg-sapphire/50 border border-sapphire/30 rounded-xl group transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    <div className="bg-swanwing/10 p-2 rounded-lg text-quicksand">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <span className="font-semibold text-swanwing">Amazon</span>
                                </div>
                                <ExternalLink size={16} className="text-shellstone group-hover:text-swanwing transition-colors" />
                            </a>

                            <a 
                                href={result.onlineLinks.uberEatsSearch} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex flex-col md:flex-row items-center justify-between p-4 bg-royalblue hover:bg-sapphire/50 border border-sapphire/30 rounded-xl group transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <span className="font-semibold text-swanwing">Uber Eats</span>
                                </div>
                                <ExternalLink size={16} className="text-emerald-500/70 group-hover:text-emerald-400 transition-colors" />
                            </a>

                            <a 
                                href={result.onlineLinks.waitroseSearch} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex flex-col md:flex-row items-center justify-between p-4 bg-royalblue hover:bg-sapphire/50 border border-sapphire/30 rounded-xl group transition-all"
                            >
                                <div className="flex items-center gap-3 mb-2 md:mb-0">
                                    <div className="bg-lime-500/10 p-2 rounded-lg text-lime-400">
                                        <ShoppingCart size={20} />
                                    </div>
                                    <span className="font-semibold text-swanwing">Waitrose</span>
                                </div>
                                <ExternalLink size={16} className="text-lime-500/70 group-hover:text-lime-400 transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Local Guide */}
                    <div>
                        <h3 className="text-sm font-bold text-shellstone uppercase tracking-widest mb-3">Local Guide (AI)</h3>
                        <div className="bg-sapphire/20 border border-sapphire/30 p-6 rounded-xl text-swanwing text-sm md:text-base leading-relaxed prose prose-invert max-w-none">
                            <Markdown>{result.intro}</Markdown>
                        </div>
                    </div>

                     {/* Map Results List (if any) */}
                     {result.locations.length > 0 && (
                         <div>
                            <h3 className="text-sm font-bold text-shellstone uppercase tracking-widest mb-3">Suggested Places</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.locations.map((loc, i) => (
                                    <a key={i} href={loc.mapLink} target="_blank" rel="noreferrer" className="block p-4 bg-sapphire/20 border border-sapphire/30 rounded-lg hover:bg-sapphire/40 transition-colors">
                                        <div className="font-bold text-swanwing">{loc.name}</div>
                                        <div className="text-xs text-shellstone">{loc.address}</div>
                                    </a>
                                ))}
                            </div>
                         </div>
                     )}
                </div>
            )}
          </div>
      </div>
    </div>
  );
};