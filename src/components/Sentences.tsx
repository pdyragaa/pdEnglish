import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  InputAdornment,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BookRoundedIcon from '@mui/icons-material/BookRounded';

import { db } from '../lib/supabase';
import type { Sentence, Vocabulary, Category } from '../types';

const ToolbarWrapper = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(3),
  border: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(20,24,32,0.8)',
}));

const GridWrapper = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.05)',
  backgroundColor: 'rgba(20,24,32,0.75)',
  '& .MuiDataGrid-root': {
    border: 'none',
    color: theme.palette.text.primary,
    '--DataGrid-containerBackground': 'transparent',
  },
  '& .MuiDataGrid-row': {
    '&.Mui-selected': {
      backgroundColor: 'rgba(63,214,193,0.12)',
    },
  },
  '& .MuiDataGrid-cell': {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
}));

interface SentenceWithVocabulary extends Sentence {
  vocabulary?: Vocabulary & { category?: Category };
}

interface EditingState {
  sentence_english: string;
  sentence_polish: string;
}

export function Sentences() {
  const [sentences, setSentences] = useState<SentenceWithVocabulary[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<string | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string; state: EditingState } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sentencesData, vocabularyData] = await Promise.all([
          db.sentences.getAll(),
          db.vocabulary.getAll(),
        ]);
        setSentences(sentencesData);
        setVocabulary(vocabularyData);
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Failed to load sentences. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return sentences
      .filter((item) => (selectedVocabulary ? item.vocabulary_id === selectedVocabulary : true))
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.sentence_english.toLowerCase().includes(term) ||
          item.sentence_polish.toLowerCase().includes(term) ||
          item.vocabulary?.english.toLowerCase().includes(term) ||
          item.vocabulary?.polish.toLowerCase().includes(term)
        );
      })
      .map((item) => ({
        id: item.id,
        sentence_english: item.sentence_english,
        sentence_polish: item.sentence_polish,
        vocabulary_word: item.vocabulary ? `${item.vocabulary.polish} / ${item.vocabulary.english}` : 'Unknown',
        category: item.vocabulary?.category?.name ?? 'Uncategorised',
        created_at: item.created_at,
      }));
  }, [sentences, selectedVocabulary, searchTerm]);

  const openEdit = useCallback((id: string) => {
    const item = sentences.find((entry) => entry.id === id);
    if (!item) return;
    setEditing({
      id,
      state: {
        sentence_english: item.sentence_english,
        sentence_polish: item.sentence_polish,
      },
    });
  }, [sentences]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'sentence_english',
        headerName: 'English Sentence',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => <Typography fontWeight={600}>{params.value as string}</Typography>,
      },
      {
        field: 'sentence_polish',
        headerName: 'Polish Translation',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => <Typography color="text.secondary">{params.value as string}</Typography>,
      },
      {
        field: 'vocabulary_word',
        headerName: 'Related Word',
        width: 180,
        renderCell: ({ value }) => (
          <Typography variant="body2" color="primary.light" fontWeight={500}>
            {value as string}
          </Typography>
        ),
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 120,
        renderCell: ({ value }) => (
          <Typography variant="caption" color="text.secondary">
            {value as string}
          </Typography>
        ),
      },
      {
        field: 'created_at',
        headerName: 'Created',
        width: 120,
        valueFormatter: ({ value }) => new Date(value as string).toLocaleDateString(),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 100,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit sentence">
              <IconButton size="small" onClick={() => openEdit(params.row.id)}>
                <EditRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete sentence">
              <IconButton size="small" color="error" onClick={() => setConfirmDelete(params.row.id)}>
                <DeleteRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [openEdit]
  );

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, state } = editing;
    try {
      const updated = await db.sentences.update(id, {
        sentence_english: state.sentence_english,
        sentence_polish: state.sentence_polish,
      });
      setSentences((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setFeedback({ type: 'success', message: 'Sentence updated successfully.' });
      setEditing(null);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to update sentence.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.sentences.delete(id);
      setSentences((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: 'success', message: 'Sentence deleted.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to delete sentence.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Get vocabulary that have sentences
  const vocabularyWithSentences = useMemo(() => {
    const vocabIds = new Set(sentences.map(s => s.vocabulary_id));
    return vocabulary.filter(v => vocabIds.has(v.id));
  }, [sentences, vocabulary]);

  return (
    <Stack spacing={4}>
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <ToolbarWrapper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeRoundedIcon sx={{ color: 'primary.light' }} />
              <Typography variant="h4" fontWeight={700}>
                Generated Sentences
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              View and manage AI-generated sentence variations for your vocabulary.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <BookRoundedIcon sx={{ color: 'text.secondary' }} />
            <Typography variant="h6" fontWeight={600}>
              {sentences.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              sentences
            </Typography>
          </Stack>
        </Stack>
      </ToolbarWrapper>

      <ToolbarWrapper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search sentences..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
          <TextField
            select
            label="Filter by word"
            value={selectedVocabulary}
            onChange={(event) => setSelectedVocabulary(event.target.value)}
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterAltRoundedIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="">All words</MenuItem>
            {vocabularyWithSentences.map((vocab) => (
              <MenuItem key={vocab.id} value={vocab.id}>
                {vocab.polish} / {vocab.english}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </ToolbarWrapper>

      <GridWrapper sx={{ height: 520 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </GridWrapper>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit sentence</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="English sentence"
              value={editing?.state.sentence_english ?? ''}
              onChange={(event) =>
                setEditing((prev) =>
                  prev ? { ...prev, state: { ...prev.state, sentence_english: event.target.value } } : prev
                )
              }
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              label="Polish translation"
              value={editing?.state.sentence_polish ?? ''}
              onChange={(event) =>
                setEditing((prev) =>
                  prev ? { ...prev, state: { ...prev.state, sentence_polish: event.target.value } } : prev
                )
              }
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete sentence</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will permanently remove the sentence. Continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => confirmDelete && void handleDelete(confirmDelete)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
