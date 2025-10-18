# 🚀 Quick Start - PD English App

## ⚡ Szybkie uruchomienie (5 minut)

### 1. Lokalny development
```bash
# Sklonuj repozytorium
git clone https://github.com/TWOJ-USERNAME/pdEnglish.git
cd pdEnglish

# Zainstaluj zależności
npm install

# Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Edytuj .env z własnymi danymi Supabase

# Uruchom aplikację
npm run dev
```

### 2. Automatyczny deployment
```bash
# Deploy na Vercel (wymaga konfiguracji)
npm run deploy
```

## 🔧 Konfiguracja (15 minut)

### A. Supabase (już skonfigurowane)
- ✅ Baza danych utworzona
- ✅ Tabele skonfigurowane
- ✅ RLS włączony

### B. GitHub + Vercel
1. **Utwórz repozytorium GitHub**
2. **Skonfiguruj Vercel** (patrz `VERCEL_SETUP.md`)
3. **Dodaj GitHub Secrets** (patrz `DEPLOYMENT_GUIDE.md`)

## 📱 Funkcje aplikacji

- 🔤 **Tłumacz** - polsko-angielskie tłumaczenia
- 📚 **Słownictwo** - zarządzanie słówkami
- 📝 **Zdania** - AI generuje przykłady
- 🧠 **Powtórki** - spaced repetition
- 📱 **PWA** - zainstaluj na telefonie

## 🌐 Linki

- **Lokalnie**: http://localhost:5173
- **Produkcja**: https://pdenglish.vercel.app (po deploymencie)
- **GitHub**: https://github.com/TWOJ-USERNAME/pdEnglish
- **Vercel**: https://vercel.com/dashboard

## 🆘 Pomoc

- **Supabase**: `SUPABASE_SETUP.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Vercel**: `VERCEL_SETUP.md`

## 🎯 Status

- ✅ **Backend**: Supabase (baza danych)
- ✅ **Frontend**: React + Vite + TypeScript
- ✅ **Styling**: Tailwind CSS
- ✅ **PWA**: Offline support
- ✅ **CI/CD**: GitHub Actions + Vercel
- ✅ **Deployment**: Automatyczny

**Gotowe do użycia!** 🎉
