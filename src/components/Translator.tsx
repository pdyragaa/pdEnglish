import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Fade,
  Grid,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { translatePolishToEnglish, translateEnglishToPolish } from '../lib/translate';
import { db } from '../lib/supabase';
import { useVocabularyStore } from '../store/useVocabularyStore';

export function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { selectedLanguage, setSelectedLanguage, setError, error } = useVocabularyStore();

  useEffect(() => {
    const ensureDefaultCategory = async () => {
      try {
        const categories = await db.categories.getAll();
        let generalCategory = categories.find((cat) => cat.name === 'General');
        if (!generalCategory) {
          generalCategory = await db.categories.create('General');
        }
        setDefaultCategoryId(generalCategory.id);
      } catch (err) {
        console.error('Failed to ensure default category', err);
        setError('Failed to prepare default category');
      }
    };

    void ensureDefaultCategory();
  }, [setError]);

  const directionLabel = useMemo(() => (selectedLanguage === 'pl' ? 'Polish → English' : 'English → Polish'), [selectedLanguage]);

  const handleDirectionChange = (_: React.MouseEvent<HTMLElement>, value: 'pl' | 'en' | null) => {
    if (!value || value === selectedLanguage) return;
    setSelectedLanguage(value);
    // Swap fields for convenience
    setInputText(translatedText);
    setTranslatedText('');
    setSaveMessage(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyErr) {
      console.warn(copyErr);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setSaveMessage(null);
    setError(null);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setSaveMessage(null);

    try {
      const result =
        selectedLanguage === 'en'
          ? await translateEnglishToPolish(inputText)
          : await translatePolishToEnglish(inputText);

      setTranslatedText(result);
      await autoSaveToVocabulary(inputText, result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Translation failed');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const autoSaveToVocabulary = async (originalText: string, translation: string) => {
    if (!defaultCategoryId) return;

    try {
      const existingVocabulary = await db.vocabulary.getAll();
      const alreadyExists = existingVocabulary.some(
        (vocab) =>
          (vocab.polish === originalText && vocab.english === translation) ||
          (vocab.polish === translation && vocab.english === originalText)
      );

      if (alreadyExists) {
        setSaveMessage('Word already exists in vocabulary');
        return;
      }

      const vocabulary = {
        polish: selectedLanguage === 'en' ? translation : originalText,
        english: selectedLanguage === 'en' ? originalText : translation,
        category_id: defaultCategoryId,
      };

      await db.vocabulary.create(vocabulary);
      setSaveMessage('Saved to vocabulary automatically!');
      setTimeout(() => setSaveMessage(null), 2500);
    } catch (err) {
      console.error('Failed to auto-save vocabulary:', err);
      setSaveMessage('Failed to save to vocabulary');
    }
  };

  return (
    <Fade in timeout={500}>
      <Stack spacing={6}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'linear-gradient(140deg, rgba(63,214,193,0.16) 0%, rgba(63,214,193,0.05) 50%, rgba(20,24,32,0.85) 100%)',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AutoAwesomeRoundedIcon sx={{ color: 'primary.light' }} />
              <Typography variant="caption" color="primary.light" fontWeight={600}>
                AI assisted translation
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight={700}>
              Translate, store and remember effortlessly.
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600}>
              Automatic saving keeps your vocabulary collection in sync. Switch direction anytime and reuse existing translations instantly.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                startIcon={<TranslateRoundedIcon />}
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
              >
                {isTranslating ? 'Translating…' : 'Translate current text'}
              </Button>
              <Button variant="outlined" onClick={handleClear} disabled={!inputText}>
                Clear input
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Translation direction
                  </Typography>
                  <ToggleButtonGroup value={selectedLanguage} exclusive onChange={handleDirectionChange} color="primary">
                    <ToggleButton value="pl">🇵🇱 Polish → English</ToggleButton>
                    <ToggleButton value="en">🇬🇧 English → Polish</ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="text.secondary">
                    {directionLabel}
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  <TextField
                    label={selectedLanguage === 'pl' ? 'Polish text' : 'English text'}
                    placeholder={selectedLanguage === 'pl' ? 'Wpisz polskie zdanie…' : 'Enter English sentence…'}
                    value={inputText}
                    onChange={(event) => setInputText(event.target.value)}
                    multiline
                    minRows={6}
                    maxRows={8}
                    fullWidth
                  />
                  <Typography variant="caption" color="text.secondary">
                    {inputText.length} / 500 characters
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isTranslating}
                    startIcon={<SwapHorizRoundedIcon />}
                  >
                    {isTranslating ? 'Translating…' : 'Translate now'}
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleCopy}
                    disabled={!translatedText}
                    startIcon={<ContentCopyRoundedIcon fontSize="small" />}
                  >
                    {copied ? 'Copied!' : 'Copy translation'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {saveMessage && (
              <Alert severity={saveMessage.includes('Saved') ? 'success' : 'warning'} sx={{ mt: 2 }}>
                {saveMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 4,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.06)',
                minHeight: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedLanguage === 'pl' ? 'English translation' : 'Polish translation'}
                </Typography>
              </Stack>

              <Box flexGrow={1} display="flex" alignItems="center" justifyContent="center">
                {translatedText ? (
                  <Fade in timeout={300}>
                    <Typography variant="h4" fontWeight={600} textAlign="center">
                      {translatedText}
                    </Typography>
                  </Fade>
                ) : (
                  <Stack spacing={1} alignItems="center" color="text.secondary">
                    <TranslateRoundedIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                    <Typography variant="body2">Your translation will appear here.</Typography>
                  </Stack>
                )}
              </Box>

              <Divider />

              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: translatedText ? 'success.main' : 'text.disabled',
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {translatedText ? 'Saved to vocabulary' : 'Awaiting translation'}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Fade>
  );
}
