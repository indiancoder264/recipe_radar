
"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter, notFound } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { useCommunity, type Post, type Comment } from "@/lib/community";
import { useAuth } from "@/lib/auth";
import { useAllUsers } from "@/lib/users";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, Send, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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

const postSchema = z.object({
  content: z.string().min(1, "Post cannot be empty.").max(1000),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty.").max(500),
});

function CommentDisplay({ comment }: { comment: Comment }) {
    const [displayDate, setDisplayDate] = React.useState("");
    React.useEffect(() => {
        setDisplayDate(new Date(comment.createdAt).toLocaleString());
    }, [comment.createdAt]);

    return (
        <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 border">
                <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.authorName}`} />
                <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{comment.authorName}</p>
                        {displayDate && <p className="text-xs text-muted-foreground">{displayDate}</p>}
                    </div>
                    <p className="text-sm mt-1">{comment.content}</p>
                </div>
            </div>
        </div>
    )
}

function PostDisplay({ post, groupId }: { post: Post, groupId: string }) {
  const { user } = useAuth();
  const { addComment, togglePostReaction } = useCommunity();
  const { toast } = useToast();
  const [displayDate, setDisplayDate] = React.useState("");

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmitComment = (values: z.infer<typeof commentSchema>) => {
    if (user) {
      addComment(groupId, post.id, values.content, user);
      form.reset();
    }
  };

  const handleReaction = (reaction: "like" | "dislike") => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to react to a post.",
        variant: "destructive",
      });
      return;
    }
    togglePostReaction(groupId, post.id, reaction, user.id);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community/${groupId}#${post.id}`)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "A link to this post has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        });
      });
  };
  
  React.useEffect(() => {
    setDisplayDate(new Date(post.createdAt).toLocaleString());
  }, [post.createdAt]);

  const userHasLiked = user ? post.likes?.includes(user.id) : false;
  const userHasDisliked = user ? post.dislikes?.includes(user.id) : false;

  return (
    <Card id={post.id}>
      <CardHeader className="flex flex-row items-start gap-4">
        <Avatar className="h-12 w-12 border">
            <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${post.authorName}`} />
            <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold">{post.authorName}</p>
            {displayDate && <p className="text-sm text-muted-foreground">{displayDate}</p>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
                {post.likes && post.likes.length > 0 && (
                    <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-primary" /> {post.likes.length}
                    </span>
                )}
                {post.dislikes && post.dislikes.length > 0 && (
                     <span className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4 text-muted-foreground" /> {post.dislikes.length}
                    </span>
                )}
            </div>
            <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </div>
        <Separator />
        <div className="grid w-full grid-cols-3">
          <Button variant="ghost" className="flex items-center justify-center" onClick={() => handleReaction('like')}>
            <ThumbsUp className={cn("h-4 w-4", userHasLiked && "fill-primary text-primary")} />
            <span className="ml-2">Like</span>
          </Button>
          <Button variant="ghost" className="flex items-center justify-center" onClick={() => handleReaction('dislike')}>
            <ThumbsDown className={cn("h-4 w-4", userHasDisliked && "fill-destructive text-destructive")} />
            <span className="ml-2">Dislike</span>
          </Button>
          <Button variant="ghost" className="flex items-center justify-center" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="ml-2">Share</span>
          </Button>
        </div>
        <Separator />
        <div className="w-full space-y-4">
            {post.comments.map(comment => <CommentDisplay key={comment.id} comment={comment} />)}
        </div>
        {user && (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitComment)} className="flex w-full items-start gap-2 pt-4">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Textarea placeholder="Write a comment..." {...field} rows={1} className="min-h-0" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
                </form>
            </Form>
        )}
      </CardFooter>
    </Card>
  )
}

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { groups, addPost, joinGroup, leaveGroup } = useCommunity();
  const { user } = useAuth();
  const { allUsers } = useAllUsers();

  const group = React.useMemo(() => {
    return groups.find((g) => g.id === params.id);
  }, [groups, params.id]);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: { content: "" },
  });
  
  if (!group) {
    notFound();
  }
  
  const isMember = user ? group.members.includes(user.id) : false;
  
  const onSubmitPost = (values: z.infer<typeof postSchema>) => {
      if (user) {
          addPost(group.id, values.content, user);
          form.reset();
      }
  };

  const groupMembers = allUsers.filter(u => group.members.includes(u.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Community
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <header className="mb-6">
            <h1 className="font-headline text-5xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground text-lg mt-2">{group.description}</p>
          </header>

          {isMember && (
            <Card>
                <CardHeader>
                    <CardTitle>Create a New Post</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitPost)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea placeholder="Share your thoughts with the group..." {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit">Post</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            {group.posts.length > 0 ? (
                group.posts.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(post => <PostDisplay key={post.id} post={post} groupId={group.id} />)
            ) : (
                <div className="text-center py-16 bg-card rounded-lg">
                    <h3 className="font-headline text-2xl mb-2">No Posts Yet</h3>
                    <p className="text-muted-foreground">Be the first to share something in this group!</p>
                </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Members ({group.members.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!user ? (
                    <Button asChild className="w-full">
                        <Link href="/login">Join Group</Link>
                    </Button>
                    ) : isMember ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">Leave Group</Button>
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
                            <AlertDialogAction onClick={() => leaveGroup(group.id, user.id)}>Leave Group</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                        <Button className="w-full" onClick={() => joinGroup(group.id, user.id)}>Join Group</Button>
                    )
                  }
                  <Separator />
                  {groupMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${member.name}`} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{member.name}</p>
                            {group.creatorId === member.id && <p className="text-xs text-primary">Creator</p>}
                        </div>
                    </div>
                  ))}
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
