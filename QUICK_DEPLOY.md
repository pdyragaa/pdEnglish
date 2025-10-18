# 🚀 Szybkie wdrożenie pdEnglish na Vercel

## Krok 1: Przygotowanie

Aplikacja jest już gotowa! Masz lokalne repozytorium Git z wszystkimi plikami.

## Krok 2: Utwórz repozytorium GitHub

1. Idź na [github.com/new](https://github.com/new)
2. Nazwa: `pdEnglish`
3. Opis: `Personal English Learning PWA`
4. Public repository
5. **NIE** inicjalizuj z README (już mamy)
6. Kliknij "Create repository"

## Krok 3: Połącz z GitHub

```bash
cd ~/Desktop/pdEnglish
git remote add origin https://github.com/TWOJA_NAZWA/pdEnglish.git
git branch -M main
git push -u origin main
```

## Krok 4: Wdróż na Vercel

### Opcja A: Przez przeglądarkę (ŁATWIEJSZE)

1. Idź na [vercel.com](https://vercel.com)
2. Kliknij "New Project"
3. Importuj repozytorium `pdEnglish` z GitHub
4. Dodaj zmienne środowiskowe:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_DEEPSEEK_API_KEY=sk-bb4172be4c4c4dfba576cfe7f5485cad
   VITE_LIBRETRANSLATE_URL=https://libretranslate.com
   ```
5. Kliknij "Deploy"

### Opcja B: Przez CLI

```bash
cd ~/Desktop/pdEnglish
vercel login
vercel --prod
```

## Krok 5: Skonfiguruj Supabase

1. Idź na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. W SQL Editor uruchom plik `supabase/migrations/001_initial_schema.sql`
4. Skopiuj URL i klucz API
5. Dodaj je do zmiennych środowiskowych w Vercel

## 🎉 Gotowe!

Twoja aplikacja będzie dostępna pod adresem:
`https://pdenglish.vercel.app`

## 📱 Instalacja PWA

Po wdrożeniu:
1. Odwiedź swoją stronę
2. Kliknij przycisk "Install" w pasku adresu
3. Aplikacja zostanie zainstalowana jak natywna aplikacja!

## 🔄 Automatyczne wdrożenia

Każdy push do `main` branch automatycznie wdraża nową wersję.
