
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCommunity, type Group } from "@/lib/community";
import { useAuth } from "@/lib/auth";
import { PlusCircle, Users } from "lucide-react";
import React from "react";
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

function GroupCard({ group }: { group: Group }) {
  const { user } = useAuth();
  const { joinGroup, leaveGroup } = useCommunity();
  const isMember = user ? group.members.includes(user.id) : false;

  const handleJoin = () => {
    if (user) joinGroup(group.id, user.id);
  };
  
  const handleLeave = () => {
    if (user) leaveGroup(group.id, user.id);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          <Link href={`/community/${group.id}`} className="hover:text-primary transition-colors">
            {group.name}
          </Link>
        </CardTitle>
        <CardDescription>Created by {group.creatorName}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{group.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center text-muted-foreground">
          <Users className="w-4 h-4 mr-2" />
          <span>{group.members.length} member(s)</span>
        </div>
        {!user ? (
          <Button asChild>
            <Link href="/login">Join</Link>
          </Button>
        ) : isMember ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Leave</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will lose membership to the group "{group.name}" and will no longer be able to post. You can rejoin at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button onClick={handleJoin}>Join</Button>
        )}
      </CardFooter>
    </Card>
  );
}


export default function CommunityPage() {
  const { groups } = useCommunity();
  const { user } = useAuth();

  const sortedGroups = React.useMemo(() => {
    return [...groups].sort((a, b) => b.members.length - a.members.length);
  }, [groups]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-5xl font-bold">Community Groups</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Find and join groups of like-minded food lovers.
          </p>
        </div>
        <Button asChild>
          <Link href="/community/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
