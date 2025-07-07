

"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { RecipeCard } from '@/components/recipe-card';
import { Search, ArrowRight, X } from 'lucide-react';
import { useRecipes } from '@/lib/recipes';
import { useAuth } from '@/lib/auth';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user } = useAuth();
  const { recipes } = useRecipes();
  const publicRecipes = recipes.filter(r => r.published);

  const dietaryFilteredRecipes = React.useMemo(() => {
    if (!user || user.dietaryPreference === 'All' || user.dietaryPreference === 'Non-Vegetarian') {
      return publicRecipes;
    }
    if (user.dietaryPreference === 'Vegetarian') {
      return publicRecipes.filter(r => r.dietaryType === 'Vegetarian' || r.dietaryType === 'Vegan');
    }
    if (user.dietaryPreference === 'Vegan') {
      return publicRecipes.filter(r => r.dietaryType === 'Vegan');
    }
    return publicRecipes;
  }, [publicRecipes, user]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<typeof publicRecipes | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
        setSearchResults(null);
        return;
    }

    const lowercasedQuery = query.toLowerCase();

    const countryMap: { [key: string]: string[] } = {
        "italian": ["italy"],
        "indian": ["india"],
        "french": ["france"],
        "spanish": ["spain"],
        "mexican": ["mexico"],
        "japanese": ["japan"],
        "moroccan": ["morocco"],
        "kids": ["usa", "united states", "america"],
    };

    const filtered = publicRecipes.filter(recipe => {
        const recipeRegion = recipe.region.toLowerCase();
        const recipeName = recipe.name.toLowerCase();

        // Direct match on recipe name or region
        if (recipeName.includes(lowercasedQuery) || recipeRegion.includes(lowercasedQuery)) {
            return true;
        }

        // Match on country
        const mappedCountries = countryMap[recipeRegion] || [];
        if (mappedCountries.some(country => country.includes(lowercasedQuery))) {
          return true;
        }

        // Match if search query is a country name
        for (const region in countryMap) {
            if (countryMap[region].includes(lowercasedQuery) && recipeRegion === region) {
                return true;
            }
        }
        
        return false;
    });

    setSearchResults(filtered);
  };

  const clearSearch = () => {
      setSearchQuery('');
      setSearchResults(null);
  };

  const trendingRecipes = [...publicRecipes]
    .sort((a, b) => b.ratingCount - a.ratingCount)
    .slice(0, 8);
    
  const regions = [...new Set(publicRecipes.map((recipe) => recipe.region))];

  const recommendedRecipes = user && user.favoriteCuisines.length > 0
    ? dietaryFilteredRecipes.filter(recipe => user.favoriteCuisines.includes(recipe.region))
    : [];
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="relative mb-12 h-80 rounded-lg overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop"
          alt="Delicious food collage"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
          data-ai-hint="vibrant food market"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="font-headline text-4xl sm:text-5xl md:text-7xl font-bold">Discover Your Next Meal</h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg">
            Explore thousands of recipes from around the world. Your culinary adventure starts here.
          </p>
          <div className="mt-6 w-full max-w-md">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search recipes, cuisines, or countries..."
                className="w-full rounded-full bg-white/90 py-3 pl-12 pr-12 text-base text-foreground md:py-6 md:text-lg"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
              {searchQuery && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={clearSearch}
                >
                    <X className="h-5 w-5" />
                    <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {searchResults !== null ? (
        <section>
          <div className="flex justify-between items-center mb-6 border-b-2 border-primary pb-2">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                  Search Results
              </h2>
              <p className="text-muted-foreground">{searchResults.length} recipe(s) found</p>
          </div>

          {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
          ) : (
              <div className="text-center py-16 bg-card rounded-lg">
                  <h3 className="font-headline text-2xl mb-2">No Recipes Found</h3>
                  <p className="text-muted-foreground">We couldn't find any recipes matching "{searchQuery}".</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
              </div>
          )}
        </section>
      ) : (
        <>
          <section className="mb-12">
            <div className="flex items-center gap-4 mb-6 border-b-2 border-primary pb-2">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">
                Worldwide Trending Recipes
              </h2>
              {/* Cooker Whistle SVG Animation */}
              <div className="cooker-whistle-container">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="whistle-svg"
                >
                  <g className="steam">
                    <path
                      className="steam-puff three"
                      d="M27 15C27 13.3431 28.3431 12 30 12C31.6569 12 33 13.3431 33 15C33 16.6569 31.6569 18 30 18C29.2081 18 28.4827 17.6973 27.9383 17.1824"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      className="steam-puff two"
                      d="M21 18C21 16.3431 22.3431 15 24 15C25.6569 15 27 16.3431 27 18C27 19.6569 25.6569 21 24 21C23.2081 21 22.4827 20.6973 21.9383 20.1824"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      className="steam-puff one"
                      d="M15 21C15 19.3431 16.3431 18 18 18C19.6569 18 21 19.3431 21 21C21 22.6569 19.6569 24 18 24C17.2081 24 16.4827 23.6973 15.9383 23.1824"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                  <g className="whistle-body">
                    <path
                      d="M14 36V30C14 26.6863 16.6863 24 20 24H28C31.3137 24 34 26.6863 34 30V36"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 24V22"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M28 24V22"
                      stroke="hsl(var(--foreground))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className="whistle-jiggle"
                      d="M22 24C22 23.4477 22.4477 23 23 23H25C25.5523 23 26 23.4477 26 24V24C26 24.5523 25.5523 25 25 25H23C22.4477 25 22 24.5523 22 24V24Z"
                      fill="hsl(var(--foreground))"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent>
                {trendingRecipes.map((recipe) => (
                  <CarouselItem key={recipe.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div className="p-1 h-full">
                      <RecipeCard recipe={recipe} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="ml-8" />
              <CarouselNext className="mr-8" />
            </Carousel>
          </section>

          {user && recommendedRecipes.length > 0 && (
            <section className="mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 border-b-2 border-primary pb-2">
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendedRecipes.slice(0, 4).map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
            </section>
          )}

          {regions.map((region) => {
            const regionRecipes = dietaryFilteredRecipes.filter(
              (recipe) => recipe.region === region
            );
            const displayedRecipes = regionRecipes.slice(0, 4);
            const sectionTitle = region === 'Kids' ? 'Fun for Kids' : region === 'Bachelor Plan' ? 'Bachelors Special' : `${region} Cuisine`;

            if (displayedRecipes.length === 0) return null;

            return (
              <section key={region} className="mb-12">
                <div className="flex justify-between items-center mb-6 border-b-2 border-primary pb-2">
                  <h2 className="font-headline text-3xl md:text-4xl font-bold">
                    {sectionTitle}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                    />
                  ))}
                </div>
                {regionRecipes.length > 4 && (
                   <div className="mt-8 flex justify-center">
                      <Button asChild variant="secondary">
                          <Link href={`/cuisine/${encodeURIComponent(region)}`}>
                              View All {sectionTitle} Recipes <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                      </Button>
                   </div>
                )}
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
