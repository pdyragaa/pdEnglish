import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Fade,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { translatePolishToEnglish, translateEnglishToPolish } from '../lib/translate';
import { generateWordInfo, type WordInfo } from '../lib/deepseek';
import { db } from '../lib/supabase';
import { useVocabularyStore } from '../store/useVocabularyStore';

export function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

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

  const handleShowMoreInfo = async () => {
    if (!inputText.trim() || !translatedText.trim()) return;
    
    // Check if input is a single word (no spaces)
    if (inputText.trim().includes(' ')) {
      setError('Word info is only available for single words, not phrases');
      return;
    }

    setIsLoadingInfo(true);
    setError(null);
    setWordInfo(null);

    try {
      const word = selectedLanguage === 'en' ? inputText.trim() : translatedText.trim();
      const polishTranslation = selectedLanguage === 'en' ? translatedText.trim() : inputText.trim();
      
      const info = await generateWordInfo(word, polishTranslation);
      setWordInfo(info);
      setShowMoreInfo(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load word information');
      }
    } finally {
      setIsLoadingInfo(false);
    }
  };


  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setError(null);
    setSaveMessage(null);
    setWordInfo(null);
    setShowMoreInfo(false);

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
      <Stack spacing={2}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid rgba(255,255,255,0.08)',
            background:
              'linear-gradient(140deg, rgba(63,214,193,0.16) 0%, rgba(63,214,193,0.05) 50%, rgba(20,24,32,0.85) 100%)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeRoundedIcon sx={{ color: 'primary.light', fontSize: 18 }} />
            <Typography variant="h5" fontWeight={700}>
              Translate & Save
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 80 }}>
                Direction:
              </Typography>
              <ToggleButtonGroup value={selectedLanguage} exclusive onChange={handleDirectionChange} color="primary" size="small">
                <ToggleButton value="pl">🇵🇱 PL→EN</ToggleButton>
                <ToggleButton value="en">🇬🇧 EN→PL</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <TextField
              label={selectedLanguage === 'pl' ? 'Polish text' : 'English text'}
              placeholder={selectedLanguage === 'pl' ? 'Wpisz polskie zdanie…' : 'Enter English sentence…'}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
              multiline
              minRows={3}
              maxRows={5}
              fullWidth
              size="small"
            />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
                startIcon={<SwapHorizRoundedIcon />}
                size="small"
                sx={{ flex: 1 }}
              >
                {isTranslating ? 'Translating…' : 'Translate'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleCopy}
                disabled={!translatedText}
                startIcon={<ContentCopyRoundedIcon fontSize="small" />}
                size="small"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Stack>

            {translatedText && !inputText.trim().includes(' ') && (
              <Button
                variant="outlined"
                onClick={handleShowMoreInfo}
                disabled={isLoadingInfo}
                startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                {isLoadingInfo ? 'Loading…' : 'Show More Info'}
              </Button>
            )}

            {translatedText && (
              <Fade in timeout={300}>
                <Box sx={{ p: 2, bgcolor: 'rgba(63,214,193,0.08)', borderRadius: 2, border: '1px solid rgba(63,214,193,0.2)' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedLanguage === 'pl' ? 'English translation:' : 'Polish translation:'}
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {translatedText}
                  </Typography>
                </Box>
              </Fade>
            )}

            {saveMessage && (
              <Alert severity={saveMessage.includes('Saved') ? 'success' : 'warning'} sx={{ mt: 1 }}>
                {saveMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}

            {wordInfo && showMoreInfo && (
              <Fade in timeout={300}>
                <Box sx={{ mt: 2 }}>
                  {/* Definition Section */}
                  <Paper sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(20,24,32,0.8)' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h6" sx={{ color: 'primary.light' }}>📖</Typography>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Definicja:
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary">
                      {wordInfo.definition}
                    </Typography>
                  </Paper>

                  {/* Examples Section */}
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)', bgcolor: 'rgba(20,24,32,0.8)' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'primary.light' }}>💬</Typography>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        Przykłady:
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      {wordInfo.examples.map((example, index) => (
                        <Box key={index} sx={{ p: 1.5, bgcolor: 'rgba(63,214,193,0.05)', borderRadius: 1, border: '1px solid rgba(63,214,193,0.1)' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {index + 1}.
                          </Typography>
                          <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                            {example.english}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {example.polish}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>
              </Fade>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Fade>
  );
}
