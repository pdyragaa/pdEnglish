import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import { db } from '../lib/supabase';
import { getMasteryLevel } from '../lib/spaced-repetition';
import type { Vocabulary, Review, MasteryLevel } from '../types';

const MasteryCard = styled(Card)(() => ({
  height: '100%',
  background: 'linear-gradient(180deg, rgba(15,17,21,0.8) 0%, rgba(20,24,32,0.9) 100%)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 24px 40px -24px rgba(0,0,0,0.45)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 32px 48px -24px rgba(0,0,0,0.6)',
  },
}));

const DifficultWordsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255,255,255,0.02)',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.05)',
}));

interface MasteryStats {
  known: number;
  learning: number;
  difficult: number;
  new: number;
  total: number;
}

interface VocabularyWithMastery extends Vocabulary {
  masteryLevel: MasteryLevel;
  review?: Review;
}

export function VocabularyMastery() {
  const [vocabulary, setVocabulary] = useState<VocabularyWithMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MasteryStats>({
    known: 0,
    learning: 0,
    difficult: 0,
    new: 0,
    total: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vocabData, reviewsData] = await Promise.all([
          db.vocabulary.getAll(),
          db.reviews.getAll(),
        ]);

        // Create a map of reviews by vocabulary_id for quick lookup
        const reviewMap = new Map<string, Review>();
        reviewsData.forEach(review => {
          reviewMap.set(review.vocabulary_id, review);
        });

        // Categorize vocabulary by mastery level
        const vocabWithMastery: VocabularyWithMastery[] = vocabData.map(vocab => {
          const review = reviewMap.get(vocab.id);
          const masteryLevel = getMasteryLevel(review || null);
          return {
            ...vocab,
            masteryLevel,
            review,
          };
        });

        setVocabulary(vocabWithMastery);

        // Calculate stats
        const newStats = vocabWithMastery.reduce(
          (acc, vocab) => {
            acc[vocab.masteryLevel]++;
            acc.total++;
            return acc;
          },
          { known: 0, learning: 0, difficult: 0, new: 0, total: 0 }
        );

        setStats(newStats);
      } catch (error) {
        console.error('Failed to load vocabulary mastery data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getMasteryIcon = (level: MasteryLevel) => {
    switch (level) {
      case 'known':
        return <CheckCircleRoundedIcon color="success" />;
      case 'learning':
        return <SchoolRoundedIcon color="primary" />;
      case 'difficult':
        return <WarningRoundedIcon color="warning" />;
      case 'new':
        return <AddRoundedIcon color="disabled" />;
      default:
        return <AddRoundedIcon color="disabled" />;
    }
  };

  const getMasteryColor = (level: MasteryLevel): 'success' | 'primary' | 'warning' | 'default' => {
    switch (level) {
      case 'known':
        return 'success';
      case 'learning':
        return 'primary';
      case 'difficult':
        return 'warning';
      case 'new':
        return 'default';
      default:
        return 'default';
    }
  };

  const getMasteryLabel = (level: MasteryLevel): string => {
    switch (level) {
      case 'known':
        return 'Known Well';
      case 'learning':
        return 'Learning';
      case 'difficult':
        return 'Difficult';
      case 'new':
        return 'New';
      default:
        return 'Unknown';
    }
  };

  const difficultWords = vocabulary.filter(vocab => vocab.masteryLevel === 'difficult');

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Vocabulary Mastery
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} sm={3} key={i}>
              <MasteryCard>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={32} />
                  <Skeleton variant="rectangular" width="50%" height={24} sx={{ mt: 1 }} />
                </CardContent>
              </MasteryCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Vocabulary Mastery
      </Typography>
      
      <Grid container spacing={2}>
        {(['known', 'learning', 'difficult', 'new'] as MasteryLevel[]).map((level) => {
          const count = stats[level];
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          
          return (
            <Grid item xs={6} sm={3} key={level}>
              <MasteryCard>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    {getMasteryIcon(level)}
                    <Typography variant="body2" color="text.secondary">
                      {getMasteryLabel(level)}
                    </Typography>
                  </Stack>
                  <Typography variant="h4" fontWeight={700} color={`${getMasteryColor(level)}.main`}>
                    {count}
                  </Typography>
                  <Chip 
                    label={`${percentage}%`} 
                    size="small" 
                    color={getMasteryColor(level)}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </MasteryCard>
            </Grid>
          );
        })}
      </Grid>

      {difficultWords.length > 0 && (
        <DifficultWordsContainer>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Words Needing Practice ({difficultWords.length})
          </Typography>
          <List dense>
            {difficultWords.slice(0, 10).map((word) => (
              <ListItem key={word.id} divider>
                <ListItemText
                  primary={`${word.polish} - ${word.english}`}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip 
                        label={`Ease: ${word.review?.ease_factor?.toFixed(2) || 'N/A'}`} 
                        size="small" 
                        color="warning"
                      />
                      <Chip 
                        label={`Reps: ${word.review?.repetitions || 0}`} 
                        size="small" 
                        variant="outlined"
                      />
                    </Stack>
                  }
                />
              </ListItem>
            ))}
            {difficultWords.length > 10 && (
              <ListItem>
                <Typography variant="body2" color="text.secondary">
                  ... and {difficultWords.length - 10} more words
                </Typography>
              </ListItem>
            )}
          </List>
        </DifficultWordsContainer>
      )}
    </Box>
  );
}
