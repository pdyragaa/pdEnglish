# 🚀 Deployment Guide - GitHub + Vercel

## 📋 Wymagania

1. **GitHub Repository** - kod źródłowy
2. **Vercel Account** - hosting aplikacji
3. **Supabase Project** - baza danych

## 🔧 Konfiguracja GitHub

### 1. Utwórz repozytorium na GitHub
```bash
# W katalogu projektu
git init
git add .
git commit -m "Initial commit: PD English app with Supabase"
git branch -M main
git remote add origin https://github.com/TWOJ-USERNAME/pdEnglish.git
git push -u origin main
```

### 2. Skonfiguruj GitHub Secrets
W GitHub Repository → Settings → Secrets and variables → Actions, dodaj:

- `VITE_SUPABASE_URL` = `https://fnlkqteqyxzwtwcnaxan.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- `VERCEL_TOKEN` = (token z Vercel)
- `VERCEL_ORG_ID` = (ID organizacji Vercel)
- `VERCEL_PROJECT_ID` = (ID projektu Vercel)

## 🌐 Konfiguracja Vercel

### 1. Połącz z GitHub
1. Przejdź na [vercel.com](https://vercel.com)
2. Kliknij "Import Project"
3. Wybierz repozytorium GitHub
4. Vercel automatycznie wykryje konfigurację Vite

### 2. Skonfiguruj zmienne środowiskowe
W Vercel Dashboard → Project Settings → Environment Variables:

- `VITE_SUPABASE_URL` = `https://fnlkqteqyxzwtwcnaxan.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Automatyczny deployment
Vercel automatycznie:
- ✅ Deployuje przy każdym push do `main`
- ✅ Tworzy preview dla pull requestów
- ✅ Używa `vercel.json` do konfiguracji

## 🔄 Workflow CI/CD

### GitHub Actions
- **Test** - uruchamia się przy każdym push/PR
- **Deploy** - uruchamia się tylko przy push do `main`

### Kroki w pipeline:
1. **Checkout** - pobiera kod
2. **Setup Node.js** - konfiguruje środowisko
3. **Install** - instaluje zależności
4. **Lint** - sprawdza kod
5. **Type Check** - sprawdza typy TypeScript
6. **Build** - buduje aplikację
7. **Deploy** - wdraża na Vercel

## 📝 Instrukcje dla deweloperów

### Lokalny development:
```bash
# 1. Sklonuj repozytorium
git clone https://github.com/TWOJ-USERNAME/pdEnglish.git
cd pdEnglish

# 2. Zainstaluj zależności
npm install

# 3. Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Edytuj .env z własnymi danymi

# 4. Uruchom aplikację
npm run dev
```

### Dodawanie nowych funkcji:
```bash
# 1. Utwórz nową gałąź
git checkout -b feature/nazwa-funkcji

# 2. Wprowadź zmiany
# ... kod ...

# 3. Zatwierdź zmiany
git add .
git commit -m "feat: dodaj nową funkcję"

# 4. Wyślij do GitHub
git push origin feature/nazwa-funkcji

# 5. Utwórz Pull Request
# GitHub automatycznie utworzy preview na Vercel
```

## 🎯 Rezultat

Po skonfigurowaniu:
- ✅ **Automatyczny deploy** przy każdym push do `main`
- ✅ **Preview deployments** dla pull requestów
- ✅ **CI/CD pipeline** z testami i lintowaniem
- ✅ **Środowisko produkcyjne** na Vercel
- ✅ **Baza danych** na Supabase

## 🔗 Linki

- **GitHub Repository**: `https://github.com/TWOJ-USERNAME/pdEnglish`
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Supabase Dashboard**: `https://supabase.com/dashboard`
- **Live App**: `https://pdenglish.vercel.app` (po deploymencie)
