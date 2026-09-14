# PromptKeeper

PromptKeeper is a private prompt library for saving, searching, organizing, and copying the AI prompts you use repeatedly.

## Stack

- React + Vite + JavaScript
- Supabase Auth
- Supabase PostgreSQL with Row Level Security
- Plain CSS
- lucide-react icons

## Prerequisites

- Node.js 18 or newer
- A Supabase project

## Supabase setup

1. Create a project at https://supabase.com.
2. In the Supabase SQL Editor, run the complete contents of supabase/schema.sql.
3. In Project Settings → API, copy the Project URL and the Publishable key.
4. Copy .env.example to .env.local and add the two VITE_ variables shown there.

Only the publishable key belongs in the browser. Never use or expose a Supabase service-role key in this frontend.

## Run locally

npm install
npm run dev

Open the local URL Vite prints in the terminal. Use the registration flow to create an account. Depending on your Supabase email settings, you may need to confirm your email before logging in.

## How privacy works

The browser uses the signed-in Supabase session and only inserts prompts with the current user's ID. The actual security boundary is PostgreSQL Row Level Security: the four explicit policies in supabase/schema.sql allow each authenticated user to select, insert, update, and delete only rows where auth.uid() matches user_id. Frontend filtering is not used as a security mechanism.

## Deployment

PromptKeeper is a Vite static frontend and can be deployed to Cloudflare Pages, Vercel, GitHub Pages, or another static host. Configure the two VITE_ variables in the host's environment settings before building.

npm run build

Deploy the generated dist directory. If using GitHub Pages, configure the workflow to publish the Vite dist output and make sure the host serves the SPA entry point for the chosen base path.

## MVP limitations

This version intentionally does not include social login, sharing, folders, prompt history, rich text, payments, an API server, or AI generation. Search is fast local substring matching after the signed-in user's prompts are loaded. Favorites and prompt data are stored in Supabase; only transient UI state lives in React.
