import { defineMiddleware } from "astro:middleware";

import { createSupabaseServerClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  // Create Supabase client with automatic cookie management
  const supabase = createSupabaseServerClient(context.cookies);
  context.locals.supabase = supabase;

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Add user and session to context
  context.locals.user = session?.user ?? null;
  context.locals.session = session;

  // Lista chronionych tras (wymagają logowania)
  const protectedRoutes = ["/trips"];
  const isProtectedRoute = protectedRoutes.some((route) => context.url.pathname.startsWith(route));

  // Jeśli chroniona trasa i brak sesji → redirect do logowania
  if (isProtectedRoute && !session) {
    return context.redirect("/login?message=unauthorized");
  }

  // Lista tras tylko dla niezalogowanych (login, register, home)
  const authRoutes = ["/login", "/register", "/"];
  const isAuthRoute = authRoutes.some((route) => context.url.pathname === route);

  // Jeśli trasa auth i użytkownik zalogowany → redirect do /trips
  if (isAuthRoute && session) {
    return context.redirect("/trips");
  }

  return next();
});
