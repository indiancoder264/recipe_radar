
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import allUsersData from "@/data/users.json";
import type { User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const initialUsers: User[] = allUsersData as User[];

type AllUsersContextType = {
  allUsers: User[];
  deleteUser: (userId: string) => void;
  suspendUser: (userId: string, days: number) => void;
  unsuspendUser: (userId: string) => void;
  toggleAdmin: (userId: string) => void;
};

const AllUsersContext = createContext<AllUsersContextType | undefined>(undefined);

export const AllUsersProvider = ({ children }: { children: ReactNode }) => {
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();

  const deleteUser = (userId: string) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
    toast({
      title: "User Deleted",
      description: "The user has been removed.",
      variant: "destructive",
    });
  };

  const suspendUser = (userId: string, days: number) => {
    const suspensionEndDate = new Date();
    suspensionEndDate.setDate(suspensionEndDate.getDate() + days);

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, suspendedUntil: suspensionEndDate.toISOString() }
          : u
      )
    );
    toast({
      title: "User Suspended",
      description: `The user has been suspended for ${days} day(s).`,
    });
  };

  const unsuspendUser = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, suspendedUntil: undefined } : u
      )
    );
    toast({
      title: "User Unsuspended",
      description: "The user's suspension has been lifted.",
    });
  };

  const toggleAdmin = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          toast({
            title: "Admin Status Changed",
            description: `${u.name} is now ${
              !u.isAdmin ? "an admin" : "no longer an admin"
            }.`,
          });
          return { ...u, isAdmin: !u.isAdmin };
        }
        return u;
      })
    );
  };

  return (
    <AllUsersContext.Provider value={{ allUsers, deleteUser, suspendUser, unsuspendUser, toggleAdmin }}>
      {children}
    </AllUsersContext.Provider>
  );
};

export const useAllUsers = () => {
  const context = useContext(AllUsersContext);
  if (context === undefined) {
    throw new Error("useAllUsers must be used within an AllUsersProvider");
  }
  return context;
};
