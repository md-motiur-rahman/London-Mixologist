import React, { useState, useEffect } from 'react';
import { Wine, Beer, Martini, Plus, Minus, Info, Droplets, Citrus, ShoppingCart, PoundSterling, X, ChevronDown, Check, GlassWater, PartyPopper, Sparkles, ScrollText, SlidersHorizontal, PieChart } from 'lucide-react';
import { SocialShare } from './SocialShare';

type AlcoholCategory = 'Beer' | 'Wine' | 'Spirit' | 'Champagne' | 'No-Alc';

interface AlcoholOption {
  id: string;
  label: string;
  category: AlcoholCategory;
  servingSize: number; // ml
  bottleSize: number; // ml
  servingsPerBottle: number;
}

interface BreakdownItem {
  label: string;
  bottles: number;
  category: AlcoholCategory;
  estimatedBottlePrice: number;
  isToast?: boolean;
}

const ALCOHOL_OPTIONS: AlcoholOption[] = [
  // Beer & Cider
  { id: 'lager', label: 'Lager (e.g. Peroni, Stella)', category: 'Beer', servingSize: 330, bottleSize: 330, servingsPerBottle: 1 },
  { id: 'ipa', label: 'IPA / Craft Beer', category: 'Beer', servingSize: 330, bottleSize: 330, servingsPerBottle: 1 },
  { id: 'cider', label: 'Cider', category: 'Beer', servingSize: 330, bottleSize: 330, servingsPerBottle: 1 },
  { id: 'stout', label: 'Stout / Guinness', category: 'Beer', servingSize: 440, bottleSize: 440, servingsPerBottle: 1 },
  
  // Wine
  { id: 'red_wine', label: 'Red Wine (Cabernet/Merlot)', category: 'Wine', servingSize: 150, bottleSize: 750, servingsPerBottle: 5 },
  { id: 'white_wine', label: 'White Wine (Sauvignon/Pinot)', category: 'Wine', servingSize: 150, bottleSize: 750, servingsPerBottle: 5 },
  { id: 'rose_wine', label: 'Rose Wine', category: 'Wine', servingSize: 150, bottleSize: 750, servingsPerBottle: 5 },
  
  // Champagne / Sparkling
  { id: 'prosecco', label: 'Prosecco', category: 'Champagne', servingSize: 125, bottleSize: 750, servingsPerBottle: 6 },
  { id: 'champagne', label: 'Champagne', category: 'Champagne', servingSize: 125, bottleSize: 750, servingsPerBottle: 6 },

  // Spirits
  { id: 'vodka', label: 'Vodka', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'gin', label: 'Gin', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'whiskey', label: 'Whiskey / Bourbon', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'rum_white', label: 'White Rum', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'rum_dark', label: 'Dark / Spiced Rum', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'tequila', label: 'Tequila', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },
  { id: 'brandy', label: 'Brandy / Cognac', category: 'Spirit', servingSize: 50, bottleSize: 700, servingsPerBottle: 14 },

  // No Alc
  { id: 'mocktail', label: 'Mocktail Ingredients', category: 'No-Alc', servingSize: 200, bottleSize: 1000, servingsPerBottle: 5 },
];

interface EventType {
  id: string;
  label: string;
  weights: Record<string, number>;
}

const EVENT_TYPES: EventType[] = [
  { id: 'house_party', label: 'House Party / Birthday', weights: { Beer: 1.2, Wine: 0.8, Spirit: 1.2, Champagne: 0.5, 'No-Alc': 0.5 } },
  { id: 'wedding', label: 'Wedding Reception', weights: { Beer: 0.8, Wine: 1.5, Spirit: 0.8, Champagne: 1.2, 'No-Alc': 0.3 } },
  { id: 'dinner', label: 'Dinner Party', weights: { Beer: 0.5, Wine: 2.0, Spirit: 0.5, Champagne: 0.8, 'No-Alc': 0.5 } },
  { id: 'cocktail_hour', label: 'Cocktail Hour', weights: { Beer: 0.5, Wine: 0.8, Spirit: 1.5, Champagne: 1.5, 'No-Alc': 0.2 } },
  { id: 'professional', label: 'Professional / Networking', weights: { Beer: 1.0, Wine: 1.2, Spirit: 0.2, Champagne: 0.2, 'No-Alc': 1.0 } },
];

const COCKTAIL_SUGGESTIONS: Record<string, string[]> = {
  'gin': ['Gin & Tonic', 'Tom Collins', 'Negroni', 'Bramble'],
  'vodka': ['Vodka Martini', 'Moscow Mule', 'Cosmopolitan', 'Espresso Martini'],
  'rum_white': ['Mojito', 'Daiquiri', 'Pina Colada'],
  'rum_dark': ['Dark & Stormy', 'Mai Tai', 'Rum Punch'],
  'whiskey': ['Old Fashioned', 'Whiskey Sour', 'Highball'],
  'tequila': ['Margarita', 'Paloma', 'Tequila Sunrise'],
  'prosecco': ['Aperol Spritz', 'Hugo Spritz', 'Bellini'],
  'champagne': ['French 75', 'Kir Royale', 'Mimosa']
};

export const DrinkCalculator: React.FC = () => {
  // Input States
  const [duration, setDuration] = useState(3);
  const [guests, setGuests] = useState({
    light: 2,
    average: 4,
    heavy: 2,
    nonDrinkers: 2
  });
  
  const [selectedAlcohols, setSelectedAlcohols] = useState<string[]>(['lager', 'white_wine', 'gin']);
  const [eventType, setEventType] = useState('house_party');
  const [hasToast, setHasToast] = useState(false);
  
  // Custom Ratio State
  const [showRatios, setShowRatios] = useState(false);
  const [customRatios, setCustomRatios] = useState<Record<string, number>>({});

  // Result States
  const [results, setResults] = useState<{
    totalDrinks: number;
    breakdown: BreakdownItem[];
    mixersLiters: number;
    softDrinksLiters: number;
    iceBags: number;
    garnishesCount: number;
    glassware: { type: string, count: number }[];
    suggestedCocktails: string[];
    estCost: number;
  }>({
    totalDrinks: 0,
    breakdown: [],
    mixersLiters: 0,
    softDrinksLiters: 0,
    iceBags: 0,
    garnishesCount: 0,
    glassware: [],
    suggestedCocktails: [],
    estCost: 0
  });

  const updateGuest = (type: keyof typeof guests, delta: number) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + delta)
    }));
  };

  const handleAddAlcohol = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id && !selectedAlcohols.includes(id)) {
      setSelectedAlcohols([...selectedAlcohols, id]);
    }
    e.target.value = ""; // Reset select
  };

  const removeAlcohol = (id: string) => {
    setSelectedAlcohols(selectedAlcohols.filter(item => item !== id));
  };

  const resetRatios = () => {
      setCustomRatios({});
      setShowRatios(false);
  };

  const getPrice = (cat: string) => {
    switch (cat) {
      case 'Beer': return 1.5;
      case 'Wine': return 8;
      case 'Spirit': return 20;
      case 'Champagne': return 12;
      default: return 5;
    }
  };

  useEffect(() => {
    calculateNeeds();
  }, [guests, duration, selectedAlcohols, eventType, hasToast, customRatios, showRatios]);

  const calculateNeeds = () => {
    const currentEvent = EVENT_TYPES.find(e => e.id === eventType) || EVENT_TYPES[0];

    // 1. Calculate Consumption Demand (Servings)
    const servingsPerHour = (guests.light * 0.5) + (guests.average * 1) + (guests.heavy * 1.5);
    let totalServings = servingsPerHour * duration;

    // Apply generic multiplier based on event intensity
    const avgWeight = (currentEvent.weights.Beer + currentEvent.weights.Wine + currentEvent.weights.Spirit) / 3;
    totalServings *= avgWeight; 
    
    totalServings = Math.ceil(totalServings);

    // Soft Drinks for Non-Drinkers calculation
    const nonDrinkerServings = guests.nonDrinkers * (duration + 1);
    const softDrinksLiters = Math.ceil((nonDrinkerServings * 330) / 1000);

    if (selectedAlcohols.length === 0 && !hasToast) {
        setResults({ ...results, totalDrinks: 0, breakdown: [], softDrinksLiters, estCost: 0, suggestedCocktails: [] });
        return;
    }

    const selectedOptions = selectedAlcohols
      .map(id => ALCOHOL_OPTIONS.find(opt => opt.id === id))
      .filter((opt): opt is AlcoholOption => opt !== undefined);
    
    // 2. Distribute Demand based on Ratios
    let breakdown: BreakdownItem[] = [];
    
    if (showRatios && Object.keys(customRatios).length > 0) {
        // Use Custom Ratios
        breakdown = selectedOptions.map(opt => {
            const categoryPercent = customRatios[opt.category] || 0;
            // Count items in this category to split share
            const itemsInCat = selectedOptions.filter(o => o.category === opt.category).length;
            const share = itemsInCat > 0 ? (categoryPercent / 100) / itemsInCat : 0;
            
            const drinkCount = totalServings * share;
            const bottles = Math.ceil(drinkCount / opt.servingsPerBottle);

            return {
                label: opt.label,
                bottles: bottles,
                category: opt.category,
                estimatedBottlePrice: getPrice(opt.category)
            };
        });

    } else {
        // Use Event Type Weights
        const totalMenuWeight = selectedOptions.reduce((acc: number, opt) => acc + (currentEvent.weights[opt.category] || 1), 0);

        breakdown = selectedOptions.map(opt => {
            const weight = currentEvent.weights[opt.category] || 1;
            const share = totalMenuWeight > 0 ? weight / totalMenuWeight : 0;
            const drinkCount = totalServings * share;
            const bottles = Math.ceil(drinkCount / opt.servingsPerBottle);
            
            return {
                label: opt.label,
                bottles: bottles,
                category: opt.category,
                estimatedBottlePrice: getPrice(opt.category)
            };
        });
    }

    // Handle Toast Logic
    if (hasToast) {
        const totalGuests = guests.light + guests.average + guests.heavy + guests.nonDrinkers;
        const toastBottles = Math.ceil(totalGuests / 6);
        
        const existingChampagne = breakdown.find(b => b.category === 'Champagne');
        
        if (existingChampagne) {
            existingChampagne.bottles += toastBottles;
            existingChampagne.isToast = true;
        } else {
            breakdown.push({
                label: 'Champagne (Toast)',
                bottles: toastBottles,
                category: 'Champagne',
                estimatedBottlePrice: 15,
                isToast: true
            });
        }
    }

    // 3. Suggestions Logic
    let suggestions: string[] = [];
    selectedAlcohols.forEach(id => {
        if (COCKTAIL_SUGGESTIONS[id]) {
            suggestions = [...suggestions, ...COCKTAIL_SUGGESTIONS[id]];
        }
    });
    // Shuffle and slice
    suggestions = [...new Set(suggestions)].sort(() => 0.5 - Math.random()).slice(0, 3);

    // 4. Advanced Extras Calculation
    const spiritBottles = breakdown.filter(b => b.category === 'Spirit').reduce((acc: number, b) => acc + b.bottles, 0);
    const wineBottles = breakdown.filter(b => b.category === 'Wine').reduce((acc: number, b) => acc + b.bottles, 0);
    const champagneBottles = breakdown.filter(b => b.category === 'Champagne').reduce((acc: number, b) => acc + b.bottles, 0);
    const beerBottles = breakdown.filter(b => b.category === 'Beer').reduce((acc: number, b) => acc + b.bottles, 0);
    
    const mixerLiters = Math.ceil(spiritBottles * 3); 
    const totalGuests = guests.light + guests.average + guests.heavy + guests.nonDrinkers;
    const iceBags = Math.ceil((totalGuests * 0.75) / 2); // 2kg bags
    const garnishesCount = Math.ceil(spiritBottles * 4);

    const glassware = [];
    if (wineBottles > 0) glassware.push({ type: 'Wine Glasses', count: Math.ceil((guests.average + guests.heavy + guests.light) * 0.7 * 1.5) });
    if (champagneBottles > 0) glassware.push({ type: 'Flutes', count: Math.ceil(totalGuests * 0.5 * 1.5) });
    if (spiritBottles > 0) glassware.push({ type: 'Tumblers/Highballs', count: Math.ceil((guests.average + guests.heavy) * 1.5) });
    if (beerBottles > 0) glassware.push({ type: 'Pint Glasses', count: Math.ceil((guests.heavy + guests.average) * 0.5 * 1.5) });

    const alcoholCost = breakdown.reduce((acc: number, item) => acc + (item.bottles * item.estimatedBottlePrice), 0);
    const extrasCost = (mixerLiters * 1.5) + (softDrinksLiters * 1.5) + (iceBags * 1.5) + (garnishesCount * 0.3);

    setResults({
        totalDrinks: totalServings,
        breakdown,
        mixersLiters: mixerLiters,
        softDrinksLiters,
        iceBags: iceBags,
        garnishesCount,
        glassware,
        suggestedCocktails: suggestions,
        estCost: Math.ceil(alcoholCost + extrasCost)
    });
  };

  const handleRatioChange = (category: string, value: number) => {
      setCustomRatios(prev => ({
          ...prev,
          [category]: value
      }));
  };

  // Get active categories for sliders
  const activeCategories = Array.from(new Set(selectedAlcohols.map(id => ALCOHOL_OPTIONS.find(o => o.id === id)?.category).filter(Boolean))) as string[];

  // Calculation for ratio total display
  const currentRatioTotal = Object.values(customRatios).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
           <h2 className="text-3xl md:text-5xl font-bold serif text-transparent bg-clip-text bg-gradient-to-r from-quicksand to-shellstone">
             Party Planner
           </h2>
           <p className="text-shellstone mt-2">
             Calculate exactly what you need for your event. No more, no less.
           </p>
        </div>
        <div className="mt-4 md:mt-0">
           <SocialShare title="London Mixologist Party Planner" text="Calculated the perfect shopping list for my party!" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-4 space-y-6">
            
             {/* Event Type & Details */}
             <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                <h3 className="font-bold text-quicksand uppercase text-xs tracking-widest mb-4">Event Details</h3>
                
                <div className="mb-4">
                    <label className="block text-sm text-swanwing font-bold mb-2">Event Type</label>
                    <div className="relative">
                        <select 
                            value={eventType}
                            onChange={(e) => { setEventType(e.target.value); resetRatios(); }}
                            className="w-full bg-royalblue border border-sapphire rounded-xl p-3 pr-10 text-swanwing focus:ring-2 focus:ring-quicksand focus:outline-none appearance-none cursor-pointer"
                        >
                            {EVENT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-shellstone pointer-events-none" size={16} />
                    </div>
                </div>

                <div className="mb-6">
                     <label className="block text-sm text-swanwing font-bold mb-2">Duration: {duration} Hours</label>
                     <input 
                        type="range" 
                        min="1" 
                        max="8" 
                        value={duration} 
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full h-2 bg-sapphire/50 rounded-lg appearance-none cursor-pointer accent-quicksand"
                    />
                </div>

                <div className="flex items-center justify-between bg-royalblue p-3 rounded-xl border border-sapphire/30">
                    <div className="flex items-center gap-3">
                        <div className="bg-quicksand/20 p-2 rounded-lg text-quicksand">
                            <PartyPopper size={18} />
                        </div>
                        <div>
                            <div className="font-bold text-swanwing text-sm">Champagne Toast?</div>
                            <div className="text-[10px] text-shellstone">Adds 1 glass per guest</div>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={hasToast} onChange={(e) => setHasToast(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-sapphire/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-quicksand"></div>
                    </label>
                </div>
            </div>

            {/* Guest Count */}
            <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                <h3 className="font-bold text-quicksand uppercase text-xs tracking-widest mb-4">Guest Breakdown</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-swanwing font-bold">Light Drinkers</div>
                            <div className="text-[10px] text-shellstone">1-2 drinks total</div>
                        </div>
                        <div className="flex items-center gap-3 bg-royalblue rounded-lg p-1 border border-sapphire/30">
                            <button onClick={() => updateGuest('light', -1)} className="p-1 hover:text-quicksand transition-colors"><Minus size={16}/></button>
                            <span className="w-6 text-center font-mono font-bold text-swanwing">{guests.light}</span>
                            <button onClick={() => updateGuest('light', 1)} className="p-1 hover:text-quicksand transition-colors"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-swanwing font-bold">Average</div>
                            <div className="text-[10px] text-shellstone">Approx 1 per hour</div>
                        </div>
                        <div className="flex items-center gap-3 bg-royalblue rounded-lg p-1 border border-sapphire/30">
                            <button onClick={() => updateGuest('average', -1)} className="p-1 hover:text-quicksand transition-colors"><Minus size={16}/></button>
                            <span className="w-6 text-center font-mono font-bold text-swanwing">{guests.average}</span>
                            <button onClick={() => updateGuest('average', 1)} className="p-1 hover:text-quicksand transition-colors"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-swanwing font-bold">Heavy Drinkers</div>
                            <div className="text-[10px] text-shellstone">Top ups all night</div>
                        </div>
                        <div className="flex items-center gap-3 bg-royalblue rounded-lg p-1 border border-sapphire/30">
                            <button onClick={() => updateGuest('heavy', -1)} className="p-1 hover:text-quicksand transition-colors"><Minus size={16}/></button>
                            <span className="w-6 text-center font-mono font-bold text-swanwing">{guests.heavy}</span>
                            <button onClick={() => updateGuest('heavy', 1)} className="p-1 hover:text-quicksand transition-colors"><Plus size={16}/></button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-sapphire/20">
                        <div>
                            <div className="text-emerald-400 font-bold">Non-Drinkers</div>
                            <div className="text-[10px] text-shellstone">Soft drinks only</div>
                        </div>
                        <div className="flex items-center gap-3 bg-royalblue rounded-lg p-1 border border-sapphire/30">
                            <button onClick={() => updateGuest('nonDrinkers', -1)} className="p-1 hover:text-quicksand transition-colors"><Minus size={16}/></button>
                            <span className="w-6 text-center font-mono font-bold text-swanwing">{guests.nonDrinkers}</span>
                            <button onClick={() => updateGuest('nonDrinkers', 1)} className="p-1 hover:text-quicksand transition-colors"><Plus size={16}/></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Selection */}
            <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                <h3 className="font-bold text-quicksand uppercase text-xs tracking-widest mb-4">Build Your Bar</h3>
                
                <div className="relative mb-4">
                    <select 
                        onChange={handleAddAlcohol}
                        className="w-full bg-royalblue border border-sapphire rounded-xl p-3 pr-10 text-swanwing focus:ring-2 focus:ring-quicksand focus:outline-none appearance-none cursor-pointer"
                    >
                        <option value="">+ Add Alcohol Type...</option>
                        <optgroup label="Beer & Cider">
                            {ALCOHOL_OPTIONS.filter(o => o.category === 'Beer').map(o => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Wine">
                            {ALCOHOL_OPTIONS.filter(o => o.category === 'Wine').map(o => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                            ))}
                        </optgroup>
                         <optgroup label="Champagne">
                            {ALCOHOL_OPTIONS.filter(o => o.category === 'Champagne').map(o => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Spirits">
                            {ALCOHOL_OPTIONS.filter(o => o.category === 'Spirit').map(o => (
                                <option key={o.id} value={o.id}>{o.label}</option>
                            ))}
                        </optgroup>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-shellstone pointer-events-none" size={16} />
                </div>

                <div className="flex flex-wrap gap-2">
                    {selectedAlcohols.map(id => {
                        const opt = ALCOHOL_OPTIONS.find(o => o.id === id);
                        if(!opt) return null;
                        return (
                            <div key={id} className="bg-sapphire/30 text-swanwing px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-sapphire/50 animate-fade-in">
                                {opt.label}
                                <button onClick={() => removeAlcohol(id)} className="hover:text-quicksand">
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                    {selectedAlcohols.length === 0 && (
                        <div className="text-sm text-shellstone italic p-2">Select items to start planning...</div>
                    )}
                </div>
            </div>

            {/* Alcohol Ratios (New Feature) */}
            {activeCategories.length > 0 && (
                <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-quicksand uppercase text-xs tracking-widest flex items-center gap-2">
                            <PieChart size={16} /> Alcohol Ratio
                        </h3>
                        <button 
                            onClick={() => setShowRatios(!showRatios)}
                            className="text-xs text-shellstone hover:text-swanwing flex items-center gap-1"
                        >
                            <SlidersHorizontal size={14} />
                            {showRatios ? 'Use Presets' : 'Customize'}
                        </button>
                    </div>

                    {!showRatios ? (
                        <div className="text-sm text-shellstone bg-royalblue p-3 rounded-lg border border-sapphire/20">
                            Using optimal ratios for <strong>{EVENT_TYPES.find(e => e.id === eventType)?.label}</strong>.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeCategories.map(cat => (
                                <div key={cat}>
                                    <div className="flex justify-between text-xs mb-1 text-swanwing font-bold">
                                        <span>{cat}</span>
                                        <span>{customRatios[cat] || 0}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        step="5"
                                        value={customRatios[cat] || 0} 
                                        onChange={(e) => handleRatioChange(cat, parseInt(e.target.value))}
                                        className="w-full h-2 bg-sapphire/50 rounded-lg appearance-none cursor-pointer accent-quicksand"
                                    />
                                </div>
                            ))}
                            <div className="text-[10px] text-right text-shellstone">
                                Total: {currentRatioTotal}%
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Main Stats */}
            <div className="bg-gradient-to-br from-royalblue to-sapphire/20 border border-quicksand/30 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-quicksand/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="relative z-10 mb-8">
                    <h3 className="text-lg font-serif text-swanwing mb-1">Total Estimated Volume</h3>
                    <div className="text-5xl md:text-7xl font-bold text-quicksand mb-2">{results.totalDrinks} <span className="text-xl md:text-3xl text-shellstone/50 font-sans font-normal">alcoholic drinks</span></div>
                    <p className="text-shellstone text-sm max-w-md">Based on a {duration} hour event with {guests.light + guests.average + guests.heavy} drinkers and {guests.nonDrinkers} non-drinkers.</p>
                </div>

                {/* Dynamic Bottle Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                    {results.breakdown.map((item, idx) => (
                        <div key={idx} className={`bg-royalblue/60 backdrop-blur-md p-4 rounded-xl border animate-fade-in ${item.isToast ? 'border-quicksand/50 shadow-quicksand/20 shadow-md' : 'border-sapphire/30'}`}>
                             <div className="text-quicksand mb-1">
                                {item.category === 'Beer' ? <Beer size={20} /> : 
                                 item.category === 'Wine' ? <Wine size={20} /> :
                                 item.category === 'Champagne' ? <PartyPopper size={20} /> :
                                 <Martini size={20} />}
                             </div>
                             <div className="text-2xl font-bold text-swanwing">{item.bottles}</div>
                             <div className="text-xs text-shellstone font-bold leading-tight mt-1">{item.label}</div>
                             <div className="text-[10px] text-shellstone/60 uppercase">
                                {item.category === 'Beer' ? 'Bottles/Cans' : 'Bottles'}
                             </div>
                        </div>
                    ))}

                    <div className="bg-royalblue/60 backdrop-blur-md p-4 rounded-xl border border-sapphire/30">
                        <div className="text-emerald-400 mb-1"><PoundSterling size={24} /></div>
                        <div className="text-2xl font-bold text-swanwing">{results.estCost}</div>
                        <div className="text-xs text-shellstone uppercase font-bold">Est. Total Budget</div>
                    </div>
                </div>
            </div>

            {/* Signature Cocktails (New Feature) */}
            {results.suggestedCocktails.length > 0 && (
                <div className="bg-gradient-to-r from-quicksand/20 to-sapphire/10 border border-quicksand/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ScrollText size={64} />
                    </div>
                    <h3 className="font-bold text-quicksand text-lg mb-4 flex items-center gap-2">
                        <Sparkles size={20} /> Signature Suggestions
                    </h3>
                    <p className="text-sm text-shellstone mb-4">Based on your selected spirits, here are some crowd-pleasers you could serve:</p>
                    <div className="flex flex-wrap gap-3">
                        {results.suggestedCocktails.map((cocktail, idx) => (
                            <span key={idx} className="px-4 py-2 bg-royalblue/80 rounded-full border border-quicksand/40 text-swanwing font-bold text-sm shadow-md flex items-center gap-2">
                                <Martini size={14} className="text-quicksand" /> {cocktail}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Advanced Extras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                     <h3 className="font-bold text-swanwing text-lg mb-4 flex items-center gap-2">
                        <Droplets size={20} className="text-blue-400" /> Mixers & Softs
                     </h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-royalblue rounded-xl border border-sapphire/30">
                            <span className="text-shellstone">Cocktail Mixers</span>
                            <span className="font-bold text-swanwing">{results.mixersLiters} Liters</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-royalblue rounded-xl border border-sapphire/30">
                            <span className="text-shellstone">Soft Drinks (Non-Alc)</span>
                            <span className="font-bold text-swanwing">{results.softDrinksLiters} Liters</span>
                        </div>
                        <div className="p-3 bg-blue-500/10 text-blue-200 text-xs rounded-xl border border-blue-500/20 flex gap-2">
                            <Info size={16} className="shrink-0" />
                            Includes separate volume for non-drinkers and mixers for spirits.
                        </div>
                     </div>
                </div>

                <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                     <h3 className="font-bold text-swanwing text-lg mb-4 flex items-center gap-2">
                        <Citrus size={20} className="text-yellow-400" /> Garnishes & Ice
                     </h3>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-royalblue rounded-xl border border-sapphire/30">
                            <span className="text-shellstone">Ice Bags (2kg)</span>
                            <span className="font-bold text-swanwing">{results.iceBags} Bags</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-royalblue rounded-xl border border-sapphire/30">
                            <span className="text-shellstone">Lemons / Limes</span>
                            <span className="font-bold text-swanwing">{results.garnishesCount} units</span>
                        </div>
                         <div className="p-3 bg-yellow-500/10 text-yellow-200 text-xs rounded-xl border border-yellow-500/20 flex gap-2">
                            <Info size={16} className="shrink-0" />
                            Rule of thumb: 0.75kg ice per person for a full event.
                        </div>
                     </div>
                </div>
            </div>

            {/* Glassware Estimator */}
            {results.glassware.length > 0 && (
                <div className="bg-sapphire/10 border border-sapphire/30 rounded-2xl p-6">
                     <h3 className="font-bold text-swanwing text-lg mb-4 flex items-center gap-2">
                        <GlassWater size={20} className="text-quicksand" /> Recommended Glassware
                     </h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {results.glassware.map((glass, idx) => (
                            <div key={idx} className="bg-royalblue p-3 rounded-xl border border-sapphire/30 text-center">
                                <div className="text-xl font-bold text-swanwing">{glass.count}</div>
                                <div className="text-xs text-shellstone uppercase tracking-wide">{glass.type}</div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            {/* Shopping CTA */}
            <div className="bg-gradient-to-r from-quicksand/10 to-transparent border border-quicksand/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-quicksand text-lg">Ready to stock up?</h3>
                    <p className="text-shellstone text-sm">Find local stores or order delivery based on these amounts.</p>
                </div>
                <button className="px-6 py-3 bg-quicksand text-royalblue font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 whitespace-nowrap">
                    <ShoppingCart size={18} /> Find Stores
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};