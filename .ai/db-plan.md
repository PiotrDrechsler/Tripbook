# Prosty schemat bazy danych Tripbook

## 1. Tabele

### 1.1 users (Supabase Auth)

- **id**: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **email**: TEXT NOT NULL UNIQUE
- **password_hash**: TEXT NOT NULL
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

> Uwaga: Tabela zarządzana przez Supabase Auth, migracje nie są potrzebne w projekcie.

### 1.2 trips

- **id**: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- **user_id**: UUID NOT NULL
  - FK → auth.users(id) ON DELETE CASCADE
- **name**: VARCHAR(100) NOT NULL
- **description**: TEXT
- **map_url**: TEXT NOT NULL
  - CHECK (map_url LIKE '%mapy.com%')
- **trip_date**: DATE
- **created_at**: TIMESTAMPTZ NOT NULL DEFAULT now()
- **updated_at**: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje

- Jedno konto użytkownika może mieć wiele wycieczek:
  - `users.id` → `trips.user_id`

## 3. Indeksy

- **trips**: indeks B-tree na kolumnie `user_id` (przyspiesza pobieranie listy wycieczek dla danego użytkownika)

## 4. Uwagi

- Prosta baza na start: tylko tabele `users` i `trips`.
- W przyszłości można rozbudować o:
  - Udostępnianie tras innym użytkownikom (np. tabela `shared_trips`)
  - Tagi (`tags` + `trip_tags`)
  - Audyt zmian (`trip_audit`)
  - Polityki RLS dla jeszcze większego bezpieczeństwa
