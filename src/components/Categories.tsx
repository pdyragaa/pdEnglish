import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FolderSpecialRoundedIcon from '@mui/icons-material/FolderSpecialRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

import { db } from '../lib/supabase';
import type { Category } from '../types';

const Container = styled(Box)({
  borderRadius: 24,
  border: '1px solid rgba(255,255,255,0.05)',
  backgroundColor: 'rgba(20,24,32,0.75)',
  overflow: 'hidden',
});

interface EditingState {
  id: string;
  name: string;
  color: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const cats = await db.categories.getAll();
        setCategories(cats);
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Failed to load categories.' });
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const colorPalette = useMemo(
    () => ['#3FD6C1', '#4C82FB', '#8E97A7', '#F2994A', '#56CCF2', '#9B51E0', '#6FCF97'],
    []
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const created = await db.categories.create(newName.trim());
      setCategories((prev) => [created, ...prev]);
      setNewName('');
      setFeedback({ type: 'success', message: 'Category created.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to create category.' });
    }
  };

  const openEdit = (category: Category) => {
    setEditing({ id: category.id, name: category.name, color: colorPalette[0] });
  };

  const handleSave = async () => {
    if (!editing?.name.trim()) return;
    try {
      const updated = await db.categories.update(editing.id, editing.name.trim());
      setCategories((prev) => prev.map((item) => (item.id === editing.id ? updated : item)));
      setEditing(null);
      setFeedback({ type: 'success', message: 'Category updated.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to update category.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.categories.delete(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
      setConfirmDelete(null);
      setFeedback({ type: 'success', message: 'Category removed.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to delete category.' });
    }
  };

  return (
    <Stack spacing={4}>
      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Container>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                Category library
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Group vocabulary thematically to accelerate recall.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
              <TextField
                fullWidth
                placeholder="Category name"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                InputProps={{ startAdornment: <CategoryRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleCreate}
                disabled={!newName.trim()}
              >
                Add category
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          {isLoading ? (
            <Stack spacing={2}>
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="rounded" height={64} />
              ))}
            </Stack>
          ) : categories.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <PaletteRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                No categories yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first category to organise vocabulary.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {categories.map((category, index) => (
                <Box key={category.id}>
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => openEdit(category)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => setConfirmDelete(category.id)}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    }
                    sx={{
                      px: 2,
                      py: 1.5,
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.04)' },
                    }}
                  >
                    <ListItemAvatar>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '14px',
                          backgroundColor: 'rgba(63,214,193,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FolderSpecialRoundedIcon sx={{ color: 'primary.main' }} />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={600}>
                          {category.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {index + 1} · created {new Date(category.created_at).toLocaleDateString()}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider component="li" sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Container>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Category name"
              value={editing?.name ?? ''}
              onChange={(event) => setEditing((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
              autoFocus
            />
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                Accent colour
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {colorPalette.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setEditing((prev) => (prev ? { ...prev, color } : prev))}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: editing?.color === color ? '3px solid #fff' : '3px solid transparent',
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Remove category</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to remove this category? Vocabulary will remain but lose this grouping.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => confirmDelete && void handleDelete(confirmDelete)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
