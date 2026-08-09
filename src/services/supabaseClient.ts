import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "https://whixmdlslmlqrrhskadr.supabase.co").trim().replace(/\/$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoaXhtZGxzbG1scXJyaHNrYWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNzQyOTAsImV4cCI6MjA4ODY1MDI5MH0.rsHnlNxWsDQkuExAwZ6XOgUzHG3ncmYvEusQ48u_9RA").trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
