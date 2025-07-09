
# RecipeRadar Project File Structure

This document outlines the file and folder structure for the RecipeRadar application.

```
/
├── .env                  # Environment variables (secrets, keys)
├── .vscode/
│   └── settings.json     # VSCode editor settings
├── APP_GUIDE.md          # Detailed application architecture and feature guide
├── README.md             # Basic project README
├── FILE_STRUCTURE.md     # This file, outlining the project structure
├── apphosting.yaml       # Firebase App Hosting configuration
├── components.json       # Configuration for ShadCN UI components
├── next.config.ts        # Next.js configuration file
├── package.json          # Project dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
└── src/
    ├── app/              # Next.js App Router: all pages and layouts
    │   ├── admin/
    │   │   └── page.tsx  # Admin Dashboard page
    │   ├── community/
    │   │   ├── [id]/
    │   │   │   └── page.tsx # Individual community group discussion page
    │   │   ├── create/
    │   │   │   └── page.tsx # Page to create a new community group
    │   │   └── page.tsx    # Main community hub page listing all groups
    │   ├── cuisine/
    │   │   └── [region]/
    │   │       └── page.tsx # Page displaying all recipes for a specific cuisine
    │   ├── globals.css     # Global styles and Tailwind directives
    │   ├── layout.tsx      # Root layout for the entire application
    │   ├── login/
    │   │   └── page.tsx  # Login page
    │   ├── page.tsx        # Homepage
    │   ├── profile/
    │   │   └── page.tsx  # User profile page
    │   ├── providers.tsx   # Aggregates all React Context providers
    │   ├── recipes/
    │   │   └── [id]/
    │   │       └── page.tsx # Recipe detail page
    │   └── signup/
    │       └── page.tsx  # Signup page
    ├── components/         # Reusable React components
    │   ├── admin/          # Components used only on the Admin Dashboard
    │   │   ├── analytics.tsx
    │   │   ├── community-management.tsx
    │   │   ├── recipe-form.tsx
    │   │   ├── recipe-table.tsx
    │   │   ├── tips-table.tsx
    │   │   └── user-management.tsx
    │   ├── layout/         # Components for the overall site layout
    │   │   ├── footer.tsx
    │   │   └── header.tsx
    │   ├── recipe-card.tsx # Card for displaying a recipe summary
    │   ├── star-rating.tsx # Component for displaying star ratings
    │   └── ui/             # ShadCN UI components (Button, Card, etc.)
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       └── tooltip.tsx
    ├── data/               # Mock data (used as a simple database)
    │   ├── groups.json
    │   ├── recipes.json
    │   └── users.json
    ├── hooks/              # Custom React hooks
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    └── lib/                # Core logic, helpers, and state management
        ├── auth.tsx        # Auth state management (user, login, logout)
        ├── community.tsx   # Community state management (groups, posts)
        ├── recipes.tsx     # Recipe state management (add, update, delete)
        ├── users.tsx       # State management for the list of all users (for admin)
        └── utils.ts        # Utility functions (e.g., cn for Tailwind classes)
```
