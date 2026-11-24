# TaskFlow Supabase Setup

TaskFlow automatically uses `localStorage` when Supabase credentials are not configured, so the app works immediately without backend setup.

To enable multi-device persistence and Supabase Authentication:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and execute `supabase/schema.sql`.
3. Copy your Project URL and `anon` public key from **Project Settings -> API**.
4. Set the following environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
5. Restart the development server. TaskFlow will automatically display Sign Up / Sign In screens and sync all tasks and categories via Supabase with Row Level Security enabled.
