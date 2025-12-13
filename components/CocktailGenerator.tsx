import React, { useState, useRef, useEffect } from 'react';
import { generateCocktailRecipe } from '../services/geminiService';
import { saveRecipeToDatabase } from '../services/supabaseClient';
import { CocktailRecipe, UserProfile } from '../types';
import { Loader2, Sparkles, AlertCircle, Search, Wine, GlassWater, ChevronDown, ChevronUp, X, Check, Martini, Citrus, Wand2, ExternalLink, ShoppingCart, Heart, Lock, Globe } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
import { SocialShare } from './SocialShare';

// --- Data Constants ---

const INGREDIENT_CATEGORIES = {
  Alcohol: {
    'Liquors/Spirits': ['Brandy', 'Gin', 'Rum', 'Tequila', 'Vodka', 'Whiskey'],
    'Liqueurs': ['Amaretto', 'Cherry Liqueur', 'Chocolate Liqueur', 'Coffee Liqueur', 'Coconut Rum', 'Irish Cream', 'Herbal Liqueur', 'Mint Liqueur', 'Melon Liqueur', 'Orange Liqueur', 'Peach Schnapps', 'Raspberry Liqueur', 'Sloe Gin', 'Southern Comfort'],
    'Wine/Other': ['Bitters', 'Champagne', 'Dry Vermouth', 'Sweet Vermouth']
  },
  Mixers: {
    'Carbonated': ['Cola', 'Ginger Ale', 'Ginger Beer', 'Lemon-Lime Soda', 'Soda Water', 'Tonic Water'],
    'Juices': ['Cranberry Juice', 'Grapefruit Juice', 'Lemon Juice', 'Lime Juice', 'Orange Juice', 'Pineapple Juice'],
    'Other': ['Cream', 'Coconut Cream', 'Grenadine', 'Mint Sprig', 'Simple Syrup']
  }
};

const GLOBAL_COCKTAILS: Record<string, string[]> = {
  'Brazil': ['Caipirinha', 'Batida', 'Rabo de Galo'],
  'Cuba': ['Mojito', 'Daiquiri', 'Cuba Libre', 'El Presidente', 'Cancha'],
  'France': ['French 75', 'Sidecar', 'Kir Royale', 'Mimosa', 'Boulevardier', 'French Martini'],
  'Ireland': ['Irish Coffee', 'Baby Guinness'],
  'Italy': ['Negroni', 'Aperol Spritz', 'Bellini', 'Americano', 'Garibaldi', 'Hugo Spritz', 'Sbagliato'],
  'Japan': ['Japanese Slipper', 'Highball', 'Bamboo'],
  'Mexico': ['Margarita', 'Paloma', 'Michelada', 'Tequila Sunrise', 'Carajillo'],
  'Peru/Chile': ['Pisco Sour', 'Chilcano'],
  'Puerto Rico': ['Piña Colada'],
  'Russia': ['White Russian', 'Black Russian', 'Moscow Mule'],
  'Singapore': ['Singapore Sling'],
  'Spain': ['Sangria', 'Agua de Valencia', 'Tinto de Verano', 'Kalimotxo'],
  'United Kingdom': ['Gin & Tonic', 'Bramble', 'Vesper', 'Pimm\'s Cup', 'Espresso Martini', 'Breakfast Martini'],
  'USA': ['Old Fashioned', 'Manhattan', 'Cosmopolitan', 'Sazerac', 'Mint Julep', 'Long Island Iced Tea', 'Mai Tai', 'Whiskey Sour', 'Tom Collins', 'Bloody Mary'],
  'Venezuela': ['Rum Punch']
};

const FLAT_ALCOHOL = Object.values(INGREDIENT_CATEGORIES.Alcohol).flat();
const FLAT_MIXERS = Object.values(INGREDIENT_CATEGORIES.Mixers).flat();

const BRAND_DATA: Record<string, string[]> = {
  'Vodka': ['Absolut', 'Smirnoff', 'Grey Goose', 'Belvedere', 'Cîroc', 'Stolichnaya', 'Tito\'s', 'Ketel One', 'Au Vodka', 'Chase'],
  'Gin': ['Bombay Sapphire', 'Tanqueray', 'Hendrick\'s', 'Beefeater', 'Gordon\'s', 'Sipsmith', 'Roku', 'Monkey 47', 'The Botanist', 'Plymouth'],
  'Rum': ['Bacardi', 'Captain Morgan', 'Havana Club', 'Malibu', 'Kraken', 'Appleton Estate', 'Mount Gay', 'Diplomático', 'Goslings', 'Sailor Jerry'],
  'Whiskey': ['Jack Daniel\'s', 'Jameson', 'Johnnie Walker', 'Maker\'s Mark', 'Jim Beam', 'Bulleit', 'Glenfiddich', 'Macallan', 'Woodford Reserve', 'Talisker'],
  'Tequila': ['Jose Cuervo', 'Patrón', 'Don Julio', '1800', 'Casamigos', 'Olmeca', 'Espolòn', 'Herradura'],
  'Beer': ['Heineken', 'Stella Artois', 'Guinness', 'Corona', 'Budweiser', 'Peroni', 'BrewDog', 'Camden Hells', 'Asahi', 'Kronenbourg'],
  'Liqueurs & Other': ['Baileys', 'Kahlúa', 'Cointreau', 'Disaronno', 'Grand Marnier', 'Jägermeister', 'Aperol', 'Campari', 'Pimm\'s', 'Martini']
};

const MOOD_OPTIONS = [
  'Refreshing', 'Sweet', 'Sour', 'Strong', 'Fruity', 'Spicy', 'Bitter', 'Creamy', 'Tropical', 
  'Sophisticated', 'Cozy', 'Party', 'Elegant', 'Citrusy', 'Smoky', 'Herbal', 'Non-Alcoholic'
];

const SHARE_VARIATIONS = [
  (name: string) => `${name} is inviting you for a drink! 🍸 They'd love to pour you this delicious creation. Reply if you're in!`,
  (name: string) => `You've been invited by ${name}! 👋 They generated this incredible cocktail and are eager to mix one up for you. Let them know what you think!`,
  (name: string) => `Consider this your personal invitation from ${name}. ✨ They're ready to shake up this signature cocktail just for you. RSVP for a glass!`,
  (name: string) => `Cheers! ${name} wants to share this cocktail and buy you a drink! 🥂`,
  (name: string) => `${name} created this custom cocktail and thinks you deserve a taste! They're on stand-by to pour you one. 🧊`
];

// Cocktail color themes based on ingredients
interface CocktailTheme {
  gradient: string;
  accent: string;
  icon: string;
}

const COCKTAIL_THEMES: Record<string, CocktailTheme> = {
  dark: {
    gradient: 'from-amber-900 via-amber-800 to-stone-900',
    accent: 'bg-amber-500/20',
    icon: '🥃'
  },
  citrus: {
    gradient: 'from-yellow-500 via-orange-400 to-lime-500',
    accent: 'bg-yellow-400/20',
    icon: '🍋'
  },
  tropical: {
    gradient: 'from-pink-500 via-orange-400 to-yellow-400',
    accent: 'bg-pink-400/20',
    icon: '🍹'
  },
  berry: {
    gradient: 'from-purple-600 via-pink-500 to-red-500',
    accent: 'bg-purple-400/20',
    icon: '🍇'
  },
  mint: {
    gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    accent: 'bg-emerald-400/20',
    icon: '🌿'
  },
  classic: {
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    accent: 'bg-slate-400/20',
    icon: '🍸'
  },
  creamy: {
    gradient: 'from-amber-200 via-orange-100 to-yellow-100',
    accent: 'bg-amber-200/30',
    icon: '🥛'
  },
  blue: {
    gradient: 'from-blue-600 via-cyan-500 to-teal-400',
    accent: 'bg-blue-400/20',
    icon: '💎'
  },
  red: {
    gradient: 'from-red-600 via-rose-500 to-pink-500',
    accent: 'bg-red-400/20',
    icon: '🍒'
  },
  golden: {
    gradient: 'from-yellow-600 via-amber-500 to-orange-500',
    accent: 'bg-yellow-500/20',
    icon: '✨'
  }
};

// Get cocktail theme based on ingredients
const getCocktailTheme = (ingredients: string[]): CocktailTheme => {
  const ingredientsLower = ingredients.map(i => i.toLowerCase()).join(' ');
  
  // Dark spirits
  if (ingredientsLower.includes('whiskey') || ingredientsLower.includes('bourbon') || 
      ingredientsLower.includes('brandy') || ingredientsLower.includes('cognac') ||
      ingredientsLower.includes('dark rum') || ingredientsLower.includes('cola') ||
      ingredientsLower.includes('coffee') || ingredientsLower.includes('kahlua')) {
    return COCKTAIL_THEMES.dark;
  }
  
  // Blue cocktails
  if (ingredientsLower.includes('blue curacao') || ingredientsLower.includes('blue')) {
    return COCKTAIL_THEMES.blue;
  }
  
  // Berry/Red cocktails
  if (ingredientsLower.includes('cranberry') || ingredientsLower.includes('raspberry') ||
      ingredientsLower.includes('strawberry') || ingredientsLower.includes('grenadine') ||
      ingredientsLower.includes('cherry') || ingredientsLower.includes('campari')) {
    return COCKTAIL_THEMES.red;
  }
  
  // Creamy cocktails
  if (ingredientsLower.includes('cream') || ingredientsLower.includes('baileys') ||
      ingredientsLower.includes('milk') || ingredientsLower.includes('coconut cream')) {
    return COCKTAIL_THEMES.creamy;
  }
  
  // Mint/Green cocktails
  if (ingredientsLower.includes('mint') || ingredientsLower.includes('creme de menthe') ||
      ingredientsLower.includes('midori') || ingredientsLower.includes('chartreuse')) {
    return COCKTAIL_THEMES.mint;
  }
  
  // Tropical cocktails
  if (ingredientsLower.includes('pineapple') || ingredientsLower.includes('mango') ||
      ingredientsLower.includes('passion') || ingredientsLower.includes('coconut') ||
      ingredientsLower.includes('rum')) {
    return COCKTAIL_THEMES.tropical;
  }
  
  // Citrus cocktails
  if (ingredientsLower.includes('lime') || ingredientsLower.includes('lemon') || 
      ingredientsLower.includes('orange') || ingredientsLower.includes('grapefruit') ||
      ingredientsLower.includes('citrus')) {
    return COCKTAIL_THEMES.citrus;
  }
  
  // Golden/Champagne cocktails
  if (ingredientsLower.includes('champagne') || ingredientsLower.includes('prosecco') ||
      ingredientsLower.includes('sparkling') || ingredientsLower.includes('elderflower')) {
    return COCKTAIL_THEMES.golden;
  }
  
  // Berry liqueurs
  if (ingredientsLower.includes('cassis') || ingredientsLower.includes('chambord') ||
      ingredientsLower.includes('sloe')) {
    return COCKTAIL_THEMES.berry;
  }
  
  // Default classic
  return COCKTAIL_THEMES.classic;
};

// --- Helper Components ---

interface MultiSelectProps {
  label: string;
  options: string[] | Record<string, string[]>;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange, placeholder, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== option));
  };

  // Flatten options for searching if grouped
  const filterOptions = () => {
    if (Array.isArray(options)) {
      return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      const filtered: Record<string, string[]> = {};
      Object.entries(options).forEach(([group, items]) => {
        const list = items as string[];
        const matchingItems = list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
        if (matchingItems.length > 0) {
          filtered[group] = matchingItems;
        }
      });
      return filtered;
    }
  };

  const filteredData = filterOptions();

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-quicksand mb-2 uppercase tracking-wide flex items-center gap-2">
        {icon} {label}
      </label>
      
      <div 
        className="w-full bg-royalblue border border-sapphire rounded-lg min-h-[50px] p-2 cursor-pointer focus-within:ring-1 focus-within:ring-quicksand flex flex-wrap gap-2 items-center hover:bg-sapphire/20 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 && (
           <span className="text-shellstone/50 text-sm ml-2">{placeholder || 'Select...'}</span>
        )}
        
        {selected.map(item => (
          <span key={item} className="bg-sapphire text-swanwing text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-sapphire/50 animate-fade-in">
            {item}
            <div 
              role="button"
              onClick={(e) => removeOption(e, item)}
              className="hover:text-quicksand p-0.5 rounded-full"
            >
              <X size={12} />
            </div>
          </span>
        ))}
        
        <div className="ml-auto pr-2 text-shellstone">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-royalblue border border-sapphire rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
          <div className="p-2 sticky top-0 bg-royalblue border-b border-sapphire/30 z-10">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 text-shellstone" size={14} />
                <input 
                    type="text" 
                    className="w-full bg-sapphire/20 border border-sapphire/30 rounded px-8 py-2 text-sm text-swanwing focus:outline-none focus:border-quicksand placeholder-shellstone/50"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                />
            </div>
          </div>
          
          <div className="p-1">
            {Array.isArray(filteredData) ? (
                filteredData.length > 0 ? (
                    filteredData.map(opt => (
                        <div 
                            key={opt}
                            className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-quicksand/20 text-quicksand font-bold' : 'text-shellstone hover:bg-sapphire/30 hover:text-swanwing'}`}
                            onClick={() => toggleOption(opt)}
                        >
                            {opt}
                            {selected.includes(opt) && <Check size={14} />}
                        </div>
                    ))
                ) : <div className="p-2 text-xs text-shellstone text-center">No options found</div>
            ) : (
                Object.keys(filteredData).length > 0 ? (
                    Object.entries(filteredData).map(([group, items]) => (
                        <div key={group}>
                            <div className="px-3 py-1.5 text-xs font-bold text-quicksand/70 bg-sapphire/10 uppercase tracking-wider mt-1 sticky top-0 backdrop-blur-sm">{group}</div>
                            {items.map(opt => (
                                <div 
                                    key={opt}
                                    className={`flex items-center justify-between px-3 py-2 text-sm rounded cursor-pointer transition-colors ${selected.includes(opt) ? 'bg-quicksand/20 text-quicksand font-bold' : 'text-shellstone hover:bg-sapphire/30 hover:text-swanwing'}`}
                                    onClick={() => toggleOption(opt)}
                                >
                                    {opt}
                                    {selected.includes(opt) && <Check size={14} />}
                                </div>
                            ))}
                        </div>
                    ))
                ) : <div className="p-2 text-xs text-shellstone text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

type GeneratorMode = 'ingredients' | 'name';

interface CocktailGeneratorProps {
  onSave?: (recipe: CocktailRecipe) => void;
  user: UserProfile | null;
  onSubscribe: () => void;
}

export const CocktailGenerator: React.FC<CocktailGeneratorProps> = ({ onSave, user, onSubscribe }) => {
  const [mode, setMode] = useState<GeneratorMode>('ingredients');
  
  // State
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState('');
  
  // Lookup State
  const [lookupMethod, setLookupMethod] = useState<'search' | 'browse'>('browse');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [cocktailName, setCocktailName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<CocktailRecipe | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // New state for share text
  const [shareText, setShareText] = useState('');
  
  // State for cocktail theme (gradient-based, no external images)
  const [cocktailTheme, setCocktailTheme] = useState<CocktailTheme | null>(null);

  // Ref for scrolling to recipe on mobile
  const recipeRef = useRef<HTMLDivElement>(null);

  // Derived state for filtered MultiSelects
  const alcoholSelected = selectedIngredients.filter(i => FLAT_ALCOHOL.includes(i));
  const mixersSelected = selectedIngredients.filter(i => FLAT_MIXERS.includes(i));

  const updateAlcohol = (newSelection: string[]) => {
    const others = selectedIngredients.filter(i => !FLAT_ALCOHOL.includes(i));
    setSelectedIngredients([...others, ...newSelection]);
  };

  const updateMixers = (newSelection: string[]) => {
    const others = selectedIngredients.filter(i => !FLAT_MIXERS.includes(i));
    setSelectedIngredients([...others, ...newSelection]);
  };

  const handleGenerate = async () => {
    let inputQuery = '';
    let preferenceQuery = '';
    
    if (mode === 'name') {
      if (!cocktailName.trim()) {
        setError('Please select or enter a cocktail name.');
        return;
      }
      inputQuery = `Cocktail Name: ${cocktailName}`;
    } else {
      const allIngredients = [
        ...selectedIngredients,
        ...selectedBrands,
        ...customIngredients.split(',').map(s => s.trim()).filter(Boolean)
      ];

      if (allIngredients.length === 0) {
        setError('Please select at least one ingredient or brand.');
        return;
      }
      inputQuery = `Ingredients available: ${allIngredients.join(', ')}`;
    }
    
    if (selectedMoods.length > 0) {
        preferenceQuery = `Desired Mood/Style: ${selectedMoods.join(', ')}`;
    }

    setError('');
    setLoading(true);
    setRecipe(null);
    setSaved(false);
    setCocktailTheme(null);
    
    try {
      const result = await generateCocktailRecipe(inputQuery, preferenceQuery);
      setRecipe(result);
      
      // Generate personalized share text
      const userName = user?.name ? user.name.split(' ')[0] : "A friend";
      const randomMsg = SHARE_VARIATIONS[Math.floor(Math.random() * SHARE_VARIATIONS.length)](userName);
      setShareText(randomMsg);

      // Get cocktail theme based on ingredients (gradient-based, no external images)
      const theme = getCocktailTheme(result.ingredients);
      setCocktailTheme(theme);

      // Scroll to recipe on mobile after a short delay to allow render
      setTimeout(() => {
        if (recipeRef.current && window.innerWidth < 1280) { // xl breakpoint
          recipeRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);

    } catch (e) {
      console.error(e);
      setError('Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
        setError('Please log in to save recipes.');
        return;
    }
    if (recipe) {
      // Save to database
      const savedRecipe = await saveRecipeToDatabase(user.id, recipe);
      if (savedRecipe) {
        setSaved(true);
        // Also call the onSave callback if provided (for local state updates)
        if (onSave) {
          onSave(recipe);
        }
      } else {
        setError('Failed to save recipe. Please try again.');
      }
    }
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
    setSelectedBrands([]);
    setSelectedMoods([]);
    setCustomIngredients('');
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Glassware': return <Martini size={18} />;
      case 'Garnish': return <Citrus size={18} />;
      case 'Tool': return <Wand2 size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  // Helper to generate affiliate link
  const getProductLink = (prodName: string) => {
      let baseUrl = `https://www.amazon.co.uk/s?k=${encodeURIComponent(prodName)}`;
      if (user?.isAffiliate && user?.amazonAssociateId) {
          baseUrl += `&tag=${user.amazonAssociateId}`;
      }
      return baseUrl;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <SubscriptionModal 
         isOpen={showSubscriptionModal} 
         onClose={() => setShowSubscriptionModal(false)}
         onSubscribe={onSubscribe}
      />

      <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold serif text-transparent bg-clip-text bg-gradient-to-r from-quicksand to-shellstone">
            The Alchemist
          </h2>
          <p className="text-shellstone mt-2 text-sm md:text-lg">
            {mode === 'ingredients' ? 'Select your inventory or specific brands.' : 'Search for a specific classic or modern recipe.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
             <SocialShare title="The Alchemist - AI Cocktail Maker" text="Check out this AI Cocktail Generator!" />
        </div>
      </div>

      {/* Mode Toggles */}
      <div className="flex justify-center md:justify-start gap-4 mb-8">
        <button
          onClick={() => setMode('ingredients')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            mode === 'ingredients' 
              ? 'bg-quicksand text-royalblue shadow-lg shadow-quicksand/20 scale-105' 
              : 'bg-sapphire/20 text-shellstone hover:text-swanwing border border-sapphire/30'
          }`}
        >
          <Wine size={18} /> My Bar
        </button>
        <button
          onClick={() => setMode('name')}
          className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
            mode === 'name' 
              ? 'bg-quicksand text-royalblue shadow-lg shadow-quicksand/20 scale-105' 
              : 'bg-sapphire/20 text-shellstone hover:text-swanwing border border-sapphire/30'
          }`}
        >
          <Globe size={18} /> Recipe Lookup
        </button>
      </div>

      <div className={`grid grid-cols-1 ${recipe ? 'xl:grid-cols-2' : 'max-w-4xl mx-auto'} gap-8 transition-all duration-500`}>
          {/* Input Section */}
          <div className="space-y-6 bg-sapphire/10 p-6 md:p-8 rounded-2xl border border-sapphire/30 shadow-xl backdrop-blur-sm h-fit">
            
            {mode === 'name' ? (
              <div className="animate-fade-in space-y-6">
                {/* Lookup Toggle */}
                <div className="flex bg-sapphire/20 p-1 rounded-lg border border-sapphire/30">
                  <button 
                    onClick={() => setLookupMethod('search')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${lookupMethod === 'search' ? 'bg-quicksand text-royalblue shadow-md' : 'text-shellstone hover:text-swanwing'}`}
                  >
                    <Search size={14} /> Direct Search
                  </button>
                  <button 
                    onClick={() => setLookupMethod('browse')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${lookupMethod === 'browse' ? 'bg-quicksand text-royalblue shadow-md' : 'text-shellstone hover:text-swanwing'}`}
                  >
                    <Globe size={14} /> Browse by Origin
                  </button>
                </div>

                {lookupMethod === 'search' ? (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-quicksand mb-2 uppercase tracking-wide">
                      Cocktail Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-4 text-shellstone" size={20} />
                      <input
                        type="text"
                        className="w-full bg-royalblue border border-sapphire rounded-xl p-4 pl-12 text-swanwing focus:ring-2 focus:ring-quicksand focus:border-transparent focus:outline-none placeholder-shellstone/50 transition-all text-lg"
                        placeholder="e.g. Pornstar Martini"
                        value={cocktailName}
                        onChange={(e) => setCocktailName(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                     <div>
                       <label className="block text-sm font-medium text-quicksand mb-2 uppercase tracking-wide flex items-center gap-2">
                          <Globe size={16} /> Country / Region
                       </label>
                       <div className="relative">
                         <select 
                           value={selectedCountry}
                           onChange={(e) => {
                             setSelectedCountry(e.target.value);
                             setCocktailName(''); // Reset cocktail selection
                           }}
                           className="w-full bg-royalblue border border-sapphire rounded-xl p-3 pr-10 text-swanwing focus:ring-2 focus:ring-quicksand focus:outline-none appearance-none cursor-pointer"
                         >
                           <option value="">Select a region...</option>
                           {Object.keys(GLOBAL_COCKTAILS).sort().map(country => (
                              <option key={country} value={country}>{country}</option>
                           ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-3.5 text-shellstone pointer-events-none" size={16} />
                       </div>
                     </div>

                     {selectedCountry && (
                        <div className="animate-fade-in">
                          <label className="block text-sm font-medium text-quicksand mb-2 uppercase tracking-wide flex items-center gap-2">
                             <Martini size={16} /> Select Cocktail
                          </label>
                          <div className="relative">
                            <select 
                               value={cocktailName}
                               onChange={(e) => setCocktailName(e.target.value)}
                               className="w-full bg-royalblue border border-sapphire rounded-xl p-3 pr-10 text-swanwing focus:ring-2 focus:ring-quicksand focus:outline-none appearance-none cursor-pointer"
                            >
                              <option value="">Choose a recipe...</option>
                               {GLOBAL_COCKTAILS[selectedCountry].sort().map(cocktail => (
                                  <option key={cocktail} value={cocktail}>{cocktail}</option>
                               ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 text-shellstone pointer-events-none" size={16} />
                          </div>
                        </div>
                     )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Alcohol Selector */}
                <MultiSelect 
                    label="Alcohol & Spirits" 
                    options={INGREDIENT_CATEGORIES.Alcohol} 
                    selected={alcoholSelected} 
                    onChange={updateAlcohol}
                    placeholder="Select Spirits, Liqueurs..."
                    icon={<Wine size={16} />}
                />

                {/* Mixers Selector */}
                <MultiSelect 
                    label="Mixers & Juices" 
                    options={INGREDIENT_CATEGORIES.Mixers} 
                    selected={mixersSelected} 
                    onChange={updateMixers}
                    placeholder="Select Sodas, Juices, Syrups..."
                    icon={<GlassWater size={16} />}
                />
                
                {/* Advanced Brand Selector */}
                <div className="pt-2 border-t border-sapphire/30">
                     <MultiSelect 
                        label="Specific Brands (Optional)" 
                        options={BRAND_DATA} 
                        selected={selectedBrands} 
                        onChange={setSelectedBrands}
                        placeholder="Search brands (e.g. Grey Goose, Bombay Sapphire)"
                        icon={<Sparkles size={16} />}
                     />
                </div>

                {/* Manual Additions */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-quicksand mb-2 uppercase tracking-wide">
                        Any other ingredients?
                    </label>
                    <input
                        type="text"
                        className="w-full bg-royalblue border border-sapphire rounded-lg p-3 text-swanwing focus:ring-1 focus:ring-quicksand focus:outline-none placeholder-shellstone/50 text-sm"
                        placeholder="e.g. Elderflower Cordial, Egg White"
                        value={customIngredients}
                        onChange={(e) => setCustomIngredients(e.target.value)}
                    />
                </div>
              </div>
            )}

            {/* Vibe / Mood (Shared) */}
            <div className="pt-4 border-t border-sapphire/30">
              <MultiSelect 
                 label="Mood & Vibe"
                 options={MOOD_OPTIONS}
                 selected={selectedMoods}
                 onChange={setSelectedMoods}
                 placeholder="Select vibes (e.g. Refreshing, Party)"
              />
            </div>

            {/* Selection Summary */}
            {(selectedIngredients.length > 0 || selectedBrands.length > 0 || selectedMoods.length > 0) && mode === 'ingredients' && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={clearSelection} className="text-xs text-red-300 hover:text-red-200 underline w-full text-right mb-1">Clear all filters</button>
                  </div>
            )}

            {error && (
                <div className="flex items-center gap-2 text-red-300 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-quicksand to-[#d4b475] hover:from-[#d4b475] hover:to-quicksand text-royalblue font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Executing the perfect pour.
                </>
              ) : (
                <>
                  <Sparkles size={20} /> {mode === 'name' ? 'View Recipe' : 'Create My Cocktail'}
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          {recipe && (
            <div ref={recipeRef} className="animate-fade-in flex flex-col h-full xl:sticky xl:top-4 scroll-mt-20">
              <div className="relative h-48 md:h-72 w-full rounded-t-2xl overflow-hidden shadow-2xl border-t border-x border-sapphire/30 group">
                {/* Cocktail Theme Background - Gradient based on ingredients */}
                <div className={`w-full h-full bg-gradient-to-br ${cocktailTheme?.gradient || 'from-sapphire/40 to-royalblue'} relative transition-all duration-500`}>
                  {/* Decorative background elements */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center transform group-hover:scale-110 transition-transform duration-500">
                      <span className="text-7xl md:text-8xl drop-shadow-lg filter">{cocktailTheme?.icon || '🍸'}</span>
                    </div>
                  </div>
                  {/* Animated decorative elements */}
                  <div className={`absolute top-4 right-4 w-24 h-24 ${cocktailTheme?.accent || 'bg-quicksand/10'} rounded-full blur-2xl animate-pulse`}></div>
                  <div className={`absolute bottom-8 left-8 w-32 h-32 ${cocktailTheme?.accent || 'bg-sapphire/20'} rounded-full blur-3xl animate-pulse`} style={{ animationDelay: '1s' }}></div>
                  <div className={`absolute top-1/2 left-1/4 w-16 h-16 ${cocktailTheme?.accent || 'bg-white/5'} rounded-full blur-xl animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-royalblue via-transparent to-transparent"></div>
                
                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  disabled={saved || !user}
                  className={`absolute top-4 right-4 px-4 py-2 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 font-bold text-sm ${saved ? 'bg-quicksand text-royalblue' : !user ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' : 'bg-royalblue/80 backdrop-blur text-quicksand hover:bg-quicksand hover:text-royalblue'}`}
                  title={!user ? 'Log in to save recipes' : saved ? 'Recipe saved!' : 'Save this recipe'}
                >
                  {saved ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}
                  {saved ? 'Saved!' : 'Save Recipe'}
                </button>
                
                <div className="absolute top-4 left-4">
                    <SocialShare title={`Cocktail Recipe: ${recipe.name}`} text={shareText || `Check out this ${recipe.name} recipe on London Mixologist!`} />
                </div>

                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                    <h3 className="text-3xl md:text-5xl font-bold serif text-swanwing drop-shadow-lg">{recipe.name}</h3>
                    <div className="flex gap-2 mt-3">
                        <span className="text-xs font-bold bg-quicksand text-royalblue px-3 py-1 rounded-full shadow-lg">
                            {recipe.difficulty}
                        </span>
                        <span className="text-xs font-bold bg-sapphire/80 backdrop-blur-md text-swanwing px-3 py-1 rounded-full shadow-lg border border-sapphire">
                            {recipe.glassware}
                        </span>
                    </div>
                </div>
              </div>

              <div className="bg-sapphire/10 rounded-b-2xl p-6 md:p-8 border-x border-b border-sapphire/30 shadow-xl flex-1 backdrop-blur-sm">
                <p className="italic text-shellstone text-sm md:text-lg mb-8 border-l-4 border-quicksand pl-4 leading-relaxed">
                  "{recipe.description}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="text-quicksand font-bold uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                            <Wine size={16} /> Ingredients
                        </h4>
                        <ul className="text-sm md:text-base text-swanwing space-y-3">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start bg-royalblue/50 p-2 rounded border border-sapphire/20">
                                <span className="mr-2 text-quicksand">•</span> {ing}
                            </li>
                        ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-quicksand font-bold uppercase text-xs tracking-widest mb-4">Est. Cost</h4>
                        <div className="text-3xl font-serif text-swanwing">
                           £{recipe.estimatedCostGBP?.toFixed(2)}
                        </div>
                        <p className="text-xs text-shellstone mt-1">per serving (approx)</p>
                    </div>
                </div>

                <div className="bg-royalblue/60 rounded-xl p-6 border border-sapphire/30">
                  <h4 className="text-quicksand font-bold uppercase text-xs tracking-widest mb-4">Method</h4>
                  <ol className="text-sm md:text-base text-swanwing space-y-4 list-decimal list-inside marker:text-quicksand marker:font-bold">
                    {recipe.instructions.map((step, i) => (
                      <li key={i} className="leading-relaxed pl-2">{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Recommendation Engine / Affiliate Links */}
                {recipe.recommendedProducts && recipe.recommendedProducts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-sapphire/30">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="text-quicksand" size={16} />
                        <h4 className="text-sm font-bold text-quicksand uppercase tracking-widest">Enhance Your Experience</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recipe.recommendedProducts.map((prod, idx) => (
                          <a 
                            key={idx}
                            href={getProductLink(prod.name)}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-4 bg-royalblue/50 border border-sapphire/30 rounded-xl hover:border-quicksand/50 hover:bg-sapphire/20 transition-all group relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-quicksand bg-quicksand/10 p-1.5 rounded-lg">
                                  {getIconForCategory(prod.category)}
                                </div>
                                <ExternalLink size={14} className="text-shellstone group-hover:text-swanwing" />
                            </div>
                            <h5 className="font-bold text-swanwing text-sm mb-1">{prod.name}</h5>
                            <p className="text-xs text-shellstone mb-3 leading-snug min-h-[2.5em]">{prod.reason}</p>
                            <div className="flex items-center gap-1 text-xs font-bold text-quicksand group-hover:underline">
                              <ShoppingCart size={12} /> Buy on Amazon
                            </div>
                          </a>
                        ))}
                      </div>
                  </div>
                )}

              </div>
            </div>
          )}
      </div>
    </div>
  );
};