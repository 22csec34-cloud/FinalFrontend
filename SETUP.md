# 👗 Style Weaver — Frontend Setup & Run Guide

## Overview
Style Weaver is a **React + TypeScript** frontend built with **Vite**. It provides:
- User authentication (signup/login)
- AI-powered outfit generation
- Virtual try-on with AR
- Outfit gallery management
- Trending fashion styles
- Style suggestions & favorites
- Order tracking dashboard

---

## Prerequisites

| Tool     | Version | Install Link                            |
|---------|---------|------------------------------------------|
| Node.js | v18+    | https://nodejs.org/                      |
| npm     | v9+     | Comes with Node.js                       |
| Git     | Latest  | https://git-scm.com/downloads            |

---

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd style-weaver
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `style-weaver/` folder (or edit the existing one):

```env
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="https://your-project.supabase.co"
```

### 3. Run the Development Server

```bash
npm run dev
```

The app will start on **http://localhost:5173** (Vite default)

### 4. Build for Production (Optional)

```bash
npm run build
```

### 5. Preview Production Build (Optional)

```bash
npm run preview
```

---

## Available Scripts

| Command            | Description                                     |
|-------------------|-------------------------------------------------|
| `npm run dev`     | Start dev server with hot-reload                |
| `npm run build`   | Build production bundle                         |
| `npm run preview` | Preview the production build locally            |
| `npm run lint`    | Run ESLint code linting                         |
| `npm run test`    | Run tests with Vitest                           |
| `npm run test:watch` | Run tests in watch mode                      |

---

## Tech Stack

| Technology         | Purpose                                |
|-------------------|----------------------------------------|
| React 18          | UI framework                           |
| TypeScript        | Type safety                            |
| Vite              | Build tool & dev server                |
| Tailwind CSS      | Utility-first CSS framework            |
| shadcn/ui (Radix) | Accessible UI component library        |
| React Router v6   | Client-side routing                    |
| TanStack Query    | Server state management & caching      |
| Supabase          | Backend-as-a-service (auth/db)         |
| Recharts          | Data visualization / charts            |
| Lucide React      | Icon library                           |
| Zod               | Schema validation                      |
| Vitest            | Unit testing framework                 |

---

## Project Structure

```
style-weaver/
├── public/                   # Static assets
├── src/
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Page-level components
│   ├── lib/                  # Utility functions
│   ├── integrations/         # API integrations (Supabase, etc.)
│   ├── App.tsx               # Main app component with routes
│   └── main.tsx              # Entry point
├── supabase/                 # Supabase configuration
├── index.html                # HTML entry point
├── package.json              # Node.js dependencies
├── requirements.txt          # Dependency info (refers to npm)
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── vitest.config.ts          # Vitest test configuration
├── .env                      # Environment variables (DO NOT COMMIT)
└── .gitignore
```

---

## Connecting to the Backend

Make sure the **backend server** is running on `http://localhost:5000` before using the app. The frontend communicates with the backend for:
- User authentication
- Outfit generation (Grok AI)
- Style suggestions (Gemini AI)
- Gallery saving/loading
- Trending styles
- Order management

---

## Troubleshooting

| Issue                                | Solution                                          |
|--------------------------------------|---------------------------------------------------|
| `npm install` fails                  | Delete `node_modules/` and `package-lock.json`, then retry |
| Port 5173 already in use             | Kill the process or set a different port in `vite.config.ts` |
| API requests failing                 | Ensure the backend is running on port 5000        |
| Supabase connection error            | Check `.env` for correct Supabase credentials     |
| TypeScript errors                    | Run `npm run lint` to identify issues             |
| Blank page after build               | Check browser console for errors                  |
