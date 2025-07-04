
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VERIFICATION_CODE = "123456"; // Hardcoded for simulation

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [signupStep, setSignupStep] = React.useState<"details" | "verify">("details");
  const [email, setEmail] = React.useState("");
  const [verificationCode, setVerificationCode] = React.useState("");

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userEmail = formData.get("email") as string;
    
    // In a real app, you would call your backend to send the verification code
    setEmail(userEmail);
    setSignupStep("verify");
    
    toast({
      title: "Verification Code Sent",
      description: `A verification code has been sent to ${userEmail}. (Hint: it's ${VERIFICATION_CODE})`,
    });
  };

  const handleVerify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (verificationCode === VERIFICATION_CODE) {
      login(); // Simulate login after verification
      toast({
        title: "Account Created!",
        description: "Welcome to RecipeRadar!",
      });
      router.push("/");
    } else {
      toast({
        title: "Invalid Code",
        description: "The verification code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4">
      <Card className="w-full max-w-md mx-auto">
        {signupStep === "details" ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-4xl">Join RecipeRadar</CardTitle>
              <CardDescription>Create an account to save your favorite recipes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Your Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select name="country" required>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="dietary-preference">Dietary Preference</Label>
                  <Select name="dietaryPreference" required>
                    <SelectTrigger id="dietary-preference">
                      <SelectValue placeholder="Select your preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="Vegan">Vegan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline hover:text-primary">
                  Log in
                </Link>
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-4xl">Verify Your Email</CardTitle>
              <CardDescription>
                Enter the 6-digit code we sent to <span className="font-medium text-foreground">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Verify &amp; Sign Up
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <Button variant="link" onClick={() => setSignupStep("details")}>
                  Back to signup
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
