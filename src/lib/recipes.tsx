
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import initialRecipesData from "@/data/recipes.json";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/auth";

// ────────────────────────────────────────────
//  Types
// ────────────────────────────────────────────
export type Tip = {
  id: string;
  userId: string;
  userName: string;
  tip: string;
  rating: number;
  createdAt: string;
  modifiedAt: string;
};

export type Recipe = {
  id: string;
  name: string;
  region: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: string;
  image: string;
  rating: number;
  ratingCount: number;
  favoriteCount: number;
  published: boolean;
  ingredients: string[];
  steps: string[];
  tips: Tip[];
  dietaryType: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
};

const initialRecipes: Recipe[] = initialRecipesData as any as Recipe[];

type RecipeContextType = {
  recipes: Recipe[];
  addRecipe: (data: Omit<Recipe, 'id' | 'rating' | 'ratingCount' | 'tips' | 'favoriteCount'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;
  togglePublish: (recipeId: string) => void;
  addOrUpdateTip: (recipeId: string, tipData: { tip: string; rating: number }, user: User) => void;
  deleteTip: (recipeId: string, tipId: string) => void;
  updateFavoriteCount: (recipeId: string, delta: 1 | -1) => void;
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

// ────────────────────────────────────────────
//  Provider
// ────────────────────────────────────────────
export const RecipeProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const addRecipe = (data: Omit<Recipe, 'id' | 'rating' | 'ratingCount' | 'tips' | 'favoriteCount'>) => {
    const newRecipe: Recipe = {
      ...data,
      id: (Math.max(...recipes.map(r => parseInt(r.id, 10)), 0) + 1).toString(),
      rating: 0,
      ratingCount: 0,
      favoriteCount: 0,
      tips: [],
    } as Recipe;
    setRecipes((prev) => [...prev, newRecipe]);
    toast({ title: "Recipe Added", description: `${data.name} has been added.` });
  };
  
  const updateRecipe = (updatedRecipe: Recipe) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
      );
      toast({ title: "Recipe Updated", description: `${updatedRecipe.name} has been updated.` });
  };
  
  const deleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been successfully deleted.",
      variant: "destructive",
    });
  };
  
  const togglePublish = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId ? { ...r, published: !r.published } : r
      )
    );
  };

  const addOrUpdateTip = (recipeId: string, tipData: { tip: string; rating: number }, user: User) => {
    setRecipes(prevRecipes => {
        return prevRecipes.map(recipe => {
            if (recipe.id === recipeId) {
                const existingTipIndex = (recipe.tips || []).findIndex(t => t.userId === user.id);
                const now = new Date().toISOString();

                let newTips: Tip[];
                if (existingTipIndex > -1) {
                    // Update existing tip
                    newTips = [...(recipe.tips || [])];
                    const existingTip = newTips[existingTipIndex];
                    newTips[existingTipIndex] = {
                        ...existingTip,
                        tip: tipData.tip,
                        rating: tipData.rating,
                        modifiedAt: now
                    };
                    toast({ title: "Tip Updated", description: "Your tip has been successfully updated." });
                } else {
                    // Add new tip
                    const newTip: Tip = {
                        id: `t${Date.now()}`,
                        userId: user.id,
                        userName: user.name,
                        tip: tipData.tip,
                        rating: tipData.rating,
                        createdAt: now,
                        modifiedAt: now,
                    };
                    newTips = [...(recipe.tips || []), newTip];
                    toast({ title: "Success!", description: "Your tip and rating have been submitted." });
                }

                // Recalculate average rating
                const totalRating = newTips.reduce((acc, t) => acc + t.rating, 0);
                const newAverageRating = newTips.length > 0 ? totalRating / newTips.length : 0;
                
                return { 
                    ...recipe, 
                    tips: newTips,
                    rating: newAverageRating,
                    ratingCount: newTips.length
                };
            }
            return recipe;
        });
    });
  };

  const deleteTip = (recipeId: string, tipId: string) => {
    setRecipes(prev => prev.map(r => {
        if (r.id === recipeId) {
            const newTips = (r.tips || []).filter(t => t.id !== tipId);
            
            const totalRating = newTips.reduce((acc, t) => acc + t.rating, 0);
            const newAverageRating = newTips.length > 0 ? totalRating / newTips.length : 0;

            return {
                ...r,
                tips: newTips,
                rating: newAverageRating,
                ratingCount: newTips.length
            };
        }
        return r;
    }));
    toast({
        title: "Tip Deleted",
        description: "The selected tip has been removed.",
        variant: "destructive"
    });
  };

  const updateFavoriteCount = (recipeId: string, delta: 1 | -1) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const currentCount = r.favoriteCount ?? 0;
          return { ...r, favoriteCount: Math.max(0, currentCount + delta) };
        }
        return r;
      })
    );
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, togglePublish, addOrUpdateTip, deleteTip, updateFavoriteCount }}>
      {children}
    </RecipeContext.Provider>
  );
};

// ────────────────────────────────────────────
//  Hook
// ────────────────────────────────────────────
export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
};
