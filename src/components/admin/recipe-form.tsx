
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import React from "react";
import type { Recipe } from "@/lib/recipes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const recipeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  region: z.string().min(2, "Region is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  prepTime: z.string().min(1, "Prep time is required"),
  cookTime: z.string().min(1, "Cook time is required"),
  servings: z.string().min(1, "Servings are required"),
  image: z.string().url("Must be a valid image URL"),
  published: z.boolean().default(true),
  dietaryType: z.enum(["Vegetarian", "Non-Vegetarian", "Vegan"]),
  ingredients: z.array(z.object({ value: z.string().min(1, "Ingredient cannot be empty") })).min(1, "At least one ingredient is required"),
  steps: z.array(z.object({ value: z.string().min(1, "Step cannot be empty") })).min(1, "At least one step is required"),
});

type RecipeFormProps = {
  recipe: Recipe | null;
  onSave: (data: Omit<Recipe, 'id' | 'rating' | 'ratingCount' | 'tips' | 'favoriteCount'>) => void;
  onCancel: () => void;
};

export function RecipeForm({ recipe, onSave, onCancel }: RecipeFormProps) {
  const defaultValues = React.useMemo(() => ({
    name: recipe?.name ?? "",
    region: recipe?.region ?? "",
    description: recipe?.description ?? "",
    prepTime: recipe?.prepTime ?? "",
    cookTime: recipe?.cookTime ?? "",
    servings: recipe?.servings ?? "",
    image: recipe?.image ?? "",
    published: recipe?.published ?? true,
    dietaryType: recipe?.dietaryType ?? "Non-Vegetarian",
    ingredients: recipe?.ingredients.map(i => ({ value: i })) ?? [{ value: "" }],
    steps: recipe?.steps.map(s => ({ value: s })) ?? [{ value: "" }],
  }), [recipe]);

  const form = useForm({
    resolver: zodResolver(recipeSchema),
    defaultValues,
  });
  
  React.useEffect(() => {
    form.reset(defaultValues);
  }, [recipe, defaultValues, form]);

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    name: "ingredients",
    control: form.control,
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    name: "steps",
    control: form.control,
  });

  const onSubmit = (data: z.infer<typeof recipeSchema>) => {
    const finalData = {
        ...data,
        ingredients: data.ingredients.map(i => i.value),
        steps: data.steps.map(s => s.value),
    };
    onSave(finalData as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem><FormLabel>Region</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="prepTime" render={({ field }) => (
                <FormItem><FormLabel>Prep Time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cookTime" render={({ field }) => (
                <FormItem><FormLabel>Cook Time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="servings" render={({ field }) => (
                <FormItem><FormLabel>Servings</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dietaryType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dietary type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div>
              <FormLabel>Ingredients</FormLabel>
              <FormDescription>Add at least one ingredient.</FormDescription>
              <div className="space-y-2 mt-2">
                {ingredientFields.map((field, index) => (
                  <FormField key={field.id} control={form.control} name={`ingredients.${index}.value`} render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl><Input {...field} placeholder={`Ingredient ${index + 1}`} /></FormControl>
                        {ingredientFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}/>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendIngredient({ value: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Ingredient
              </Button>
            </div>

            <div>
              <FormLabel>Steps</FormLabel>
              <FormDescription>Add at least one cooking step.</FormDescription>
              <div className="space-y-2 mt-2">
                {stepFields.map((field, index) => (
                  <FormField key={field.id} control={form.control} name={`steps.${index}.value`} render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-2">
                        <FormControl><Textarea {...field} placeholder={`Step ${index + 1}`} /></FormControl>
                        {stepFields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendStep({ value: "" })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Step
              </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save Recipe</Button>
        </div>
      </form>
    </Form>
  );
}
