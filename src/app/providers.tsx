
"use client";

import { AuthProvider } from "@/lib/auth";
import { RecipeProvider } from "@/lib/recipes";
import { AllUsersProvider } from "@/lib/users";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RecipeProvider>
      <AllUsersProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AllUsersProvider>
    </RecipeProvider>
  );
}
