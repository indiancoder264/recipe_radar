
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import initialRecipesData from "@/data/recipes.json";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/auth";

/*
// ────────────────────────────────────────────
//  DATABASE INTEGRATION (COMMENTED OUT)
// ────────────────────────────────────────────
// To connect to a database like Firestore, you would first set up your
// firebase configuration in a file like 'src/lib/firebase.ts'.

// import { db } from "@/lib/firebase"; // Import your initialized DB
// import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, runTransaction } from "firebase/firestore";

// The general pattern is:
// 1. Fetch data from Firestore when the app loads.
// 2. Replace local state updates (setRecipes(...)) with Firestore function calls
//    (e.g., addDoc, updateDoc, deleteDoc).
// 3. Use Firestore's real-time listeners (onSnapshot) for live updates.
*/


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
  // The state is currently initialized with local JSON data.
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  /*
  // DATABASE INTEGRATION: Fetching data on load
  useEffect(() => {
    const fetchRecipes = async () => {
      // 'recipes' should match the name of your collection in Firestore
      const recipesCollectionRef = collection(db, "recipes");
      const recipesSnapshot = await getDocs(recipesCollectionRef);
      const recipesList = recipesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Recipe[];
      setRecipes(recipesList);
    };

    fetchRecipes();
    // For real-time updates, you could use onSnapshot here instead of getDocs.
  }, []);
  */

  const addRecipe = async (data: Omit<Recipe, 'id' | 'rating' | 'ratingCount' | 'tips' | 'favoriteCount'>) => {
    // Current local state logic:
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

    /*
    // DATABASE INTEGRATION: Adding a new document to Firestore
    try {
      const recipesCollectionRef = collection(db, "recipes");
      const newRecipeData = {
        ...data,
        rating: 0,
        ratingCount: 0,
        favoriteCount: 0,
        tips: [],
      };
      await addDoc(recipesCollectionRef, newRecipeData);
      toast({ title: "Recipe Added", description: `${data.name} has been added.` });
      // You would then refetch or rely on a real-time listener to update the UI.
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Could not add recipe.", variant: "destructive" });
    }
    */
  };
  
  const updateRecipe = async (updatedRecipe: Recipe) => {
      // Current local state logic:
      setRecipes((prev) =>
        prev.map((r) => (r.id === updatedRecipe.id ? updatedRecipe : r))
      );
      toast({ title: "Recipe Updated", description: `${updatedRecipe.name} has been updated.` });

      /*
      // DATABASE INTEGRATION: Updating a document in Firestore
      try {
        const recipeDocRef = doc(db, "recipes", updatedRecipe.id);
        const { id, ...recipeData } = updatedRecipe; // Firestore expects data without the id
        await updateDoc(recipeDocRef, recipeData);
        toast({ title: "Recipe Updated", description: `${updatedRecipe.name} has been updated.` });
      } catch (error) {
        console.error("Error updating document: ", error);
        toast({ title: "Error", description: "Could not update recipe.", variant: "destructive" });
      }
      */
  };
  
  const deleteRecipe = async (recipeId: string) => {
    // Current local state logic:
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been successfully deleted.",
      variant: "destructive",
    });

    /*
    // DATABASE INTEGRATION: Deleting a document from Firestore
    try {
      const recipeDocRef = doc(db, "recipes", recipeId);
      await deleteDoc(recipeDocRef);
      toast({ title: "Recipe Deleted", description: "The recipe has been removed.", variant: "destructive" });
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast({ title: "Error", description: "Could not delete recipe.", variant: "destructive" });
    }
    */
  };
  
  const togglePublish = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Current local state logic:
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === recipeId ? { ...r, published: !r.published } : r
      )
    );

    /*
    // DATABASE INTEGRATION: Updating a single field
    try {
      const recipeDocRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeDocRef, {
        published: !recipe.published
      });
    } catch (error) {
      console.error("Error toggling publish status: ", error);
    }
    */
  };

  const addOrUpdateTip = (recipeId: string, tipData: { tip: string; rating: number }, user: User) => {
    const recipeForCheck = recipes.find(r => r.id === recipeId);
    const isUpdate = (recipeForCheck?.tips || []).some(t => t.userId === user.id);

    // Current local state logic:
    setRecipes(prevRecipes => {
        return prevRecipes.map(recipe => {
            if (recipe.id === recipeId) {
                const existingTipIndex = (recipe.tips || []).findIndex(t => t.userId === user.id);
                const now = new Date().toISOString();

                let newTips: Tip[];
                if (existingTipIndex > -1) {
                    newTips = [...(recipe.tips || [])];
                    const existingTip = newTips[existingTipIndex];
                    newTips[existingTipIndex] = { ...existingTip, tip: tipData.tip, rating: tipData.rating, modifiedAt: now };
                } else {
                    const newTip: Tip = { id: `t${Date.now()}`, userId: user.id, userName: user.name, tip: tipData.tip, rating: tipData.rating, createdAt: now, modifiedAt: now };
                    newTips = [...(recipe.tips || []), newTip];
                }

                const totalRating = newTips.reduce((acc, t) => acc + t.rating, 0);
                const newAverageRating = newTips.length > 0 ? totalRating / newTips.length : 0;
                
                return { ...recipe, tips: newTips, rating: newAverageRating, ratingCount: newTips.length };
            }
            return recipe;
        });
    });

    if (isUpdate) {
        toast({ title: "Tip Updated", description: "Your tip has been successfully updated." });
    } else {
        toast({ title: "Success!", description: "Your tip and rating have been submitted." });
    }


    /*
    // DATABASE INTEGRATION: Using a transaction to update tips and average rating
    const updateTipAndRating = async () => {
      const recipeDocRef = doc(db, "recipes", recipeId);
      try {
        await runTransaction(db, async (transaction) => {
          const recipeDoc = await transaction.get(recipeDocRef);
          if (!recipeDoc.exists()) {
            throw "Document does not exist!";
          }

          const currentRecipe = recipeDoc.data() as Recipe;
          const tips = currentRecipe.tips || [];
          const existingTipIndex = tips.findIndex(t => t.userId === user.id);
          const now = new Date().toISOString();
          let newTips: Tip[];

          if (existingTipIndex > -1) {
            newTips = [...tips];
            newTips[existingTipIndex] = { ...newTips[existingTipIndex], tip: tipData.tip, rating: tipData.rating, modifiedAt: now };
          } else {
            const newTip: Tip = { id: `t${Date.now()}`, userId: user.id, userName: user.name, tip: tipData.tip, rating: tipData.rating, createdAt: now, modifiedAt: now };
            newTips = [...tips, newTip];
          }

          const totalRating = newTips.reduce((acc, t) => acc + t.rating, 0);
          const newAverageRating = newTips.length > 0 ? totalRating / newTips.length : 0;
          
          transaction.update(recipeDocRef, { 
            tips: newTips,
            rating: newAverageRating,
            ratingCount: newTips.length
          });
        });
        toast({ title: "Success!", description: "Your tip has been submitted." });
      } catch (error) {
        console.error("Transaction failed: ", error);
        toast({ title: "Error", description: "Could not submit tip.", variant: "destructive" });
      }
    };
    updateTipAndRating();
    */
  };

  const deleteTip = (recipeId: string, tipId: string) => {
    // Current local state logic:
    setRecipes(prev => prev.map(r => {
        if (r.id === recipeId) {
            const newTips = (r.tips || []).filter(t => t.id !== tipId);
            const totalRating = newTips.reduce((acc, t) => acc + t.rating, 0);
            const newAverageRating = newTips.length > 0 ? totalRating / newTips.length : 0;

            return { ...r, tips: newTips, rating: newAverageRating, ratingCount: newTips.length };
        }
        return r;
    }));
    toast({ title: "Tip Deleted", description: "The selected tip has been removed.", variant: "destructive" });

    // DATABASE INTEGRATION would be very similar to the `addOrUpdateTip` transaction logic,
    // but filtering the tip out instead of adding/updating it.
  };

  const updateFavoriteCount = (recipeId: string, delta: 1 | -1) => {
    // Current local state logic:
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const currentCount = r.favoriteCount ?? 0;
          return { ...r, favoriteCount: Math.max(0, currentCount + delta) };
        }
        return r;
      })
    );
    // DATABASE INTEGRATION: This would typically be handled with a transaction or a 
    // Firestore increment operation to avoid race conditions.
    // Example: await updateDoc(doc(db, "recipes", recipeId), { favoriteCount: increment(delta) });
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
