# 🚀 WDROŻENIE PDENGLISH - KROK PO KROKU

## ✅ Co masz już gotowe:
- ✅ Kompletna aplikacja React + TypeScript
- ✅ PWA z manifestem i service worker
- ✅ Wszystkie komponenty (Translator, Vocabulary, Practice, Categories)
- ✅ Integracja z DeepSeek API (klucz już skonfigurowany)
- ✅ Algorytm spaced repetition (SM-2)
- ✅ Responsywny design z Tailwind CSS
- ✅ Repozytorium Git z commitami

## 🎯 CO TERAZ ZROBIĆ:

### 1. GitHub Repository (2 minuty)
```bash
# Idź na github.com/new i utwórz repozytorium "pdEnglish"
# Potem wykonaj:
cd ~/Desktop/pdEnglish
git remote add origin https://github.com/TWOJA_NAZWA/pdEnglish.git
git push -u origin main
```

### 2. Supabase Database (3 minuty)
1. Idź na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. W SQL Editor wklej zawartość pliku `supabase/migrations/001_initial_schema.sql`
4. Skopiuj URL i anon key z Settings → API

### 3. Vercel Deployment (2 minuty)
1. Idź na [vercel.com](https://vercel.com)
2. Importuj repozytorium `pdEnglish`
3. Dodaj zmienne środowiskowe:
   ```
   VITE_SUPABASE_URL=twój_supabase_url
   VITE_SUPABASE_ANON_KEY=twój_supabase_key
   VITE_DEEPSEEK_API_KEY=sk-bb4172be4c4c4dfba576cfe7f5485cad
   VITE_LIBRETRANSLATE_URL=https://libretranslate.com
   ```
4. Deploy!

## 🎉 REZULTAT:
- Aplikacja będzie dostępna pod adresem: `https://pdenglish.vercel.app`
- Można ją zainstalować jako PWA na telefon/komputer
- Automatyczne wdrożenia przy każdym push do GitHub

## 🔧 FUNKCJE APLIKACJI:
- ✅ Tłumacz PL ↔ EN (LibreTranslate)
- ✅ Zarządzanie słownictwem z kategoriami
- ✅ Generowanie zdań AI (DeepSeek)
- ✅ System powtórek Anki (SM-2)
- ✅ PWA - działa offline po instalacji

**Czas całkowity: ~7 minut** ⏱️
