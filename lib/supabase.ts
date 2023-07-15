// ./lib/supbase.ts

import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { Database } from "../db_types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl =
  Constants?.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
const supabaseAnonKey =
  Constants?.expoConfig?.extra?.supabaseAnonKey ||
  process.env.SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
