
"use client";

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

type Tip = {
  id: string;
  user: string;
  tip: string;
  recipeName: string;
  recipeId: string;
};

type TipsTableProps = {
  tips: Tip[];
  onDeleteTip: (recipeId: string, tipId: string) => void;
};

export function TipsTable({ tips, onDeleteTip }: TipsTableProps) {
  const handleDelete = (recipeId: string, tipId: string) => {
    onDeleteTip(recipeId, tipId);
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Moderate Tips</CardTitle>
        <CardDescription>Review and remove user-submitted tips.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tips.map((tip) => (
              <TableRow key={tip.id}>
                <TableCell className="font-medium">{tip.user}</TableCell>
                <TableCell className="max-w-sm truncate">{tip.tip}</TableCell>
                <TableCell>{tip.recipeName}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(tip.recipeId, tip.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
