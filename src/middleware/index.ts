import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  // Get environment variables from Cloudflare runtime
  const env = context.locals.runtime?.env as { SUPABASE_URL?: string; SUPABASE_KEY?: string } | undefined;

  // Create Supabase client with automatic cookie management
  const supabase = createSupabaseServerClient(context.cookies, env);
  context.locals.supabase = supabase;

  // Get current session and user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get user securely using getUser() instead of using session.user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Add user and session to context
  context.locals.user = user;
  context.locals.session = session;

  // Lista chronionych tras (wymagają logowania)
  const protectedRoutes = ["/trips"];
  const isProtectedRoute = protectedRoutes.some((route) => context.url.pathname.startsWith(route));

  // Jeśli chroniona trasa i brak użytkownika → redirect do logowania
  if (isProtectedRoute && !user) {
    return context.redirect("/login?message=unauthorized");
  }

  // Lista tras tylko dla niezalogowanych (login, register, home)
  const authRoutes = ["/login", "/register", "/"];
  const isAuthRoute = authRoutes.some((route) => context.url.pathname === route);

  // Jeśli trasa auth i użytkownik zalogowany → redirect do /trips
  if (isAuthRoute && user) {
    return context.redirect("/trips");
  }

  return next();
});
