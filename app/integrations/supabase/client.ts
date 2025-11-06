import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://athdezxagobqktizmsgu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0aGRlenhhZ29icWt0aXptc2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mzc4MzgsImV4cCI6MjA3ODAxMzgzOH0.hFnhLWSAviexpKC3pyEQYBK06YsrS1-4pKPt1VPcvfg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
