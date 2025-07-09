
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import initialGroupsData from "@/data/groups.json";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/auth";

// Types
export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  comments: Comment[];
};

export type Group = {
  id: string;
  name: string;
  description: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  members: string[];
  posts: Post[];
};

const initialGroups: Group[] = initialGroupsData as any as Group[];

type CommunityContextType = {
  groups: Group[];
  createGroup: (data: { name: string; description: string }, user: User) => void;
  deleteGroup: (groupId: string) => void;
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  addPost: (groupId: string, content: string, user: User) => void;
  addComment: (groupId: string, postId: string, content: string, user: User) => void;
  togglePostReaction: (groupId: string, postId: string, reaction: 'like' | 'dislike', userId: string) => void;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>(initialGroups);

  const createGroup = (data: { name: string; description: string }, user: User) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: data.name,
      description: data.description,
      creatorId: user.id,
      creatorName: user.name,
      createdAt: new Date().toISOString(),
      members: [user.id],
      posts: [],
    };
    setGroups(prev => [newGroup, ...prev]);
    toast({ title: "Group Created!", description: `The group "${data.name}" has been created.` });
  };

  const deleteGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
    toast({
        title: "Group Deleted",
        description: "The group has been successfully deleted.",
        variant: "destructive",
    });
  };

  const joinGroup = (groupId: string, userId: string) => {
    let groupJoined = false;
    setGroups(prev => prev.map(group => {
      if (group.id === groupId && !group.members.includes(userId)) {
        groupJoined = true;
        return { ...group, members: [...group.members, userId] };
      }
      return group;
    }));

    if (groupJoined) {
      toast({ title: "Joined Group", description: "You are now a member of the group." });
    }
  };
  
  const leaveGroup = (groupId: string, userId: string) => {
    let groupLeft = false;
    setGroups(prev => prev.map(group => {
      if (group.id === groupId && group.members.includes(userId)) {
        groupLeft = true;
        return { ...group, members: group.members.filter(id => id !== userId) };
      }
      return group;
    }));

    if (groupLeft) {
      toast({ title: "Left Group", description: "You are no longer a member of this group." });
    }
  };
  
  const addPost = (groupId: string, content: string, user: User) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      dislikes: [],
      comments: [],
    };
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, posts: [newPost, ...group.posts] };
      }
      return group;
    }));
  };

  const addComment = (groupId: string, postId: string, content: string, user: User) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content,
      createdAt: new Date().toISOString(),
    };
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newPosts = group.posts.map(post => {
          if (post.id === postId) {
            return { ...post, comments: [newComment, ...post.comments] };
          }
          return post;
        });
        return { ...group, posts: newPosts };
      }
      return group;
    }));
  };

  const togglePostReaction = (groupId: string, postId: string, reaction: 'like' | 'dislike', userId: string) => {
    setGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newPosts = group.posts.map(post => {
          if (post.id === postId) {
            let newLikes = [...(post.likes || [])];
            let newDislikes = [...(post.dislikes || [])];

            if (reaction === 'like') {
              const likeIndex = newLikes.indexOf(userId);
              if (likeIndex > -1) {
                newLikes.splice(likeIndex, 1);
              } else {
                newLikes.push(userId);
                const dislikeIndex = newDislikes.indexOf(userId);
                if (dislikeIndex > -1) {
                  newDislikes.splice(dislikeIndex, 1);
                }
              }
            } else if (reaction === 'dislike') {
              const dislikeIndex = newDislikes.indexOf(userId);
              if (dislikeIndex > -1) {
                newDislikes.splice(dislikeIndex, 1);
              } else {
                newDislikes.push(userId);
                const likeIndex = newLikes.indexOf(userId);
                if (likeIndex > -1) {
                  newLikes.splice(likeIndex, 1);
                }
              }
            }
            return { ...post, likes: newLikes, dislikes: newDislikes };
          }
          return post;
        });
        return { ...group, posts: newPosts };
      }
      return group;
    }));
  };

  return (
    <CommunityContext.Provider value={{ groups, createGroup, deleteGroup, joinGroup, leaveGroup, addPost, addComment, togglePostReaction }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
};
