import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Link,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { styled } from '@mui/material/styles';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';

import { db } from '../lib/supabase';
import { generateSentenceVariations } from '../lib/deepseek';
import type { Vocabulary, Category } from '../types';

const ToolbarWrapper = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(2),
  border: '1px solid rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(20,24,32,0.8)',
}));

const GridWrapper = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.05)',
  backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
}));

interface EditingState {
  polish: string;
  english: string;
  category_id: string;
}

export function VocabularyList() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; state: EditingState } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [vocabData, categoriesData] = await Promise.all([
          db.vocabulary.getAll(),
          db.categories.getAll(),
        ]);
        setVocabulary(vocabData);
        setCategories(categoriesData);
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Failed to load vocabulary. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredRows = useMemo(() => {
    return vocabulary
      .filter((item) => (selectedCategory ? item.category_id === selectedCategory : true))
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.polish.toLowerCase().includes(term) ||
          item.english.toLowerCase().includes(term) ||
          item.category?.name?.toLowerCase().includes(term)
        );
      })
      .map((item) => ({
        id: item.id,
        polish: item.polish,
        english: item.english,
        category: item.category?.name ?? 'Uncategorised',
        created_at: item.created_at,
      }));
  }, [vocabulary, selectedCategory, searchTerm]);

  const openEdit = useCallback((id: string) => {
    const item = vocabulary.find((entry) => entry.id === id);
    if (!item) return;
    setEditing({
      id,
      state: {
        polish: item.polish,
        english: item.english,
        category_id: item.category_id ?? '',
      },
    });
  }, [vocabulary]);

  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'polish',
        headerName: 'Polish',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => <Typography fontWeight={600}>{params.value as string}</Typography>,
      },
      {
        field: 'english',
        headerName: 'English',
        flex: 1,
        minWidth: 150,
        renderCell: (params) => <Typography color="text.secondary">{params.value as string}</Typography>,
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 160,
        renderCell: ({ value }) => (
          <Chip label={value as string} size="small" variant="outlined" icon={<CategoryRoundedIcon fontSize="inherit" />} />
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit vocabulary">
              <IconButton size="small" onClick={() => openEdit(params.row.id)}>
                <EditRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete vocabulary">
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
      const updated = await db.vocabulary.update(id, {
        polish: state.polish,
        english: state.english,
        category_id: state.category_id || null,
      });
      setVocabulary((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setFeedback({ type: 'success', message: 'Vocabulary updated successfully.' });
      setEditing(null);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to update vocabulary.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.vocabulary.delete(id);
      setVocabulary((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: 'success', message: 'Vocabulary deleted.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to delete vocabulary.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleGenerateSentences = async (id: string) => {
    const vocab = vocabulary.find((item) => item.id === id);
    if (!vocab) return;
    setGeneratingId(id);
    try {
      const variations = await generateSentenceVariations(vocab.english, vocab.polish);
      const sentences = variations.map((variation) => ({
        vocabulary_id: vocab.id,
        sentence_english: variation.english,
        sentence_polish: variation.polish,
      }));
      await db.sentences.createMany(sentences);
      setFeedback({ type: 'success', message: `Generated ${variations.length} new sentences.` });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to generate sentences.' });
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

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

      <ToolbarWrapper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Vocabulary hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Filter, edit and expand your bilingual collection.
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', md: 'auto' }}>
            <TextField
              variant="outlined"
              placeholder="Search vocabulary"
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
            />
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              sx={{ minWidth: 180 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterAltRoundedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">All categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={<AddRoundedIcon />}>
              New vocabulary
            </Button>
          </Stack>
        </Stack>
      </ToolbarWrapper>

      <Box sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={600}>
              Generate sentence variations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use AI to enrich vocabulary context with ready-to-use examples.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={() => {
                const firstId = vocabulary[0]?.id;
                if (firstId) void handleGenerateSentences(firstId);
              }}
              disabled={!vocabulary.length || Boolean(generatingId)}
            >
              Generate for latest
            </Button>
            <Button
              variant="contained"
              startIcon={<VisibilityIcon />}
              component={Link}
              href="/sentences"
              sx={{ textDecoration: 'none' }}
            >
              View all sentences
            </Button>
          </Stack>
        </Stack>

        {generatingId && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Generating variations…
            </Typography>
          </Stack>
        )}
      </Box>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit vocabulary</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Polish"
              value={editing?.state.polish ?? ''}
              onChange={(event) =>
                setEditing((prev) =>
                  prev ? { ...prev, state: { ...prev.state, polish: event.target.value } } : prev
                )
              }
              fullWidth
            />
            <TextField
              label="English"
              value={editing?.state.english ?? ''}
              onChange={(event) =>
                setEditing((prev) =>
                  prev ? { ...prev, state: { ...prev.state, english: event.target.value } } : prev
                )
              }
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={editing?.state.category_id ?? ''}
              onChange={(event) =>
                setEditing((prev) =>
                  prev ? { ...prev, state: { ...prev.state, category_id: event.target.value } } : prev
                )
              }
              fullWidth
            >
              <MenuItem value="">No category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
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
        <DialogTitle>Delete vocabulary</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This will remove the vocabulary entry but keep any saved sentences. Continue?
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
