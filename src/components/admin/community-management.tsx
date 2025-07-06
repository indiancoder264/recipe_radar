
"use client";

import React from "react";
import { useCommunity } from "@/lib/community";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export function CommunityManagement() {
  const { groups, deleteGroup } = useCommunity();
  const [displayDates, setDisplayDates] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const newDates: Record<string, string> = {};
    groups.forEach(group => {
      newDates[group.id] = new Date(group.createdAt).toLocaleDateString();
    });
    setDisplayDates(newDates);
  }, [groups]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Manage Community Groups</CardTitle>
        <CardDescription>Oversee and moderate all user-created groups.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-center">Members</TableHead>
              <TableHead className="text-center">Posts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.creatorName}</TableCell>
                <TableCell>{displayDates[group.id] || "..."}</TableCell>
                <TableCell className="text-center">{group.members.length}</TableCell>
                <TableCell className="text-center">{group.posts.length}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Group</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the group "{group.name}" and all of its posts and comments. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteGroup(group.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
