import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient as SupabaseClientBase } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export type SupabaseClient = SupabaseClientBase<Database>;

/**
 * Creates a Supabase client for server-side rendering with automatic cookie management
 * @param cookies - Astro cookies object for managing session tokens
 * @returns Configured Supabase client with SSR support
 */
export function createSupabaseServerClient(cookies: AstroCookies): SupabaseClient {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(key: string) {
        return cookies.get(key)?.value;
      },
      set(key: string, value: string, options: CookieOptions) {
        cookies.set(key, value, options);
      },
      remove(key: string, options: CookieOptions) {
        cookies.delete(key, options);
      },
    },
  });
}
