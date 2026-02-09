import { createClient } from "@supabase/supabase-js";

// Use the provided Supabase credentials directly
const supabaseUrl = "https://ttxxxbkeqvaourawxipg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eHh4YmtlcXZhb3VyYXd4aXBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzg5MTksImV4cCI6MjA4NjAxNDkxOX0.Kqcqa2Zb4RuMjJ_mrgykEnTVZM9VdHKAMCEiuG1MEs8";

console.log('Using hardcoded Supabase config:', { supabaseUrl: supabaseUrl.substring(0, 20) + '...' });

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { createClient };

