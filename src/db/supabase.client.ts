import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient as SupabaseClientBase } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

import type { Database } from "../db/database.types.ts";

export type SupabaseClient = SupabaseClientBase<Database>;

/**
 * Creates a Supabase client for server-side rendering with automatic cookie management
 * @param cookies - Astro cookies object for managing session tokens
 * @param env - Environment variables from Cloudflare runtime
 * @returns Configured Supabase client with SSR support
 */
export function createSupabaseServerClient(
  cookies: AstroCookies,
  env?: { SUPABASE_URL?: string; SUPABASE_KEY?: string }
): SupabaseClient {
  // Try to get from runtime env first (Cloudflare), fallback to import.meta.env (build time)
  const supabaseUrl = env?.SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const supabaseAnonKey = env?.SUPABASE_KEY || import.meta.env.SUPABASE_KEY;

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
