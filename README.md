# pdEnglish - Personal English Learning PWA

A Progressive Web App for learning English with Polish-English translation, vocabulary management, AI-generated sentence variations, and spaced repetition testing.

## Features

- **Translation**: Polish ↔ English translation using LibreTranslate API
- **Vocabulary Management**: Save, organize, and manage vocabulary with custom categories
- **AI Sentence Generation**: Generate contextual sentence variations using DeepSeek API
- **Spaced Repetition**: Anki-style flashcards with SM-2 algorithm for optimal learning
- **PWA Support**: Installable on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Translation**: LibreTranslate API
- **AI**: DeepSeek API
- **Styling**: Tailwind CSS
- **State Management**: Zustand + TanStack Query
- **PWA**: vite-plugin-pwa

## Setup Instructions

### 1. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. In the SQL Editor, run the migration from `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from Settings → API

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_DEEPSEEK_API_KEY=sk-bb4172be4c4c4dfba576cfe7f5485cad
VITE_LIBRETRANSLATE_URL=https://libretranslate.com
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## Database Schema

- **categories**: Vocabulary categories (id, name, created_at)
- **vocabulary**: Words and phrases (id, polish, english, category_id, created_at)
- **sentences**: AI-generated sentence variations (id, vocabulary_id, sentence_english, sentence_polish, created_at)
- **reviews**: Spaced repetition data (id, vocabulary_id, ease_factor, interval, repetitions, next_review, last_reviewed)

## Usage

1. **Translator**: Enter Polish or English text to translate and save to vocabulary
2. **Vocabulary**: View, edit, and organize your saved words
3. **Categories**: Create and manage vocabulary categories
4. **Practice**: Review vocabulary using spaced repetition flashcards

## API Keys

- **DeepSeek API**: Already configured with provided key
- **LibreTranslate**: Free service, no API key required

## Deployment

### Automatic Deployment (Recommended)
This project is configured for automatic deployment with GitHub Actions and Vercel:

1. **Push to main branch** → Automatic deployment to production
2. **Create Pull Request** → Preview deployment
3. **CI/CD Pipeline** → Automatic testing and building

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup instructions.

### Manual Deployment
The app can also be deployed to:
- Vercel
- Netlify  
- GitHub Pages

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License