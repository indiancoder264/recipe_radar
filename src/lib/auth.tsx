
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/lib/recipes";

export type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  favorites: string[]; // array of recipe IDs
  favoriteCuisines: string[];
  readHistory: string[];
  suspendedUntil?: string;
  country: string;
  dietaryPreference: 'All' | 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
};

type AuthContextType = {
  user: User | null;
  login: (isAdmin?: boolean) => void;
  logout: () => void;
  toggleFavorite: (recipeId: string) => void;
  updateUser: (data: Partial<Pick<User, 'name' | 'email' | 'country' | 'dietaryPreference'>>) => void;
  updateFavoriteCuisines: (cuisines: string[]) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { updateFavoriteCount } = useRecipes();

  const login = (isAdmin = false) => {
    setUser({
      id: isAdmin ? "admin-user-01" : "recipe-lover-01",
      name: isAdmin ? "Admin User" : "RecipeLover",
      email: isAdmin ? "admin@reciperadar.com" : "user@reciperadar.com",
      isAdmin: isAdmin,
      favorites: isAdmin ? ['1'] : ['2', '3'], // Mock favorites
      favoriteCuisines: isAdmin ? ['Italian'] : ['Indian', 'French'], // Mock cuisines
      readHistory: isAdmin ? ['1', '2', '3'] : ['1', '2'],
      country: isAdmin ? "USA" : "USA",
      dietaryPreference: "All",
    });
  };

  const logout = () => {
    setUser(null);
  };

  const toggleFavorite = (recipeId: string) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to favorite recipes.",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = user.favorites.includes(recipeId);
    
    updateFavoriteCount(recipeId, isFavorite ? -1 : 1);

    setUser(currentUser => {
        if (!currentUser) return null;
        const newFavorites = isFavorite
            ? currentUser.favorites.filter(id => id !== recipeId)
            : [...currentUser.favorites, recipeId];
        
        return { ...currentUser, favorites: newFavorites };
    });

    if (!isFavorite) {
        toast({ title: "Added to Favorites!" });
    } else {
        toast({ title: "Removed from Favorites" });
    }
  };

  const updateUser = (data: Partial<Pick<User, 'name' | 'email' | 'country' | 'dietaryPreference'>>) => {
      setUser(currentUser => {
          if (!currentUser) return null;
          return { ...currentUser, ...data };
      });
  };

  const updateFavoriteCuisines = (cuisines: string[]) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return { ...currentUser, favoriteCuisines: cuisines };
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, toggleFavorite, updateUser, updateFavoriteCuisines }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
