# pdEnglish Setup Instructions

## Quick Start

1. **Set up Supabase Database:**
   - Go to [Supabase](https://supabase.com) and create a new project
   - In the SQL Editor, run the migration from `supabase/migrations/001_initial_schema.sql`
   - Copy your project URL and anon key from Settings → API

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Update the Supabase URL and anon key in `.env`
   - The DeepSeek API key is already configured

3. **Install and Run:**
   ```bash
   npm install
   npm run dev
   ```

## Features

✅ **Translation**: Polish ↔ English with LibreTranslate  
✅ **Vocabulary Management**: Save and organize words by categories  
✅ **AI Sentence Generation**: DeepSeek API creates contextual examples  
✅ **Spaced Repetition**: Anki-style flashcards with SM-2 algorithm  
✅ **PWA Support**: Installable on desktop and mobile  

## Database Tables

- `categories`: Vocabulary categories
- `vocabulary`: Words and phrases with Polish-English pairs
- `sentences`: AI-generated sentence variations
- `reviews`: Spaced repetition tracking data

## API Keys

- **DeepSeek**: Already configured with provided key
- **LibreTranslate**: Free service, no key needed
- **Supabase**: You need to create a project and get your own keys

## Development

The app is now running at `http://localhost:5173`

You can:
1. Translate Polish ↔ English text
2. Save translations to vocabulary with categories
3. Generate AI sentence variations for each word
4. Practice with spaced repetition flashcards
5. Manage categories and vocabulary

## Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to Vercel, Netlify, or any static hosting service.
