# Practice Session Design (FSRS)

The practice experience now uses FSRS (Free Spaced Repetition Scheduler) to schedule vocabulary reviews. This document outlines the architecture and UI.

## Architecture Overview

- `usePracticeSession` hook builds a queue combining due reviews and unscheduled vocabulary
- `PracticePage` renders stats header, flashcard, and rating controls
- Supporting UI components live under `src/components/practice`
  - `SessionHeader` – displays session stats and refresh control
  - `RatingButtons` – renders FSRS options with interval previews
  - `EmptyState` – friendly messaging when no cards are due
  - `Flashcard` displays question/answer content and skip option

## Queue Assembly

1. Fetch due reviews via `db.reviews.getDueForReview()`
2. Fetch all vocabulary
3. Create cards prioritising due reviews, then append vocabulary without reviews

## Rating Flow

- Rating maps to FSRS rating: Again=1, Hard=2, Good=3, Easy=4
- We compute the next interval and FSRS state; persist via `db.reviews.upsert`
- Cards with Again/Hard are repeated in-session by re-inserting after ~2 cards

## UI States

- **Loading**: spinner with status message
- **Empty**: suggests adding/syncing vocabulary
- **Active**: flashcard displayed; answer reveal and rating
- **Complete**: success banner after queue finished

## Notes

- Ensure Supabase credentials are configured
- `reviews.fsrs_state` persists FSRS parameters; `next_review` used for due queries
- Keyboard: 1 Again, 2 Hard, 3 Good, 4 Easy; Space to reveal
