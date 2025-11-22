<!-- fb8055f4-d29d-4912-8bea-278f3954829d a945144a-eecc-44f4-b044-7ff040705a56 -->
# Skompresuj Ekran Review

## Problem

Ekran Review zajmuje dużo przestrzeni z powodu:

1. Dużego paddingu i marginesów (p: 3, mb: 3, spacing: 3)
2. Dużych nagłówków (h3, h4, h6)
3. Rozdzielonych sekcji (Dashboard, Category Selection, Session Size, Debug Panel)
4. Dużych Grid itemów ze statystykami
5. Dużo białej przestrzeni między elementami

## Rozwiązanie

### 1. Zmniejszyć Padding i Marginesy

- `p: 3` → `p: 1.5` lub `p: 2`
- `mb: 3` → `mb: 1.5` lub `mb: 2`
- `spacing: 3` → `spacing: 1.5` lub `spacing: 2`
- `mt: 3` → `mt: 1.5` lub `mt: 2`
- Grid spacing z `spacing={3}` → `spacing={1.5}` lub `spacing={2}`

### 2. Zmniejszyć Rozmiary Czcionek

- `variant="h4"` → `variant="h5"` lub `variant="h6"`
- `variant="h3"` (statystyki) → `variant="h4"` lub `variant="h5"`
- `variant="h6"` (sekcje) → `variant="subtitle1"` lub `variant="subtitle2"`
- `variant="body1"` → `variant="body2"`

### 3. Połączyć i Skompresować Sekcje

**Obecnie**: Rozdzielone sekcje z dużymi nagłówkami

```tsx
<Box sx={{ mt: 3, mb: 2 }}>
  <Typography variant="h6">Review Mode</Typography>
  <Stack>...</Stack>
</Box>

<Box sx={{ mt: 3, mb: 2 }}>
  <Typography variant="h6">Session Size</Typography>
  <Stack>...</Stack>
</Box>
```

**Nowa implementacja**: Inline labels z Chips w jednej linii

```tsx
<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
  <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Mode:</Typography>
  <Stack direction="row" spacing={1} flexWrap="wrap">
    {/* Category chips */}
  </Stack>
</Stack>

<Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
  <Typography variant="subtitle2" sx={{ minWidth: 100 }}>Size:</Typography>
  <Stack direction="row" spacing={1} flexWrap="wrap">
    {/* Size chips */}
  </Stack>
</Stack>
```

### 4. Skompresować Grid ze Statystykami

- Zmniejszyć padding w kartach: `p: 2` → `p: 1` lub `p: 1.5`
- Zmniejszyć rozmiar liczb: `h3` → `h5` lub `h6`
- Zmniejszyć rozmiar opisów: `body2` → `caption`
- Opcjonalnie: użyć `xs={6} sm={3}` zamiast `xs={12} sm={6} md={3}` dla lepszego wykorzystania przestrzeni na mobile

### 5. Zmniejszyć Review Dashboard Container

- Zmniejszyć padding głównego boxa: `p: 3` → `p: 2`
- Zmniejszyć borderRadius: `borderRadius: 3` → `borderRadius: 2`
- Zmniejszyć marginesy między elementami

### 6. Skompresować Debug Panel

- Zmniejszyć padding: `p: 2` → `p: 1.5`
- Zmniejszyć rozmiary czcionek
- Opcjonalnie: użyć mniejszych Grid itemów

## Szczegóły Implementacji

### Zmiany w ReviewSession.tsx:

1. **Review Dashboard Box**:

   - `p: 3` → `p: 2`
   - `mb: 3` → `mb: 2`
   - `borderRadius: 3` → `borderRadius: 2`

2. **Nagłówki**:

   - `variant="h4"` → `variant="h5"`
   - `variant="body1"` → `variant="body2"`
   - `sx={{ mb: 3 }}` → `sx={{ mb: 1.5 }}`

3. **Grid ze statystykami**:

   - `spacing={3}` → `spacing={1.5}`
   - `p: 2` → `p: 1.5`
   - `variant="h3"` → `variant="h5"`
   - `variant="body2"` → `variant="caption"`

4. **Sekcje (Review Mode, Session Size)**:

   - `sx={{ mt: 3, mb: 2 }}` → `sx={{ mt: 1.5, mb: 1 }}`
   - `variant="h6"` → `variant="subtitle1"`
   - `sx={{ mb: 2 }}` → `sx={{ mb: 1 }}`
   - `spacing={2}` → `spacing={1}`

5. **Debug Panel**:

   - `p: 2` → `p: 1.5`
   - Zmniejszyć spacing w Grid
   - Zmniejszyć rozmiary czcionek

## Pliki do Zmiany

- `src/components/ReviewSession.tsx` - główny komponent Review

## Korzyści

- ✅ Więcej treści widocznej na ekranie bez scrollowania
- ✅ Kompaktowy, profesjonalny wygląd
- ✅ Zachowana czytelność
- ✅ Lepsza gęstość informacji
- ✅ Szybszy dostęp do wszystkich funkcji

### To-dos

- [ ] Rewrite getReviewsDue query to properly handle one-to-one relationships and return objects instead of arrays
- [ ] Add comprehensive error handling and logging throughout the reviews module
- [ ] Add logging to ReviewSession.tsx to verify the fixed data structure works correctly
- [ ] Verify the fix works for all category filters (all, uncategorized, specific categories)