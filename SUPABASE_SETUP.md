# 🚀 Konfiguracja Supabase - Instrukcja krok po kroku

## 1. Utwórz projekt na Supabase

1. Przejdź na [supabase.com](https://supabase.com)
2. Zaloguj się lub utwórz konto
3. Kliknij **"New Project"**
4. Wypełnij formularz:
   - **Name**: `pdEnglish`
   - **Database Password**: Wygeneruj silne hasło (zapisz je!)
   - **Region**: Wybierz najbliższą lokalizację
   - **Pricing Plan**: Free tier
5. Kliknij **"Create new project"** i poczekaj (2-3 minuty)

## 2. Pobierz dane połączenia

1. W Supabase Dashboard → **Settings** → **API**
2. Skopiuj:
   - **Project URL** (np. `https://your-project-id.supabase.co`)
   - **anon public key** (długi klucz zaczynający się od `eyJ...`)

## 3. Skonfiguruj zmienne środowiskowe

1. **Utwórz plik `.env`** w głównym katalogu:
```bash
cp .env.example .env
```

2. **Edytuj plik `.env`** i wstaw swoje dane:
```env
VITE_SUPABASE_URL=https://twoj-projekt-id.supabase.co
VITE_SUPABASE_ANON_KEY=twoj-klucz-anon
```

## 4. Połącz projekt z Supabase

```bash
npx supabase link --project-ref TWOJ-PROJECT-ID
```

Gdzie `TWOJ-PROJECT-ID` to ID Twojego projektu (z URL).

## 5. Uruchom migracje bazy danych

```bash
npx supabase db push
```

## 6. Przetestuj połączenie

```bash
node test-supabase.js
```

Jeśli wszystko działa, zobaczysz:
```
✅ Successfully connected to Supabase!
✅ Table 'categories' is accessible
✅ Table 'vocabulary' is accessible
✅ Table 'sentences' is accessible
✅ Table 'reviews' is accessible
🎉 Supabase setup is complete!
```

## 7. Uruchom aplikację

```bash
npm run dev
```

## 🔧 Rozwiązywanie problemów

### Problem: "Missing Supabase environment variables"
**Rozwiązanie**: Sprawdź czy plik `.env` istnieje i zawiera poprawne dane.

### Problem: "Invalid project ref format"
**Rozwiązanie**: Upewnij się, że używasz poprawnego Project ID z Supabase Dashboard.

### Problem: "Table not found"
**Rozwiązanie**: Uruchom migracje: `npx supabase db push`

### Problem: "Connection failed"
**Rozwiązanie**: Sprawdź czy URL i klucz API są poprawne w pliku `.env`.

## 📚 Przydatne linki

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
