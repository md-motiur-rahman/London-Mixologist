import React, { useState, useRef } from 'react';
import { analyzeImageForRecipe, generateCocktailImage } from '../services/geminiService';
import { CocktailRecipe, UserProfile } from '../types';
import { Loader2, Camera, RefreshCw, Wand2, Wine, ShoppingCart, ExternalLink, Martini, Sparkles, Citrus, Lock } from 'lucide-react';
import { SubscriptionModal } from './SubscriptionModal';
import { SocialShare } from './SocialShare';

interface CocktailVisionProps {
    user: UserProfile | null;
    onSubscribe: () => void;
}

const SHARE_VARIATIONS = [
  (name: string) => `${name} is inviting you for a drink! 🍸 They'd love to pour you this delicious creation. Reply if you're in!`,
  (name: string) => `You've been invited by ${name}! 👋 They generated this incredible cocktail and are eager to mix one up for you. Let them know what you think!`,
  (name: string) => `Consider this your personal invitation from ${name}. ✨ They're ready to shake up this signature cocktail just for you. RSVP for a glass!`,
  (name: string) => `Cheers! ${name} wants to share this cocktail and buy you a drink! 🥂`,
  (name: string) => `${name} created this custom cocktail and thinks you deserve a taste! They're on stand-by to pour you one. 🧊`
];

export const CocktailVision: React.FC<CocktailVisionProps> = ({ user, onSubscribe }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'idle' | 'analyzing' | 'dreaming' | 'complete'>('idle');
  const [recipe, setRecipe] = useState<CocktailRecipe | null>(null);
  const [generatedVisual, setGeneratedVisual] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [shareText, setShareText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setRecipe(null);
        setGeneratedVisual(null);
        setStage('idle');
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!user || user.subscriptionStatus !== 'active') {
        setShowSubscriptionModal(true);
        return;
    }

    if (!selectedImage) return;

    setLoading(true);
    setStage('analyzing');
    
    try {
      // Step 1: Analyze Ingredients and Create Recipe (Multimodal)
      // Extract base64 data without prefix
      const base64Data = selectedImage.split(',')[1];
      const recipeResult = await analyzeImageForRecipe(base64Data);
      setRecipe(recipeResult);

      // Step 2: Generate Visual of the Result (Image Gen)
      setStage('dreaming');
      const visualBase64 = await generateCocktailImage(recipeResult.name, recipeResult.description);
      setGeneratedVisual(`data:image/png;base64,${visualBase64}`);
      
      setStage('complete');

      // Generate personalized share text
      const userName = user?.name ? user.name.split(' ')[0] : "A friend";
      const randomMsg = SHARE_VARIATIONS[Math.floor(Math.random() * SHARE_VARIATIONS.length)](userName);
      setShareText(randomMsg);

    } catch (error) {
      console.error(error);
      alert('Something went wrong interpreting the spirits. Please try again.');
      setStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'Glassware': return <Martini size={18} />;
      case 'Garnish': return <Citrus size={18} />;
      case 'Tool': return <Wand2 size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full h-full">
      <SubscriptionModal 
         isOpen={showSubscriptionModal} 
         onClose={() => setShowSubscriptionModal(false)}
         onSubscribe={onSubscribe}
      />

      <div className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold serif text-transparent bg-clip-text bg-gradient-to-r from-quicksand to-shellstone">
            Tipsy Vision
          </h2>
          <p className="text-shellstone mt-2 text-sm md:text-base">
            Upload a photo of your bar. AI will dream up a recipe and visualize it.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
             <SocialShare title="Tipsy Vision" text="Check out what AI created from my bar ingredients!" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Input */}
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all h-64 md:h-96 relative overflow-hidden ${selectedImage ? 'border-quicksand bg-royalblue' : 'border-sapphire/50 hover:border-quicksand/50 bg-sapphire/10 hover:bg-sapphire/20 cursor-pointer'}`}
            onClick={!selectedImage ? triggerFileSelect : undefined}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Upload" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            ) : (
              <div className="z-10 text-shellstone">
                <div className="bg-sapphire/30 p-4 rounded-full inline-flex mb-4">
                  <Camera size={32} className="text-quicksand" />
                </div>
                <p className="font-bold text-lg mb-1">Take a Photo</p>
                <p className="text-xs">or upload your ingredients</p>
              </div>
            )}
            
            {/* Hidden Input */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            {selectedImage && !loading && stage !== 'complete' && (
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                    className="bg-sapphire/80 text-white px-4 py-2 rounded-lg text-sm hover:bg-sapphire mr-2"
                  >
                    Change Photo
                  </button>
               </div>
            )}
          </div>

          {!loading && stage !== 'complete' && (
             <button
               onClick={processImage}
               disabled={!selectedImage}
               className="w-full bg-gradient-to-r from-quicksand to-[#d4b475] hover:from-[#d4b475] hover:to-quicksand text-royalblue font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg active:scale-95"
             >
               {user?.subscriptionStatus !== 'active' ? <Lock size={20} /> : <Wand2 size={20} />} Analyze & Create
             </button>
          )}

          {loading && (
            <div className="bg-sapphire/10 border border-sapphire/30 rounded-xl p-6 text-center animate-pulse">
                <Loader2 className="animate-spin mx-auto text-quicksand mb-3" size={32} />
                <p className="text-quicksand font-bold text-lg">
                    {stage === 'analyzing' ? 'Identifying Spirits...' : 'Dreaming up your drink...'}
                </p>
                <p className="text-shellstone text-xs mt-1">This uses AI vision and image generation.</p>
            </div>
          )}
        </div>

        {/* Right Column: Output */}
        <div className="space-y-6">
            {stage === 'complete' && recipe && (
                <div className="animate-fade-in space-y-6">
                    {/* Generated Visual */}
                    {generatedVisual ? (
                        <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-2xl border border-quicksand/50 group">
                            <img src={generatedVisual} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                <span className="text-xs font-bold text-quicksand uppercase tracking-wider bg-black/50 px-2 py-1 rounded border border-quicksand/30">
                                    AI Generated Visualization
                                </span>
                                <SocialShare title={`Tipsy Vision: ${recipe.name}`} text={shareText || `My AI created this amazing ${recipe.name} recipe!`} className="bg-black/50 hover:bg-quicksand text-white" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full aspect-video bg-sapphire/20 rounded-2xl animate-pulse flex items-center justify-center">
                            <span className="text-shellstone">Generating Image...</span>
                        </div>
                    )}

                    {/* Recipe Details */}
                    <div className="bg-sapphire/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-sapphire/30 shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold serif text-swanwing">{recipe.name}</h3>
                                <p className="text-sm text-quicksand font-bold mt-1">{recipe.difficulty} • {recipe.glassware}</p>
                            </div>
                            <div className="text-right hidden md:block">
                                <span className="text-2xl font-serif text-swanwing">£{recipe.estimatedCostGBP?.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <p className="italic text-shellstone mb-6 border-l-2 border-quicksand pl-3 text-sm">
                            {recipe.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-shellstone uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Wine size={14} /> Ingredients
                                </h4>
                                <ul className="space-y-2 text-sm text-swanwing">
                                    {recipe.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="mr-2 text-quicksand">•</span> {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-shellstone uppercase tracking-widest mb-3">Method</h4>
                                <ol className="space-y-2 text-sm text-swanwing list-decimal list-inside marker:text-quicksand">
                                    {recipe.instructions.map((step, i) => (
                                        <li key={i}>{step}</li>
                                    ))}
                                </ol>
                            </div>
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
                                    href={`https://www.amazon.co.uk/s?k=${encodeURIComponent(prod.name)}`}
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
                    
                    <button
                        onClick={() => {
                            setSelectedImage(null);
                            setRecipe(null);
                            setGeneratedVisual(null);
                            setStage('idle');
                        }}
                        className="w-full py-3 border border-sapphire text-shellstone rounded-xl hover:bg-sapphire/20 hover:text-swanwing transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} /> Start Over
                    </button>
                </div>
            )}

            {stage === 'idle' && (
                <div className="hidden lg:flex flex-col items-center justify-center h-96 text-shellstone/30 border-2 border-dashed border-sapphire/20 rounded-2xl">
                    <Wand2 size={48} className="mb-4" />
                    <p className="text-lg">Your creation will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};