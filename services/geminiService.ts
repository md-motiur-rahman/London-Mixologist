import { GoogleGenAI, Type } from "@google/genai";
import { CocktailRecipe, ShoppingRecommendation, ShoppingLocation, PartyGameSuggestion, SpicyDiceResult } from "../types";

const apiKey = process.env.API_KEY;

// Lazy initialization to avoid issues at module load time
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    if (!apiKey) {
      throw new Error("API_KEY is not configured. Please set your Gemini API key.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
    glassware: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
    estimatedCostGBP: { type: Type.NUMBER },
    recommendedProducts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Ingredient", "Tool", "Garnish", "Glassware"] },
          reason: { type: Type.STRING }
        },
        required: ["name", "category", "reason"]
      }
    }
  },
  required: ["name", "description", "ingredients", "instructions", "glassware", "difficulty", "estimatedCostGBP", "recommendedProducts"]
};

export const generateCocktailRecipe = async (inputs: string, preferences: string): Promise<CocktailRecipe> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";
  
  const prompt = `Create a unique, London-inspired or classic cocktail recipe based on these ingredients: ${inputs}. 
  User preferences: ${preferences}.
  The cost should be an estimate in GBP for a single serving.
  
  CRITICAL: Also provide 3-4 "recommendedProducts" that would ELEVATE this specific cocktail. 
  - If a tool (like a shaker or strainer) is essential but not mentioned, recommend it.
  - Suggest specific premium glassware (e.g., "Crystal Coupe Glasses").
  - Suggest specialty ingredients or garnishes (e.g., "Luxardo Maraschino Cherries", "Angostura Bitters", "Dehydrated Blood Orange Wheels") that aren't basic staples.
  - Provide a short reason why this product upgrades the experience.
  
  Return ONLY valid JSON matching the schema.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as CocktailRecipe;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to generate recipe");
  }
};

export const getShoppingSuggestions = async (item: string, location: string): Promise<ShoppingRecommendation> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";
  
  const prompt = `You are a local shopping expert. I am looking to buy "${item}" and I am located at/near: ${location}.

Please provide a comprehensive shopping guide with the following sections:

## 🏪 Nearby Stores
List specific stores where I can likely find this item. For EACH store, provide:
- **Store Name** (e.g., Tesco Express, Sainsbury's Local, specific off-license names)
- **Approximate Address** or street name if known
- **Distance** estimate from the location (e.g., "~5 min walk", "~0.3 miles")
- **Why this store**: Brief note on why they'd stock this item

Include a mix of:
1. Convenience stores / Corner shops / Off-licenses (for quick access)
2. Supermarkets (Tesco, Sainsbury's, Asda, Morrisons, Lidl, Aldi, Waitrose)
3. Specialty stores if relevant (wine merchants, Asian supermarkets, etc.)

## 🚗 Larger Stores (Worth the Trip)
If there are larger stores slightly further away with better selection, list them with addresses.

## 📱 Online Delivery Options
Suggest specific delivery services that operate in this area:
- Grocery delivery apps (Getir, Gorillas, Zapp if available)
- Supermarket delivery (Tesco, Sainsbury's, Ocado)
- Alcohol-specific apps (if searching for alcohol)

## 🔍 Recommended Search Queries
Provide 3-5 search queries the user can copy/paste into Google to find local options:
- Format each as a quoted search term on its own line

## ⚠️ Tips & Considerations
- Opening hours considerations
- Age verification requirements (if alcohol)
- Price comparison tips
- Any seasonal availability notes

Be specific with store names and locations. Use your knowledge of UK retail chains and their typical locations. If you're not certain about exact addresses, provide the general area or nearest landmark.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text || "";
    const encodedItem = encodeURIComponent(item);
    
    return {
      intro: text,
      locations: [], 
      onlineLinks: {
        amazonSearch: `https://www.amazon.co.uk/s?k=${encodedItem}`,
        uberEatsSearch: `https://www.ubereats.com/gb/search?q=${encodedItem}`,
        waitroseSearch: `https://www.waitrose.com/ecom/shop/search?&searchTerm=${encodedItem}`
      }
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to get shopping suggestions");
  }
};

export const generatePartyGame = async (players: string, vibe: string, supplies: string): Promise<PartyGameSuggestion> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";

  const prompt = `Create a fun, creative drinking game or party game based on the following parameters:
  - Number of Players: ${players}
  - Vibe/Mood: ${vibe}
  - Supplies Available: ${supplies}

  The game should be easy to understand but fun to play. It can be a variation of a classic or something entirely new.
  
  Return ONLY valid JSON.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      setup: { type: Type.STRING },
      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
      vibeMatch: { type: Type.STRING }
    },
    required: ["title", "description", "setup", "rules", "vibeMatch"]
  };

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate game");
    return JSON.parse(text) as PartyGameSuggestion;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to generate game");
  }
};

export const generateSpicyDiceRoll = async (intensity: string): Promise<SpicyDiceResult> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";

  const prompt = `Generate a romantic or spicy "sex dice" result for a couple. 
  Intensity Level: ${intensity}.

  If Intensity is 'Romantic', focus on foreplay, kissing, and massage.
  If Intensity is 'Spicy', introduce adventurous positions or locations.
  If Intensity is 'Wild', suggest Kama Sutra positions or intense challenges.

  Safety: Keep it consensual, fun, and classy (e.g., compatible with app store guidelines, no extreme explicit terminology, use standard position names).

  Return JSON with:
  - action: The main move (e.g., "French Kiss", "Lotus Position", "Massage").
  - detail: The specific location or body part (e.g., "Neck", "Kitchen Counter", "Inner Thighs").
  - instruction: A short playful twist (e.g., "Blindfolded", "For 60 seconds", "Using an ice cube").
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING },
      detail: { type: Type.STRING },
      instruction: { type: Type.STRING }
    },
    required: ["action", "detail", "instruction"]
  };

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("Failed to generate roll");
    return JSON.parse(text) as SpicyDiceResult;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to generate dice roll");
  }
};

export const generateSpicyIllustration = async (action: string, detail: string): Promise<string> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";

  const prompt = `Create a cute, minimalist, tasteful line-art cartoon illustration of a couple. 
  Concept: Romantic couple doing ${action} near ${detail}.
  Style: Simple black outline drawing on white background. Abstract, artistic, stick-figure style or simple vector art. 
  NO NUDITY. Keep it playful, heartwarming and romantic. High quality sketch.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to generate illustration");
  }
};

// --- Vision Features ---

export const analyzeImageForRecipe = async (base64Image: string): Promise<CocktailRecipe> => {
  const genAI = getAI();
  const model = "gemini-2.0-flash";

  const prompt = `Look at this image of bottles and ingredients. 
  1. Identify the alcohol, mixers, and other ingredients present.
  2. Create the BEST possible cocktail recipe using ONLY what you see (plus basic staples like sugar/lemon/ice).
  3. Identify 3-4 missing items (Recommended Products) that would upgrade this drink significantly.
     - Is the user missing a specific garnish?
     - Would a specific type of glass make it better?
     - Is there a specific tool (muddler, strainer) needed?
  4. Return a JSON recipe object.
  `;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("Could not analyze image");
    return JSON.parse(text) as CocktailRecipe;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error?.message || "Failed to analyze image");
  }
};

// Cocktail theme interface for gradient-based visuals (no external images)
export interface CocktailTheme {
  gradient: string;
  accent: string;
  icon: string;
}

// Get cocktail theme based on ingredients - returns CSS gradient classes and emoji
export const getCocktailTheme = (ingredients: string[]): CocktailTheme => {
  const COCKTAIL_THEMES: Record<string, CocktailTheme> = {
    dark: { gradient: 'from-amber-900 via-amber-800 to-stone-900', accent: 'bg-amber-500/20', icon: '🥃' },
    citrus: { gradient: 'from-yellow-500 via-orange-400 to-lime-500', accent: 'bg-yellow-400/20', icon: '🍋' },
    tropical: { gradient: 'from-pink-500 via-orange-400 to-yellow-400', accent: 'bg-pink-400/20', icon: '🍹' },
    berry: { gradient: 'from-purple-600 via-pink-500 to-red-500', accent: 'bg-purple-400/20', icon: '🍇' },
    mint: { gradient: 'from-emerald-500 via-teal-400 to-cyan-400', accent: 'bg-emerald-400/20', icon: '🌿' },
    classic: { gradient: 'from-slate-700 via-slate-600 to-slate-800', accent: 'bg-slate-400/20', icon: '🍸' },
    creamy: { gradient: 'from-amber-200 via-orange-100 to-yellow-100', accent: 'bg-amber-200/30', icon: '🥛' },
    blue: { gradient: 'from-blue-600 via-cyan-500 to-teal-400', accent: 'bg-blue-400/20', icon: '💎' },
    red: { gradient: 'from-red-600 via-rose-500 to-pink-500', accent: 'bg-red-400/20', icon: '🍒' },
    golden: { gradient: 'from-yellow-600 via-amber-500 to-orange-500', accent: 'bg-yellow-500/20', icon: '✨' }
  };

  const ingredientsLower = ingredients.map(i => i.toLowerCase()).join(' ');
  
  if (ingredientsLower.includes('whiskey') || ingredientsLower.includes('bourbon') || 
      ingredientsLower.includes('brandy') || ingredientsLower.includes('cognac') ||
      ingredientsLower.includes('dark rum') || ingredientsLower.includes('cola') ||
      ingredientsLower.includes('coffee') || ingredientsLower.includes('kahlua')) {
    return COCKTAIL_THEMES.dark;
  }
  if (ingredientsLower.includes('blue curacao') || ingredientsLower.includes('blue')) {
    return COCKTAIL_THEMES.blue;
  }
  if (ingredientsLower.includes('cranberry') || ingredientsLower.includes('raspberry') ||
      ingredientsLower.includes('strawberry') || ingredientsLower.includes('grenadine') ||
      ingredientsLower.includes('cherry') || ingredientsLower.includes('campari')) {
    return COCKTAIL_THEMES.red;
  }
  if (ingredientsLower.includes('cream') || ingredientsLower.includes('baileys') ||
      ingredientsLower.includes('milk') || ingredientsLower.includes('coconut cream')) {
    return COCKTAIL_THEMES.creamy;
  }
  if (ingredientsLower.includes('mint') || ingredientsLower.includes('creme de menthe') ||
      ingredientsLower.includes('midori') || ingredientsLower.includes('chartreuse')) {
    return COCKTAIL_THEMES.mint;
  }
  if (ingredientsLower.includes('pineapple') || ingredientsLower.includes('mango') ||
      ingredientsLower.includes('passion') || ingredientsLower.includes('coconut') ||
      ingredientsLower.includes('rum')) {
    return COCKTAIL_THEMES.tropical;
  }
  if (ingredientsLower.includes('lime') || ingredientsLower.includes('lemon') || 
      ingredientsLower.includes('orange') || ingredientsLower.includes('grapefruit') ||
      ingredientsLower.includes('citrus')) {
    return COCKTAIL_THEMES.citrus;
  }
  if (ingredientsLower.includes('champagne') || ingredientsLower.includes('prosecco') ||
      ingredientsLower.includes('sparkling') || ingredientsLower.includes('elderflower')) {
    return COCKTAIL_THEMES.golden;
  }
  if (ingredientsLower.includes('cassis') || ingredientsLower.includes('chambord') ||
      ingredientsLower.includes('sloe')) {
    return COCKTAIL_THEMES.berry;
  }
  
  return COCKTAIL_THEMES.classic;
};

// Legacy function - now returns theme instead of image URL
// Kept for backward compatibility but returns null to signal use of gradient theme
export const generateCocktailImage = async (recipeName: string, description: string, ingredients?: string[]): Promise<string | null> => {
  // Return null to indicate that gradient themes should be used instead of external images
  return null;
};