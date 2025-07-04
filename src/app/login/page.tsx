"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent, asAdmin: boolean = false) => {
    e.preventDefault();
    login(asAdmin);
    toast({
      title: "Logged In!",
      description: `Welcome back, ${asAdmin ? "Admin" : "RecipeLover"}!`,
    });
    router.push(asAdmin ? "/admin" : "/");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">Welcome Back!</CardTitle>
          <CardDescription>Log in to your RecipeRadar account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" defaultValue="user@reciperadar.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password" required />
            </div>
            <Button type="submit" className="w-full" onClick={(e) => handleLogin(e, false)}>
              Log In
            </Button>
            <Button variant="secondary" className="w-full" onClick={(e) => handleLogin(e, true)}>
              Log In as Admin
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
