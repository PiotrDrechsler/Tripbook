# Test współrzędnych - Checklist

## ✅ Krok 1: Sprawdź czy migracja została zastosowana

- [x] Uruchomiono `supabase db reset`
- [x] Migracja `20251108195656_add_coordinates_to_trips.sql` została zastosowana

## ✅ Krok 2: Sprawdź czy API endpoint istnieje

- [x] Plik `src/pages/api/expand-mapy-link.ts` istnieje

## ⚠️ Krok 3: ZRESTARTUJ SERWER DEWELOPERSKI

**TO JEST KLUCZOWE!**

1. Zatrzymaj obecny serwer (Ctrl+C w terminalu gdzie działa `npm run dev`)
2. Uruchom ponownie: `npm run dev`
3. Poczekaj aż serwer się uruchomi

## 🧪 Krok 4: Testuj funkcjonalność

### Test 1: Sprawdź API endpoint

Otwórz w przeglądarce DevTools (F12) i w konsoli wpisz:

```javascript
fetch("/api/expand-mapy-link", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ shortUrl: "https://mapy.com/s/hokakucoto" }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Oczekiwany wynik:**

```json
{
  "latitude": 49.2794949,
  "longitude": 19.7653139,
  "finalUrl": "..."
}
```

### Test 2: Dodaj nową wycieczkę

1. Przejdź do `/trips`
2. Kliknij "Dodaj trasę" (lub podobny przycisk)
3. Wklej link: `https://mapy.com/s/hokakucoto`
4. Poczekaj ~1 sekundę
5. **Powinien pojawić się zielony badge z współrzędnymi**

### Test 3: Sprawdź czy współrzędne się zapisują

1. Wypełnij formularz (nazwa, opis)
2. Kliknij "Zapisz"
3. Otwórz szczegóły wycieczki
4. **Sprawdź czy w sekcji "Mapa" są współrzędne**

### Test 4: Sprawdź listę

1. Wróć do `/trips`
2. **Sprawdź czy na kafelku wycieczki są współrzędne pod datą**

## 🐛 Jeśli nadal nie działa

### Sprawdź w DevTools (F12):

1. **Zakładka Console** - czy są błędy?
2. **Zakładka Network** - czy request do `/api/expand-mapy-link` się wykonuje?
3. **Co zwraca API?** - kliknij na request i zobacz Response

### Sprawdź bazę danych:

1. Otwórz Supabase Studio: http://127.0.0.1:54323
2. Przejdź do Table Editor
3. Otwórz tabelę `trips`
4. Sprawdź czy kolumny `latitude` i `longitude` istnieją
5. Sprawdź czy mają wartości (nie NULL)

## 📸 Co powinieneś zobaczyć:

### Na formularzu (podczas wpisywania):

```
Link do mapy *
[https://mapy.com/s/hokakucoto]

┌─────────────────────────────────────┐
│ ✓ Współrzędne: 49.2794949, 19.7653139│
│ (zielone tło)                        │
└─────────────────────────────────────┘
```

### Na liście wycieczek:

```
┌────────────────────────────────────┐
│ Nazwa wycieczki                    │
│ 📅 Utworzono: 8 listopada 2025    │
│ 📍 49.2795, 19.7653               │ ← TO POWINNO BYĆ WIDOCZNE
└────────────────────────────────────┘
```

### W szczegółach:

```
Mapa                    [Otwórz w nowej]
┌─────────────────────────────────────┐
│ 📍 Współrzędne: 49.2794949, 19.7653139│ ← TO POWINNO BYĆ WIDOCZNE
│                    [Google Maps]    │
└─────────────────────────────────────┘
```
