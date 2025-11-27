import React, { useState } from 'react';
import { ChevronLeft, Dices, Layers, HelpCircle, User, Users, Play, RotateCcw, Sparkles, Wand2, Loader2, Info, Heart, PenTool, ImageIcon } from 'lucide-react';
import { generatePartyGame, generateSpicyDiceRoll, generateSpicyIllustration } from '../services/geminiService';
import { PartyGameSuggestion, SpicyDiceResult } from '../types';
import { SocialShare } from './SocialShare';

// --- GAME DATA ---

type GameType = 'interactive' | 'rulebook' | 'ai';

interface GameInfo {
  id: string;
  title: string;
  description: string;
  players: string;
  type: GameType;
  icon: React.ReactNode;
}

const GAMES_LIST: GameInfo[] = [
  {
    id: 'ai-game-chef',
    title: "AI Game Chef",
    description: "Tell us who's here and what you have. We'll invent a game for you.",
    players: "Any",
    type: 'ai',
    icon: <Sparkles size={32} className="text-quicksand" />
  },
  {
    id: 'cupids-dice',
    title: "Cupid's Dice",
    description: "AI-powered position and challenge generator for couples.",
    players: "2",
    type: 'ai',
    icon: <Heart size={32} className="text-red-400" />
  },
  {
    id: 'kings-cup',
    title: "King's Cup",
    description: "The classic card game. We draw the cards, you follow the rules.",
    players: "3+",
    type: 'interactive',
    icon: <Layers size={32} />
  },
  {
    id: 'never-have-i-ever',
    title: "Never Have I Ever",
    description: "Reveal secrets. If you've done it, take a sip.",
    players: "2+",
    type: 'interactive',
    icon: <User size={32} />
  },
  {
    id: 'most-likely',
    title: "Most Likely To",
    description: "Point at the person matching the description. Majority drinks.",
    players: "3+",
    type: 'interactive',
    icon: <Users size={32} />
  },
  {
    id: 'straight-face',
    title: "Straight Face",
    description: "Read the sentence. If you laugh or smile, you drink.",
    players: "2+",
    type: 'interactive',
    icon: <HelpCircle size={32} />
  },
  {
    id: 'dice-roller',
    title: "Dice Roller",
    description: "Need dice for Three Man or 7-11 Doubles? We got you.",
    players: "1+",
    type: 'interactive',
    icon: <Dices size={32} />
  },
  {
    id: 'rules-thumper',
    title: "Thumper",
    description: "A fast-paced memory and gesture game.",
    players: "4+",
    type: 'rulebook',
    icon: <Users size={32} />
  },
  {
    id: 'rules-flip-cup',
    title: "Flip Cup",
    description: "Team relay race. Drink, flip, repeat.",
    players: "6+",
    type: 'rulebook',
    icon: <Users size={32} />
  },
  {
    id: 'rules-buzz',
    title: "Buzz",
    description: "A counting game where you replace numbers with 'Buzz'.",
    players: "3+",
    type: 'rulebook',
    icon: <Users size={32} />
  },
  {
    id: 'rules-medusa',
    title: "Medusa",
    description: "Don't make eye contact!",
    players: "5+",
    type: 'rulebook',
    icon: <Users size={32} />
  }
];

// --- CONTENT DATABASES ---

const KINGS_CUP_RULES: Record<string, string> = {
  'A': "Waterfall - Everyone drinks until you stop.",
  '2': "You - Pick someone to drink.",
  '3': "Me - You drink.",
  '4': "Floor - Touch the floor. Last one drinks.",
  '5': "Guys - All guys drink.",
  '6': "Chicks - All ladies drink.",
  '7': "Heaven - Point to the sky. Last one drinks.",
  '8': "Mate - Pick a mate. They drink when you drink.",
  '9': "Rhyme - Say a word. Next person rhymes. First to fail drinks.",
  '10': "Categories - Pick a category (e.g., Cars). Go in a circle.",
  'J': "Make a Rule - Create a new rule for the game.",
  'Q': "Question Master - If you ask a question and someone answers, they drink.",
  'K': "King's Cup - Pour some of your drink into the center cup. Last King drinks it all."
};

const CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['♠️', '♥️', '♣️', '♦️'];

const PROMPTS_NEVER = [
  "Never have I ever used someone else's Netflix password.",
  "Never have I ever successfully snuck into a venue.",
  "Never have I ever lied about my age.",
  "Never have I ever texted an ex while drunk.",
  "Never have I ever ghosted someone.",
  "Never have I ever looked through my partner's phone.",
  "Never have I ever kissed a stranger.",
  "Never have I ever slept in my car.",
  "Never have I ever dined and dashed.",
  "Never have I ever had a crush on a friend's parent."
];

const PROMPTS_LIKELY = [
  "Most likely to become a millionaire.",
  "Most likely to get arrested.",
  "Most likely to survive a zombie apocalypse.",
  "Most likely to blackout tonight.",
  "Most likely to join a cult.",
  "Most likely to cry in public.",
  "Most likely to trip over nothing.",
  "Most likely to forget their own birthday.",
  "Most likely to spend all their money on food.",
  "Most likely to marry a stranger in Vegas."
];

const PROMPTS_STRAIGHT_FACE = [
  "I have the heart of a lion and a lifetime ban from the zoo.",
  "My grandfather has the heart of a lion and a lifetime ban from the zoo.",
  "Use the word 'dandelion' in a sentence. 'The cheetah is faster dandelion.'",
  "What do you call a pile of kittens? A meowntain.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "I'm on a seafood diet. I see food and I eat it.",
  "What's brown and sticky? A stick.",
  "Why did the scarecrow win an award? Because he was outstanding in his field."
];

const RULEBOOKS: Record<string, string> = {
  'rules-thumper': "Everyone picks a hand gesture. Everyone starts drumming on the table (thumping). The leader performs their gesture, then someone else's gesture. That person must immediately perform their own gesture, then someone else's. If you hesitate, mess up, or forget, you drink.",
  'rules-flip-cup': "Divide into two teams on opposite sides of a table. Everyone has a cup with a drink. First players drink, place the cup on the edge of the table, and flip it upside down with their finger. Once it lands, the next teammate goes. First team to finish wins.",
  'rules-buzz': "Sit in a circle and count up from 1. Every time a number contains 7 or is a multiple of 7 (e.g., 7, 14, 17, 21), say 'Buzz' instead of the number. Direction reverses on 'Buzz'. Mess up? Drink.",
  'rules-medusa': "Everyone puts their head down on the table. On the count of 3, everyone looks up at another player. If you're looking at someone who isn't looking at you, you're safe. If you make eye contact with someone, shout 'Medusa!' and both drink."
};

// --- SUB-COMPONENTS ---

const KingsCupGame = () => {
  const [currentCard, setCurrentCard] = useState<{val: string, suit: string} | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const drawCard = () => {
    const val = CARDS[Math.floor(Math.random() * CARDS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    setCurrentCard({ val, suit });
    setHistory(prev => [val, ...prev].slice(0, 5));
  };

  const isRed = (suit: string) => suit === '♥️' || suit === '♦️';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
      <div 
        onClick={drawCard}
        className={`w-48 h-72 md:w-64 md:h-96 bg-swanwing rounded-2xl shadow-2xl flex flex-col items-center justify-between p-4 cursor-pointer hover:scale-105 transition-transform border-4 ${currentCard ? 'border-quicksand' : 'border-sapphire'}`}
      >
        {currentCard ? (
          <>
            <div className={`text-4xl self-start ${isRed(currentCard.suit) ? 'text-red-500' : 'text-black'}`}>{currentCard.val}</div>
            <div className={`text-8xl ${isRed(currentCard.suit) ? 'text-red-500' : 'text-black'}`}>{currentCard.suit}</div>
            <div className={`text-4xl self-end ${isRed(currentCard.suit) ? 'text-red-500' : 'text-black'} rotate-180`}>{currentCard.val}</div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-royalblue font-serif font-bold text-2xl">
            Tap to Draw
          </div>
        )}
      </div>

      <div className="max-w-md">
        <h3 className="text-2xl font-bold text-quicksand mb-2">
          {currentCard ? `${currentCard.val} is for...` : "Ready?"}
        </h3>
        <p className="text-xl text-swanwing font-medium min-h-[3rem]">
          {currentCard ? KINGS_CUP_RULES[currentCard.val] : "Tap the card to start the game."}
        </p>
      </div>
    </div>
  );
};

const PromptGame = ({ prompts, title }: { prompts: string[], title: string }) => {
  const [currentPrompt, setCurrentPrompt] = useState<string>("Ready to play?");
  const [index, setIndex] = useState(0);

  const nextPrompt = () => {
    // Simple random selection
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentPrompt(random);
    setIndex(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-fade-in max-w-2xl mx-auto">
      <div className="bg-sapphire/20 p-8 md:p-12 rounded-3xl border border-sapphire/30 w-full shadow-lg min-h-[200px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-quicksand to-transparent opacity-50"></div>
        <p className="text-2xl md:text-4xl font-serif text-swanwing leading-relaxed">
          "{currentPrompt}"
        </p>
      </div>

      <button
        onClick={nextPrompt}
        className="px-12 py-4 bg-quicksand text-royalblue text-xl font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
      >
        {index === 0 ? <Play fill="currentColor" /> : <RotateCcw size={24} />}
        {index === 0 ? "Start Game" : "Next Card"}
      </button>
    </div>
  );
};

const DiceGame = () => {
  const [d1, setD1] = useState(1);
  const [d2, setD2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const roll = () => {
    setIsRolling(true);
    const interval = setInterval(() => {
        setD1(Math.ceil(Math.random() * 6));
        setD2(Math.ceil(Math.random() * 6));
    }, 100);

    setTimeout(() => {
        clearInterval(interval);
        setD1(Math.ceil(Math.random() * 6));
        setD2(Math.ceil(Math.random() * 6));
        setIsRolling(false);
    }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-fade-in">
        <div className="flex gap-8">
            <div className={`w-24 h-24 bg-swanwing rounded-xl flex items-center justify-center shadow-xl border-2 border-sapphire text-royalblue text-5xl font-bold transition-transform ${isRolling ? 'animate-bounce' : ''}`}>
                {d1}
            </div>
            <div className={`w-24 h-24 bg-swanwing rounded-xl flex items-center justify-center shadow-xl border-2 border-sapphire text-royalblue text-5xl font-bold transition-transform ${isRolling ? 'animate-bounce delay-75' : ''}`}>
                {d2}
            </div>
        </div>
        
        <div className="text-quicksand text-2xl font-bold">Total: {isRolling ? '...' : d1 + d2}</div>

        <button
            onClick={roll}
            disabled={isRolling}
            className="px-12 py-4 bg-quicksand text-royalblue text-xl font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
            Roll Dice
        </button>
    </div>
  );
};

const SpicyDiceGame = () => {
  const [intensity, setIntensity] = useState('Romantic');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpicyDiceResult | null>(null);
  const [illustration, setIllustration] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(false);

  const roll = async () => {
    setLoading(true);
    setResult(null);
    setIllustration(null);
    try {
      const data = await generateSpicyDiceRoll(intensity);
      setResult(data);
    } catch (e) {
      console.error(e);
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleVisualize = async () => {
    if (!result) return;
    setLoadingImg(true);
    try {
       const base64Img = await generateSpicyIllustration(result.action, result.detail);
       setIllustration(`data:image/png;base64,${base64Img}`);
    } catch (e) {
       console.error("Failed to generate illustration", e);
       alert("Could not generate illustration. Please try again.");
    } finally {
       setLoadingImg(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center pb-8">
      <div className="space-y-2">
        <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center text-red-400 mb-4 border border-red-900/50 shadow-lg shadow-red-900/10">
          <Heart size={32} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-serif text-swanwing">Cupid's Dice</h2>
        <p className="text-shellstone">AI-powered positions and challenges. Spice up your evening.</p>
      </div>

      <div className="bg-sapphire/10 p-2 rounded-xl border border-sapphire/30 inline-flex gap-1 mb-2">
        {['Romantic', 'Spicy', 'Wild'].map(level => (
          <button
            key={level}
            onClick={() => setIntensity(level)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${intensity === level ? 'bg-red-500/80 text-white shadow-lg' : 'text-shellstone hover:text-swanwing hover:bg-sapphire/20'}`}
          >
            {level}
          </button>
        ))}
      </div>

      <div className="min-h-[250px] perspective-1000">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-[250px] text-red-400">
             <Loader2 size={48} className="animate-spin mb-4" />
             <p className="text-sm font-bold animate-pulse">Rolling the dice...</p>
           </div>
        ) : result ? (
           <div className="w-full space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row gap-6 justify-center">
                 {/* Action Die */}
                 <div className="flex-1 bg-swanwing text-royalblue p-6 rounded-2xl shadow-xl border-b-8 border-r-8 border-sapphire transform hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col justify-center min-h-[160px] relative overflow-hidden group">
                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Dices size={64} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-shellstone mb-3 z-10">Action</span>
                    <span className="text-2xl md:text-3xl font-bold font-serif leading-tight z-10">{result.action}</span>
                 </div>
                 
                 {/* Detail Die */}
                 <div className="flex-1 bg-royalblue text-swanwing p-6 rounded-2xl shadow-xl border-b-8 border-r-8 border-quicksand transform hover:-translate-y-1 hover:shadow-2xl transition-all flex flex-col justify-center min-h-[160px] relative overflow-hidden group">
                     <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Dices size={64} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-quicksand mb-3 z-10">Location / Detail</span>
                    <span className="text-2xl md:text-3xl font-bold font-serif leading-tight z-10">{result.detail}</span>
                 </div>
              </div>

              <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-red-200 text-sm md:text-base italic shadow-inner">
                 <span className="font-bold not-italic mr-2">Twist:</span> {result.instruction}
              </div>

              {/* Visualizer Section */}
              {illustration ? (
                <div className="mt-6 rounded-2xl overflow-hidden border-4 border-white shadow-2xl animate-fade-in bg-white max-w-sm mx-auto">
                    <img src={illustration} alt="Cartoon illustration" className="w-full h-auto object-cover" />
                    <div className="bg-white p-2 text-xs text-gray-400 uppercase tracking-widest font-bold">
                        AI Generated Concept Art
                    </div>
                </div>
              ) : (
                !loadingImg && (
                    <button
                        onClick={handleVisualize}
                        className="text-xs flex items-center gap-2 mx-auto text-quicksand hover:text-swanwing transition-colors border border-quicksand/50 rounded-full px-4 py-2 hover:bg-quicksand/10"
                    >
                        <ImageIcon size={14} /> Visualize Idea (Cartoon)
                    </button>
                )
              )}
              
              {loadingImg && (
                  <div className="bg-sapphire/10 border border-sapphire/30 rounded-xl p-6 text-center animate-pulse max-w-sm mx-auto">
                      <Loader2 className="animate-spin mx-auto text-quicksand mb-3" size={24} />
                      <p className="text-quicksand font-bold text-sm">Sketching idea...</p>
                  </div>
              )}
           </div>
        ) : (
           <div className="text-shellstone/50 italic border-2 border-dashed border-sapphire/30 p-12 rounded-2xl w-full flex flex-col items-center justify-center gap-4">
              <Dices size={48} className="opacity-50" />
              Tap the button to roll the virtual dice.
           </div>
        )}
      </div>

      <button
        onClick={roll}
        disabled={loading || loadingImg}
        className="px-12 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xl font-bold rounded-full shadow-lg hover:shadow-red-500/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
      >
        {result ? 'Reroll Dice' : 'Roll the Dice'}
      </button>
    </div>
  );
};

const AiGameGenerator = () => {
  const [players, setPlayers] = useState(4);
  const [vibe, setVibe] = useState<string>('Fun');
  const [supplies, setSupplies] = useState<string>('Nothing (Just Drinks)');
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<PartyGameSuggestion | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generatePartyGame(`${players}`, vibe, supplies);
      setGame(result);
    } catch (e) {
      console.error(e);
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (game) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-fade-in bg-sapphire/10 p-6 md:p-8 rounded-2xl border border-quicksand/50 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-quicksand to-shellstone"></div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-quicksand text-sm font-bold uppercase tracking-widest">
            <Sparkles size={16} /> AI Game Chef Recommendation
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-swanwing">{game.title}</h2>
          <p className="text-lg text-shellstone italic border-l-4 border-quicksand pl-4">{game.description}</p>
        </div>

        <div className="bg-royalblue/50 p-6 rounded-xl border border-sapphire/30">
          <h3 className="text-quicksand font-bold uppercase text-sm mb-3 flex items-center gap-2"><Info size={16}/> Setup</h3>
          <p className="text-swanwing text-sm md:text-base leading-relaxed">{game.setup}</p>
        </div>

        <div>
          <h3 className="text-quicksand font-bold uppercase text-sm mb-4">How to Play</h3>
          <ul className="space-y-4">
            {game.rules.map((rule, idx) => (
              <li key={idx} className="flex gap-3 text-swanwing text-sm md:text-base">
                 <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sapphire/50 text-quicksand flex items-center justify-center font-bold text-xs border border-sapphire">
                   {idx + 1}
                 </span>
                 <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 text-xs text-shellstone pt-6 border-t border-sapphire/30">
           <span className="font-bold text-quicksand">Why this works:</span> {game.vibeMatch}
        </div>

        <button 
           onClick={() => setGame(null)}
           className="w-full py-3 mt-4 border border-sapphire text-shellstone hover:text-swanwing hover:bg-sapphire/20 rounded-xl transition-all"
        >
          Create Another Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <Wand2 size={48} className="mx-auto text-quicksand mb-4" />
        <h2 className="text-3xl font-serif text-swanwing">Game Chef</h2>
        <p className="text-shellstone">Tell us about your party, and we'll invent the perfect game.</p>
      </div>

      <div className="bg-sapphire/10 p-6 md:p-8 rounded-2xl border border-sapphire/30 space-y-6">
        {/* Players */}
        <div>
           <label className="block text-sm font-medium text-quicksand mb-4 uppercase tracking-wide">
              Players: {players}
           </label>
           <input 
              type="range" 
              min="2" 
              max="20" 
              value={players} 
              onChange={(e) => setPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-sapphire/50 rounded-lg appearance-none cursor-pointer accent-quicksand"
           />
           <div className="flex justify-between text-xs text-shellstone mt-2">
              <span>2</span>
              <span>10</span>
              <span>20+</span>
           </div>
        </div>

        {/* Vibe */}
        <div>
           <label className="block text-sm font-medium text-quicksand mb-3 uppercase tracking-wide">
              Vibe
           </label>
           <div className="flex flex-wrap gap-2">
              {['Chill', 'Wild', 'Icebreaker', 'Teamwork', 'Physical', 'Intellectual'].map(v => (
                 <button
                    key={v}
                    onClick={() => setVibe(v)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${vibe === v ? 'bg-quicksand text-royalblue border-quicksand font-bold' : 'bg-sapphire/20 text-shellstone border-sapphire/30 hover:bg-sapphire/40'}`}
                 >
                    {v}
                 </button>
              ))}
           </div>
        </div>

        {/* Supplies */}
        <div>
           <label className="block text-sm font-medium text-quicksand mb-3 uppercase tracking-wide">
              Supplies Available
           </label>
           <div className="flex flex-wrap gap-2">
              {['Nothing (Just Drinks)', 'Deck of Cards', 'Dice', 'Ping Pong Balls', 'Paper & Pen'].map(s => (
                 <button
                    key={s}
                    onClick={() => setSupplies(s)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all border ${supplies === s ? 'bg-quicksand text-royalblue border-quicksand font-bold' : 'bg-sapphire/20 text-shellstone border-sapphire/30 hover:bg-sapphire/40'}`}
                 >
                    {s}
                 </button>
              ))}
           </div>
        </div>

        <button
           onClick={handleGenerate}
           disabled={loading}
           className="w-full bg-gradient-to-r from-quicksand to-[#d4b475] hover:from-[#d4b475] hover:to-quicksand text-royalblue font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-4 active:scale-95"
        >
           {loading ? <><Loader2 className="animate-spin" /> Consulting the Spirits...</> : <><Sparkles size={20} /> Invent Game</>}
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export const PartyGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const renderActiveGame = () => {
    switch (activeGame) {
      case 'ai-game-chef':
        return <AiGameGenerator />;
      case 'cupids-dice':
        return <SpicyDiceGame />;
      case 'kings-cup':
        return <KingsCupGame />;
      case 'never-have-i-ever':
        return <PromptGame prompts={PROMPTS_NEVER} title="Never Have I Ever" />;
      case 'most-likely':
        return <PromptGame prompts={PROMPTS_LIKELY} title="Most Likely To" />;
      case 'straight-face':
        return <PromptGame prompts={PROMPTS_STRAIGHT_FACE} title="Straight Face" />;
      case 'dice-roller':
        return <DiceGame />;
      default:
        // Text based rulebooks
        if (activeGame && RULEBOOKS[activeGame]) {
            return (
                <div className="max-w-2xl mx-auto bg-sapphire/20 p-8 rounded-2xl border border-sapphire/30 animate-fade-in">
                    <h3 className="text-3xl font-serif text-quicksand mb-6 border-b border-sapphire/30 pb-4">
                        {GAMES_LIST.find(g => g.id === activeGame)?.title}
                    </h3>
                    <p className="text-lg text-swanwing leading-relaxed">
                        {RULEBOOKS[activeGame]}
                    </p>
                </div>
            );
        }
        return null;
    }
  };

  if (activeGame) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col">
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={() => setActiveGame(null)}
            className="flex items-center text-quicksand hover:text-swanwing transition-colors font-bold"
          >
            <ChevronLeft size={20} className="mr-1" /> Back to Games
          </button>
          <SocialShare title="London Mixologist Games" text={`Check out the ${GAMES_LIST.find(g => g.id === activeGame)?.title} game on London Mixologist!`} />
        </div>
        <div className="flex-1 flex flex-col justify-center">
            {renderActiveGame()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold serif text-transparent bg-clip-text bg-gradient-to-r from-quicksand to-shellstone">
            The Social Club
          </h2>
          <p className="text-shellstone mt-2 text-sm md:text-base">
            Icebreakers, classics, and ways to get the party started.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
            <SocialShare title="London Mixologist Social Club" text="The best party games in one app!" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES_LIST.map((game) => (
          <div 
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`bg-sapphire/10 backdrop-blur-sm p-6 rounded-2xl border ${game.type === 'ai' ? 'border-quicksand/30 bg-quicksand/5' : 'border-sapphire/20'} hover:border-quicksand/50 hover:bg-sapphire/20 transition-all cursor-pointer group flex flex-col`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-royalblue p-3 rounded-xl text-quicksand group-hover:scale-110 transition-transform shadow-lg">
                {game.icon}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded border ${game.type === 'interactive' ? 'bg-quicksand/10 text-quicksand border-quicksand/30' : game.type === 'ai' ? 'bg-gradient-to-r from-quicksand to-shellstone text-royalblue border-transparent' : 'bg-shellstone/10 text-shellstone border-shellstone/20'}`}>
                {game.type === 'interactive' ? 'Interactive' : game.type === 'ai' ? 'AI Powered' : 'Rulebook'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-swanwing mb-2 group-hover:text-quicksand transition-colors">{game.title}</h3>
            <p className="text-shellstone text-sm mb-4 flex-1">{game.description}</p>
            
            <div className="pt-4 border-t border-sapphire/20 flex items-center text-xs font-bold text-shellstone uppercase tracking-wider">
               <Users size={14} className="mr-2" /> {game.players} Players
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};