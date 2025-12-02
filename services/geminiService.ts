import { GoogleGenAI, Type } from "@google/genai";
import { CocktailRecipe, ShoppingRecommendation, ShoppingLocation, PartyGameSuggestion, SpicyDiceResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client only if key exists to avoid immediate crash, but handle missing key in functions
const ai = new GoogleGenAI({ apiKey });

// Helper to validate environment
const checkApiKey = () => {
  if (!apiKey) {
    throw new Error("API configuration is missing. Please ensure the API_KEY environment variable is set.");
  }
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
        }
      }
    }
  },
  required: ["name", "description", "ingredients", "instructions", "glassware", "difficulty", "estimatedCostGBP", "recommendedProducts"]
};

export const generateCocktailRecipe = async (inputs: string, preferences: string): Promise<CocktailRecipe> => {
  checkApiKey();
  const model = "gemini-2.5-flash";
  
  const prompt = `Create a unique, London-inspired or classic cocktail recipe based on these ingredients: ${inputs}. 
  User preferences: ${preferences}.
  The cost should be an estimate in GBP for a single serving.
  
  CRITICAL: Also provide 3-4 "recommendedProducts" that would ELEVATE this specific cocktail. 
  - If a tool (like a shaker or strainer) is essential but not mentioned, recommend it.
  - Suggest specific premium glassware (e.g., "Crystal Coupe Glasses").
  - Suggest specialty ingredients or garnishes (e.g., "Luxardo Maraschino Cherries", "Angostura Bitters", "Dehydrated Blood Orange Wheels") that aren't basic staples.
  - Provide a short reason why this product upgrades the experience.
  `;

  try {
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Recipe Generation Error:", error);
    throw new Error("Failed to generate recipe. The bartender might be overwhelmed right now.");
  }
};

export const getShoppingSuggestions = async (item: string, location: string): Promise<ShoppingRecommendation> => {
  checkApiKey();
  const model = "gemini-2.5-flash";
  
  const prompt = `I am in ${location}. Where can I buy ${item}? 
  Provide a helpful summary of where to look locally.
  Also, generate search queries for online delivery services.
  `;

  try {
    // Use Google Maps tool
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const locations: ShoppingLocation[] = [];

    // Extract map data if available
    groundingChunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
          locations.push({
              name: chunk.web.title,
              address: "Web Result",
              mapLink: chunk.web.uri
          });
      }
    });

    const encodedItem = encodeURIComponent(item);
    
    return {
      intro: text,
      locations: locations, 
      onlineLinks: {
        amazonSearch: `https://www.amazon.co.uk/s?k=${encodedItem}`,
        uberEatsSearch: `https://www.ubereats.com/gb/search?q=${encodedItem}`,
        waitroseSearch: `https://www.waitrose.com/ecom/shop/search?&searchTerm=${encodedItem}`
      }
    };
  } catch (error) {
    console.error("Shopping Suggestion Error:", error);
    throw new Error("Could not find shopping suggestions. Please try again later.");
  }
};

export const generatePartyGame = async (players: string, vibe: string, supplies: string): Promise<PartyGameSuggestion> => {
  checkApiKey();
  const model = "gemini-2.5-flash";

  const prompt = `Create a fun, creative drinking game or party game based on the following parameters:
  - Number of Players: ${players}
  - Vibe/Mood: ${vibe}
  - Supplies Available: ${supplies}

  The game should be easy to understand but fun to play. It can be a variation of a classic or something entirely new.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      setup: { type: Type.STRING },
      rules: { type: Type.ARRAY, items: { type: Type.STRING } },
      vibeMatch: { type: Type.STRING, description: "A short sentence explaining why this fits the requested vibe." }
    },
    required: ["title", "description", "setup", "rules", "vibeMatch"]
  };

  try {
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Game Generation Error:", error);
    throw new Error("Unable to create a game right now.");
  }
};

export const generateSpicyDiceRoll = async (intensity: string): Promise<SpicyDiceResult> => {
  checkApiKey();
  const model = "gemini-2.5-flash";

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
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Dice Roll Error:", error);
    throw new Error("The dice are stuck. Try rolling again.");
  }
};

export const generateSpicyIllustration = async (action: string, detail: string): Promise<string> => {
  checkApiKey();
  const model = "gemini-2.5-flash-image";

  const prompt = `Create a cute, minimalist, tasteful line-art cartoon illustration of a couple. 
  Concept: Romantic couple doing ${action} near ${detail}.
  Style: Simple black outline drawing on white background. Abstract, artistic, stick-figure style or simple vector art. 
  NO NUDITY. Keep it playful, heartwarming and romantic. High quality sketch.`;

  try {
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Illustration Error:", error);
    throw new Error("Could not sketch the idea.");
  }
};

// --- Vision Features ---

export const analyzeImageForRecipe = async (base64Image: string): Promise<CocktailRecipe> => {
  checkApiKey();
  const model = "gemini-2.5-flash";

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
    const response = await ai.models.generateContent({
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
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    throw new Error("Could not analyze the photo. Please ensure it's clear and try again.");
  }
};

export const generateCocktailImage = async (recipeName: string, description: string): Promise<string> => {
  checkApiKey();
  const model = "gemini-2.5-flash-image"; 

  const prompt = `A professional, photorealistic 4k close-up photograph of a ${recipeName} cocktail. 
  Description: ${description}. 
  Setting: A dimly lit, sophisticated London speakeasy bar with moody lighting and elegant glassware. 
  The drink looks delicious and refreshing.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    // Extract the image from the response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Cocktail Image Generation Error:", error);
    throw new Error("Could not generate the cocktail visualization.");
  }
};