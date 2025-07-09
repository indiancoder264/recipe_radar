# RecipeRadar Application Guide

This document provides a detailed walkthrough of the RecipeRadar web application, its architecture, key functionalities, and file structure.

---

## 1. Project Overview & Tech Stack

RecipeRadar is a feature-rich web application for discovering, sharing, and discussing recipes. It is built as a prototype using a modern tech stack, designed for performance, maintainability, and a great developer experience.

**Key Technologies:**

-   **Next.js:** A React framework for building server-rendered and statically-generated web applications. We use its **App Router** for file-based routing.
-   **React:** The core library for building the user interface.
-   **TypeScript:** Adds static typing to JavaScript for improved code quality and robustness.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **ShadCN UI:** A collection of beautifully designed, accessible, and reusable UI components built on top of Tailwind CSS.
-   **React Context API:** Used for simple, effective global state management across the application.

---

## 2. Core Concept: State Management with React Context

Instead of a complex state management library like Redux, this application uses React's built-in **Context API**. This approach is lightweight and perfect for managing global data that needs to be accessible by many components.

The state is managed in "providers" located in the `src/lib/` directory. These providers are all brought together in `src/app/providers.tsx`, which wraps the entire application.

-   **`src/lib/recipes.tsx`:**
    -   **Hook:** `useRecipes()`
    -   **Manages:** The entire collection of recipes. It handles all logic for adding, updating, and deleting recipes, as well as managing tips and ratings.
-   **`src/lib/auth.tsx`:**
    -   **Hook:** `useAuth()`
    -   **Manages:** The currently logged-in user's state, including their profile information, favorites, and authentication status (login/logout).
-   **`src/lib/community.tsx`:**
    -   **Hook:** `useCommunity()`
    -   **Manages:** All data related to community groups, including creating/joining groups, adding posts, and handling comments and reactions.
-   **`src/lib/users.tsx`:**
    -   **Hook:** `useAllUsers()`
    -   **Manages:** The complete list of all users. This is primarily used by the admin dashboard for user management tasks like suspension and deletion.

---

## 3. Data Source

The application is currently a prototype and uses **local JSON files** as a mock database. This makes it easy to view and modify data during development.

-   `src/data/recipes.json`: Contains all recipe information.
-   `src/data/users.json`: Contains all user profiles.
-   `src/data/groups.json`: Contains all community group data.

These files are imported directly into their respective context providers in `src/lib/`.

---

## 4. Page Breakdown & Functionality

The application uses the Next.js App Router, where each folder in `src/app/` corresponds to a URL path.

| Page / Feature            | File Location                               | Description                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Homepage**              | `src/app/page.tsx`                          | The main landing page. Displays a hero section, search bar, a carousel of trending recipes, and sections for each cuisine. It dynamically shows recommended recipes if the user is logged in.         |
| **Recipe Detail Page**    | `src/app/recipes/[id]/page.tsx`             | Shows all details for a single recipe. Users can view ingredients and steps, favorite the recipe, follow an interactive step-by-step cooking guide, and submit their own tips and ratings.            |
| **User Profile**          | `src/app/profile/page.tsx`                  | Allows a logged-in user to view and edit their profile, see their favorite recipes, manage their preferred cuisines, and track their contributions (tips and group activity).                         |
| **Cuisine-Specific Page** | `src/app/cuisine/[region]/page.tsx`         | A page that lists all recipes for a specific cuisine (e.g., "Italian Cuisine"). This is the destination for the "View All" buttons on the homepage.                                                     |
| **Login & Signup**        | `src/app/login/page.tsx` & `signup/page.tsx`| Standard forms for user authentication. The logic is handled in `src/lib/auth.tsx`.                                                                                                                      |
| **Community Hub**         | `src/app/community/page.tsx`                | The main entry point for the community section. It displays a grid of all available groups, showing member counts and allowing users to join or leave.                                               |
| **Create Group Page**     | `src/app/community/create/page.tsx`         | A simple form that allows logged-in users to create a new community group with a name and description. Logic is handled by `useCommunity()`.                                                         |
| **Group Detail Page**     | `src/app/community/[id]/page.tsx`           | The discussion board for a single group. Members can create new posts, and all users can view posts, see comments, and react with likes/dislikes. Non-members are prompted to join.               |
| **Admin Dashboard**       | `src/app/admin/page.tsx`                    | A protected page for administrators. It features a tabbed interface to manage recipes (add/edit/delete), moderate user-submitted tips, manage community groups, and view user analytics and details. |

---

## 5. Key Components

While there are many components, here are a few of the most important reusable ones:

| Component                 | File Location                       | Description                                                                                                          |
| ------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Header**                | `src/components/layout/header.tsx`  | The main navigation bar at the top of the site. It shows different links based on whether a user is logged in or an admin. |
| **Footer**                | `src/components/layout/footer.tsx`  | The site footer.                                                                                                     |
| **RecipeCard**            | `src/components/recipe-card.tsx`    | A card component used to display a recipe's summary on the homepage and other listing pages.                         |
| **StarRating**            | `src/components/star-rating.tsx`    | A reusable component for both displaying and interacting with star ratings. Used on recipe cards and the detail page.  |
| **ShadCN UI Components**  | `src/components/ui/`                | This directory contains all the base UI components like `Button`, `Card`, `Input`, `Dialog`, etc., from ShadCN.        |
| **Admin Components**      | `src/components/admin/`             | This directory contains components specifically built for the various tabs within the Admin Dashboard.                   |

This guide should provide a solid foundation for understanding how the RecipeRadar application is built and where to find the relevant code for each piece of its functionality.