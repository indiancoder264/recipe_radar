
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { Clock, Users, Star, ArrowLeft, Heart } from "lucide-react";

import { useRecipes, type Recipe, type Tip } from "@/lib/recipes";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";

// ────────────────────────────────────────────
//  TipDisplay Component
// ────────────────────────────────────────────
function TipDisplay({ tip }: { tip: Tip }) {
  const [displayDate, setDisplayDate] = React.useState("");

  React.useEffect(() => {
    // This code runs only on the client, after hydration, preventing a mismatch
    setDisplayDate(new Date(tip.modifiedAt).toLocaleDateString());
  }, [tip.modifiedAt]);

  const isModified = new Date(tip.createdAt).getTime() !== new Date(tip.modifiedAt).getTime();

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="flex justify-between items-start mb-1">
        <p className="font-bold">{tip.userName}</p>
        <div className="text-right flex-shrink-0 ml-2">
          <StarRating rating={tip.rating} readOnly={true} className="justify-end" />
          {/* Render date only when it's available on the client */}
          {displayDate && (
            <p className="text-xs text-muted-foreground mt-1">
              {isModified ? "Modified" : "Created"} on {displayDate}
            </p>
          )}
        </div>
      </div>
      <p className="text-muted-foreground">“{tip.tip}”</p>
    </div>
  );
}


// ────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────
export default function RecipePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, addOrUpdateTip } = useRecipes();
  const { user, toggleFavorite } = useAuth();
  const { toast } = useToast();

  const recipe = React.useMemo(() => {
    if (!params.id) return undefined;
    return recipes.find((r) => r.id === params.id);
  }, [params.id, recipes]);

  const userTip = React.useMemo(() => {
    if (!user || !recipe?.tips) return undefined;
    return recipe.tips.find((t) => t.userId === user.id);
  }, [recipe, user]);

  const isFavorite = user?.favorites.includes(recipe?.id || "");

  const [rating, setRating] = React.useState(0);
  const [tip, setTip] = React.useState("");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [finishedCooking, setFinishedCooking] = React.useState(false);
  const [isCurrentStepConfirmed, setIsCurrentStepConfirmed] =
    React.useState(false);

  React.useEffect(() => {
    if (userTip) {
      setRating(userTip.rating);
      setTip(userTip.tip);
    } else {
      setRating(0);
      setTip("");
    }
  }, [userTip]);

  // Reset checkbox when step changes
  React.useEffect(() => {
    setIsCurrentStepConfirmed(false);
  }, [currentStep]);

  if (!recipe) {
    notFound();
  }

  const totalSteps = recipe.steps.length;

  // ────────────── Step handlers
  const handleNextStep = () => {
    if (isCurrentStepConfirmed && currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleFinishCooking = () => {
    if (isCurrentStepConfirmed) setFinishedCooking(true);
  };

  // ────────────── Tip form
  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating.",
        variant: "destructive",
      });
      return;
    }
    if (tip.trim() === "") {
      toast({
        title: "Error",
        description: "Please write a tip.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a tip.",
        variant: "destructive",
      });
      return;
    }

    addOrUpdateTip(recipe.id, { tip, rating }, user);
    
    // Only reset form if it was a new tip
    if (!userTip) {
      setRating(0);
      setTip("");
    }
  };

  // ────────────────────────────────────────────
  //  JSX
  // ────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Recipes
      </Button>
      <article>
        {/* ───── Heading ───── */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4 text-lg">
            {recipe.region}
          </Badge>
          <div className="flex items-center justify-center gap-4">
              <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-bold">
                {recipe.name}
              </h1>
              {user && (
              <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  onClick={() => toggleFavorite(recipe.id)}
              >
                  <Heart className={cn("h-8 w-8 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                  <span className="sr-only">Favorite</span>
              </Button>
              )}
          </div>
          <p className="mt-4 max-w-3xl mx-auto text-base md:text-lg text-muted-foreground">
            {recipe.description}
          </p>
        </div>

        {/* ───── Hero Image ───── */}
        <Card className="mb-8 overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.name}
            width={800}
            height={400}
            className="w-full object-cover h-80"
          />
        </Card>

        {/* ───── Main Grid ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Steps ─── */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">
                  Step {currentStep + 1} / {totalSteps}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-lg text-foreground/80 min-h-[120px]">
                <p className="mb-6">{recipe.steps[currentStep]}</p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={"step-confirm-" + currentStep}
                    checked={isCurrentStepConfirmed}
                    onCheckedChange={(chk) =>
                      setIsCurrentStepConfirmed(!!chk)
                    }
                  />
                  <label
                    htmlFor={"step-confirm-" + currentStep}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I have completed this step
                  </label>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                >
                  Previous Step
                </Button>

                {currentStep < totalSteps - 1 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={!isCurrentStepConfirmed}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinishCooking}
                    disabled={finishedCooking || !isCurrentStepConfirmed}
                  >
                    I&apos;m Done!
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-8">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-lg">
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <p>
                    <strong>Prep time:</strong> {recipe.prepTime}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <p>
                    <strong>Cook time:</strong> {recipe.cookTime}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Users className="w-6 h-6 text-primary" />
                  <p>
                    <strong>Servings:</strong> {recipe.servings}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Star className="w-6 h-6 text-primary" />
                  <p>
                    <strong>Rating:</strong> {recipe.rating.toFixed(1)} (
                    {recipe.ratingCount} reviews)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl md:text-3xl">
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-lg">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx}>{ing}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ───── Tips & Ratings ───── */}
        <div className="mt-12">
          <h2 className="font-headline text-3xl md:text-4xl mb-6 text-center">
            Ratings &amp; Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Community Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">
                  Community Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.tips && recipe.tips.length > 0 ? (
                  recipe.tips.map((t) => (
                    <TipDisplay key={t.id} tip={t} />
                  ))
                ) : (
                  <p>No tips yet. Be the first to add one!</p>
                )}
              </CardContent>
            </Card>

            {/* Tip Form / Prompt */}
            {finishedCooking ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">
                    {userTip ? "Edit Your Tip & Rating" : "Leave a Tip & Rating"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <form
                      onSubmit={handleSubmitTip}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-lg font-medium mb-2 block">
                          Your Rating
                        </label>
                        <StarRating
                          rating={rating}
                          onRate={setRating}
                          readOnly={false}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="tip"
                          className="text-lg font-medium mb-2 block"
                        >
                          Your Tip
                        </label>
                        <Textarea
                          id="tip"
                          placeholder="Share your cooking tip or suggestion…"
                          value={tip}
                          onChange={(e) => setTip(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        {userTip ? "Update Tip" : "Submit Tip"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-lg">
                      <p className="mb-4 text-lg">
                        You must be logged in to leave a tip.
                      </p>
                      <Button asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg flex flex-col items-center justify-center h-full">
                <p className="text-lg font-medium">
                  Complete all cooking steps to leave a rating and
                  tip.
                </p>
                <p className="text-muted-foreground">
                  Follow the instructions above and click “I&apos;m
                  Done!” to finish.
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
