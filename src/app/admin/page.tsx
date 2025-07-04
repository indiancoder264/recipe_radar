
"use client";

import { useAuth } from "@/lib/auth";
import { useRecipes, type Recipe } from "@/lib/recipes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Analytics } from "@/components/admin/analytics";
import { RecipeTable } from "@/components/admin/recipe-table";
import { TipsTable } from "@/components/admin/tips-table";
import { UserManagement } from "@/components/admin/user-management";
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { RecipeForm } from "@/components/admin/recipe-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { recipes, addRecipe, updateRecipe, deleteRecipe, togglePublish, deleteTip } = useRecipes();

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);

  React.useEffect(() => {
    if (user === null || !user.isAdmin) {
      router.push("/login");
    }
  }, [user, router]);

  const handleAddRecipe = () => {
    setSelectedRecipe(null);
    setIsFormOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsFormOpen(true);
  };

  const handleSaveRecipe = (data: Omit<Recipe, 'id' | 'rating' | 'ratingCount' | 'tips' | 'favoriteCount'>) => {
    if (selectedRecipe) {
      // Edit
      const updatedRecipe = { ...selectedRecipe, ...data };
      updateRecipe(updatedRecipe);
    } else {
      // Add
      addRecipe(data);
    }
    setIsFormOpen(false);
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <h1 className="font-headline text-4xl mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const allTips = recipes.flatMap(recipe =>
    (recipe.tips || []).map(tip => ({
      ...tip,
      recipeName: recipe.name,
      recipeId: recipe.id
    }))
  );

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl">
              {selectedRecipe ? "Edit Recipe" : "Add New Recipe"}
            </DialogTitle>
          </DialogHeader>
          <RecipeForm
            recipe={selectedRecipe}
            onSave={handleSaveRecipe}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-base md:text-lg">Manage your RecipeRadar application.</p>
        </div>
        
        <Tabs defaultValue="recipes">
          <TabsList className="mb-4">
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="tips">Tips</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
          <TabsContent value="recipes">
            <RecipeTable
              recipes={recipes}
              onAdd={handleAddRecipe}
              onEdit={handleEditRecipe}
              onDelete={deleteRecipe}
              onTogglePublish={togglePublish}
            />
          </TabsContent>
          <TabsContent value="tips">
            <TipsTable tips={allTips} onDeleteTip={deleteTip} />
          </TabsContent>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
