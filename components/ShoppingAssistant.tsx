import React, { useState } from 'react';
import { getShoppingSuggestions } from '../services/geminiService';
import { ShoppingRecommendation } from '../types';
import { Loader2, MapPin, ShoppingCart, ExternalLink, Search, AlertCircle, Navigation, MapPinned } from 'lucide-react';
import Markdown from 'react-markdown';
import { SocialShare } from './SocialShare';

export const ShoppingAssistant: React.FC = () => {
  const [item, setItem] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShoppingRecommendation | null>(null);
  const [error, setError] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Use reverse geocoding with maximum zoom level for exact address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'LondonMixologist/1.0'
              }
            }
          );
          const data = await response.json();
          
          // Extract exact location - prioritize street-level details
          const address = data.address;
          let locationParts: string[] = [];
          
          if (address) {
            // Build exact address from most specific to broader
            // Street/Road level
            if (address.road || address.street) {
              locationParts.push(address.road || address.street);
            }
            
            // Area/Neighborhood level - pick the most specific one
            const areaName = address.neighbourhood || 
                           address.suburb || 
                           address.village ||
                           address.town ||
                           address.city_district ||
                           address.borough;
            
            if (areaName && !locationParts.includes(areaName)) {
              locationParts.push(areaName);
            }
            
            // City level (if different from area)
            const cityName = address.city || address.town;
            if (cityName && !locationParts.includes(cityName) && cityName !== areaName) {
              locationParts.push(cityName);
            }
            
            // Add country for non-UK locations
            if (address.country && address.country !== 'United Kingdom') {
              locationParts.push(address.country);
            }
          }
          
          // Join parts or use display_name as fallback
          let locationName = locationParts.length > 0 
            ? locationParts.join(', ')
            : data.display_name?.split(',').slice(0, 3).join(',') || 'Your Current Location';
          
          setLocation(locationName);
        } catch (err) {
          console.error('Reverse geocoding failed:', err);
          setLocationError('Could not determine your location name');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.log("Geolocation error:", error.message);
        setLocationLoading(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access denied. Please enable location in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again.');
            break;
          default:
            setLocationError('Could not get your location. Please enter manually.');
        }
      },
      {
        enableHighAccuracy: true, // Use GPS for more accurate location
        timeout: 15000, // Allow more time for GPS
        maximumAge: 0 // Always get fresh location
      }
    );
  };

  const handleSearch = async () => {
    if (!item.trim()) {
      setError('Please enter an item to search for.');
      return;
    }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const data = await getShoppingSuggestions(item, location);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to get shopping suggestions. Please try again.');
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
                <div className="space-y-2">
                    <div className="relative">
                        {locationLoading ? (
                          <Loader2 className="absolute left-3 top-3 text-quicksand animate-spin" size={18} />
                        ) : (
                          <MapPin className="absolute left-3 top-3 text-shellstone" size={18} />
                        )}
                        <input
                            type="text"
                            placeholder={locationLoading ? "Detecting location..." : "Location (e.g. Barking, New York, Tokyo)"}
                            className="w-full bg-royalblue pl-10 pr-4 py-3 rounded-lg text-swanwing border border-sapphire focus:border-quicksand focus:ring-1 focus:ring-quicksand focus:outline-none placeholder-shellstone/50 transition-colors"
                            value={location}
                            onChange={(e) => { setLocation(e.target.value); setLocationError(''); }}
                            disabled={locationLoading}
                        />
                    </div>
                    
                    <button
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium text-quicksand bg-sapphire/30 hover:bg-sapphire/50 border border-sapphire/50 rounded-lg transition-all disabled:opacity-50"
                    >
                        {locationLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={16} />
                            Detecting your location...
                          </>
                        ) : (
                          <>
                            <Navigation size={16} />
                            Use My Current Location
                          </>
                        )}
                    </button>
                    
                    {locationError && (
                      <div className="flex items-start gap-2 text-amber-300 text-xs bg-amber-900/20 p-2 rounded-lg border border-amber-900/50">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{locationError}</span>
                      </div>
                    )}
                    
                    <p className="text-xs text-shellstone/70">
                      Or type any location worldwide
                    </p>
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-quicksand hover:bg-quicksand/90 text-royalblue font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2 shadow-lg shadow-black/20"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Find Ingredients'}
                </button>

                {error && (
                  <div className="flex items-center gap-2 text-red-300 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50 mt-3">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !loading && !error && (
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
                        <div className="bg-sapphire/20 border border-sapphire/30 rounded-xl overflow-hidden">
                            <div className="bg-sapphire/30 px-4 py-3 border-b border-sapphire/30 flex items-center gap-2">
                                <MapPin size={16} className="text-quicksand" />
                                <span className="text-sm font-bold text-swanwing">Shopping Guide for {location || 'Your Area'}</span>
                            </div>
                            <div className="p-4 md:p-6 text-swanwing text-sm md:text-base leading-relaxed prose prose-invert max-w-none
                                prose-headings:text-quicksand prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
                                prose-h1:text-xl prose-h1:border-b prose-h1:border-sapphire/30 prose-h1:pb-2
                                prose-h2:text-lg prose-h2:text-quicksand
                                prose-h3:text-base prose-h3:text-quicksand/90
                                prose-p:text-shellstone prose-p:my-2 prose-p:leading-relaxed
                                prose-strong:text-swanwing prose-strong:font-semibold
                                prose-ul:my-2 prose-ul:space-y-1
                                prose-ol:my-2 prose-ol:space-y-1
                                prose-li:text-shellstone prose-li:pl-1
                                prose-li:marker:text-quicksand
                                prose-a:text-quicksand prose-a:underline prose-a:decoration-dotted hover:prose-a:text-swanwing
                                prose-blockquote:border-l-2 prose-blockquote:border-quicksand prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-shellstone/80
                                prose-code:bg-royalblue prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-quicksand prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
                                [&>*:first-child]:mt-0
                            ">
                                <Markdown
                                    components={{
                                        h1: ({children}) => (
                                            <h1 className="flex items-center gap-2 text-xl font-bold text-quicksand border-b border-sapphire/30 pb-2 mt-4 mb-3">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({children}) => (
                                            <h2 className="flex items-center gap-2 text-lg font-bold text-quicksand mt-5 mb-2">
                                                <span className="w-1.5 h-1.5 bg-quicksand rounded-full"></span>
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({children}) => (
                                            <h3 className="text-base font-semibold text-quicksand/90 mt-4 mb-2">
                                                {children}
                                            </h3>
                                        ),
                                        p: ({children}) => (
                                            <p className="text-shellstone my-2 leading-relaxed">
                                                {children}
                                            </p>
                                        ),
                                        strong: ({children}) => (
                                            <strong className="text-swanwing font-semibold">
                                                {children}
                                            </strong>
                                        ),
                                        ul: ({children}) => (
                                            <ul className="my-3 space-y-2 list-none pl-0">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({children}) => (
                                            <ol className="my-3 space-y-2 list-decimal list-inside marker:text-quicksand marker:font-bold">
                                                {children}
                                            </ol>
                                        ),
                                        li: ({children}) => (
                                            <li className="flex items-start gap-2 text-shellstone bg-royalblue/40 px-3 py-2 rounded-lg border border-sapphire/20">
                                                <span className="text-quicksand mt-1">•</span>
                                                <span className="flex-1">{children}</span>
                                            </li>
                                        ),
                                        blockquote: ({children}) => (
                                            <blockquote className="border-l-3 border-quicksand pl-4 py-2 my-3 bg-quicksand/5 rounded-r-lg italic text-shellstone/80">
                                                {children}
                                            </blockquote>
                                        ),
                                        code: ({children}) => (
                                            <code className="bg-royalblue px-2 py-1 rounded text-quicksand text-sm font-mono">
                                                {children}
                                            </code>
                                        ),
                                        a: ({href, children}) => (
                                            <a href={href} target="_blank" rel="noreferrer" className="text-quicksand underline decoration-dotted hover:text-swanwing transition-colors">
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {result.intro}
                                </Markdown>
                            </div>
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