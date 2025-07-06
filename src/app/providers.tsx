
"use client";

import { AuthProvider } from "@/lib/auth";
import { RecipeProvider } from "@/lib/recipes";
import { AllUsersProvider } from "@/lib/users";
import { CommunityProvider } from "@/lib/community";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <RecipeProvider>
      <AllUsersProvider>
        <CommunityProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CommunityProvider>
      </AllUsersProvider>
    </RecipeProvider>
  );
}
