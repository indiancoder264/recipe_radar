
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { Clock, Users, Star, ArrowLeft, Heart, RotateCw } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [cookingStarted, setCookingStarted] = React.useState(!!userTip);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [finishedCooking, setFinishedCooking] = React.useState(!!userTip);
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

  const handleStartOver = () => {
    setCurrentStep(0);
    setFinishedCooking(false);
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
        <div className="flex justify-center mb-8">
            <Card className="overflow-hidden w-full max-w-4xl">
                <Image
                    src={recipe.image}
                    alt={recipe.name}
                    width={800}
                    height={400}
                    className="w-full object-cover h-80"
                />
            </Card>
        </div>

        {/* ───── Main Content ───── */}
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* ─── Details & Ingredients ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Details */}
                <Card>
                <CardHeader>
                    <h3 className="font-headline text-2xl md:text-3xl">
                    Details
                    </h3>
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
                    <h3 className="font-headline text-2xl md:text-3xl">
                    Ingredients
                    </h3>
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

            {/* ─── Steps ─── */}
            <div>
              {!cookingStarted ? (
                <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[280px]">
                  <CardHeader>
                    <h3 className="font-headline text-2xl md:text-3xl">
                      Ready to Cook?
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">Shall we start the step-by-step guide?</p>
                    <Button onClick={() => setCookingStarted(true)}>Start Cooking</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-2xl md:text-3xl">
                        Step {currentStep + 1} / {totalSteps}
                      </h3>
                      {currentStep > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <RotateCw className="w-5 h-5 text-muted-foreground" />
                              <span className="sr-only">Start Over</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to start over?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Your current cooking progress will be lost and you will return to step 1.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleStartOver}>
                                Yes, Start Over
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
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
              )}
            </div>
        </div>

        {/* ───── Tips & Ratings ───── */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="font-headline text-3xl md:text-4xl mb-6 text-center">
            Ratings &amp; Tips
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Community Tips */}
            <Card>
              <CardHeader>
                <h3 className="font-headline text-2xl">
                  Community Tips
                </h3>
              </CardHeader>
              <CardContent>
                {recipe.tips && recipe.tips.length > 0 ? (
                  <ScrollArea className="h-72">
                    <div className="space-y-4 pr-4">
                      {recipe.tips.map((t) => (
                        <TipDisplay key={t.id} tip={t} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex h-72 items-center justify-center">
                    <p className="text-muted-foreground">
                      No tips yet. Be the first to add one!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tip Form / Prompt */}
            {finishedCooking ? (
              <Card>
                <CardHeader>
                  <h3 className="font-headline text-2xl">
                    {userTip ? "Edit Your Tip & Rating" : "Leave a Tip & Rating"}
                  </h3>
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
