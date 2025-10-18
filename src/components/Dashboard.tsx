import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForwardRounded';
import TranslateIcon from '@mui/icons-material/TranslateRounded';
import PsychologyIcon from '@mui/icons-material/PsychologyRounded';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooksRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';

import { db } from '../lib/supabase';
import type { Vocabulary } from '../types';

const quickActions = [
  {
    title: 'Translate & Save',
    description: 'Quickly translate and store new vocabulary.',
    icon: <TranslateIcon fontSize="small" />,
    href: '/translator',
  },
  {
    title: 'Practice Session',
    description: 'Review cards selected by spaced repetition.',
    icon: <PsychologyIcon fontSize="small" />,
    href: '/practice',
  },
  {
    title: 'Browse Vocabulary',
    description: 'Organise, edit and search all your saved words.',
    icon: <LibraryBooksIcon fontSize="small" />,
    href: '/vocabulary',
  },
  {
    title: 'Manage Categories',
    description: 'Curate personalised categories for faster recall.',
    icon: <CategoryIcon fontSize="small" />,
    href: '/categories',
  },
];

const HeroGradient = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(6),
  overflow: 'hidden',
  background:
    'linear-gradient(135deg, rgba(63,214,193,0.14) 0%, rgba(63,214,193,0.05) 45%, rgba(25,27,32,0.6) 100%)',
  border: '1px solid rgba(255,255,255,0.1)',
}));

const GradientOrb = styled('div')(() => ({
  position: 'absolute',
  width: 260,
  height: 260,
  borderRadius: '50%',
  background:
    'radial-gradient(circle, rgba(63,214,193,0.25) 0%, rgba(15,17,21,0) 70%)',
  filter: 'blur(0px)',
}));

const StatCard = styled(Card)(() => ({
  height: '100%',
  background: 'linear-gradient(180deg, rgba(15,17,21,0.8) 0%, rgba(20,24,32,0.9) 100%)',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 24px 40px -24px rgba(0,0,0,0.45)',
}));

interface Stats {
  totalWords: number;
  totalCategories: number;
  wordsToday: number;
  practiceStreak: number;
}

export function Dashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stats>({
    totalWords: 0,
    totalCategories: 0,
    wordsToday: 0,
    practiceStreak: 0,
  });
  const [recentWords, setRecentWords] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [vocabulary, categories] = await Promise.all([
          db.vocabulary.getAll(),
          db.categories.getAll(),
        ]);

        const today = new Date().toDateString();
        const wordsToday = vocabulary.filter(
          (word) => new Date(word.created_at).toDateString() === today
        ).length;

        setStats({
          totalWords: vocabulary.length,
          totalCategories: categories.length,
          wordsToday,
          practiceStreak: Math.min(7, Math.floor(vocabulary.length / 15)),
        });

        setRecentWords(vocabulary.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const progressItems = useMemo(
    () => [
      {
        label: 'Daily goal completion',
        value: Math.min((stats.wordsToday / 20) * 100, 100),
        icon: <AccessTimeIcon fontSize="small" />,
      },
      {
        label: 'Vocabulary depth',
        value: Math.min((stats.totalWords / 250) * 100, 100),
        icon: <TrendingUpIcon fontSize="small" />,
      },
      {
        label: 'Consistency streak',
        value: Math.min((stats.practiceStreak / 14) * 100, 100),
        icon: <RocketLaunchIcon fontSize="small" />,
      },
    ],
    [stats]
  );

  return (
    <Stack spacing={6}>
      {/* Hero */}
      <HeroGradient>
        <GradientOrb style={{ top: -60, left: -40 }} />
        <GradientOrb style={{ bottom: -80, right: -50, opacity: 0.6 }} />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" justifyContent="space-between">
          <Stack spacing={2} sx={{ position: 'relative' }}>
            <Chip
              label="Personalised dashboard"
              variant="outlined"
              sx={{
                alignSelf: 'flex-start',
                borderColor: alpha(theme.palette.primary.main, 0.4),
                color: theme.palette.primary.light,
              }}
            />
            <Typography variant="h4" fontWeight={700} lineHeight={1.15}>
              Welcome back, ready for today's curated learning session?
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={520}>
              Your learning path is updated in real time. Translate new words, revisit tricky phrases, and keep your streak alive.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                component={RouterLink}
                to="/translator"
              >
                Start translating
              </Button>
              <Button variant="outlined" size="large" component={RouterLink} to="/practice">
                Resume practice
              </Button>
            </Stack>
          </Stack>
          <Card
            sx={{
              minWidth: { xs: '100%', md: 320 },
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" color="text.secondary">
                    Current streak
                  </Typography>
                  <Chip label={`${stats.practiceStreak} days`} color="primary" variant="outlined" size="small" />
                </Stack>
                <Typography variant="h3" fontWeight={700}>
                  {stats.totalWords}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total words in your collection
                </Typography>
                <Divider flexItem sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                <Stack spacing={2}>
                  {progressItems.map((item) => (
                    <Stack key={item.label} spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ color: 'primary.light' }}>{item.icon}</Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.label}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={item.value}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        }}
                      />
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </HeroGradient>

      {/* Statistics cards */}
      <Grid container spacing={3}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <Grid key={index} item xs={12} sm={6} lg={3}>
                <Skeleton variant="rounded" height={160} />
              </Grid>
            ))
          : [
              {
                label: 'Vocabulary depth',
                value: stats.totalWords,
                caption: 'Total words saved',
              },
              {
                label: 'Words today',
                value: stats.wordsToday,
                caption: 'New entries added',
              },
              {
                label: 'Categories curated',
                value: stats.totalCategories,
                caption: 'Thematic groups',
              },
              {
                label: 'Streak',
                value: stats.practiceStreak,
                caption: 'Days in a row',
              },
            ].map((stat) => (
              <Grid key={stat.label} item xs={12} sm={6} lg={3}>
                <StatCard>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Typography variant="overline" color="text.secondary">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" fontWeight={700}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.caption}
                      </Typography>
                    </Stack>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
      </Grid>

      {/* Quick actions */}
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            Quick actions
          </Typography>
          <Button endIcon={<ArrowForwardIcon />} component={RouterLink} to="/practice" variant="text">
            View all flows
          </Button>
        </Stack>
        <Grid container spacing={3}>
          {quickActions.map((action) => (
            <Grid key={action.title} item xs={12} sm={6} lg={3}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(15,17,21,0.6) 0%, rgba(18,21,28,0.9) 100%)',
                }}
              >
                <CardActionArea component={RouterLink} to={action.href} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Stack spacing={0.6}>
                        <Typography variant="h6" fontWeight={600}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          Open
                        </Typography>
                        <ArrowForwardIcon fontSize="small" color="primary" />
                      </Stack>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>

      {/* Recent additions */}
      <Card sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <CardContent sx={{ p: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" fontWeight={600}>
                Recent vocabulary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your latest saved words at a glance.
              </Typography>
            </Stack>
            <Button component={RouterLink} to="/vocabulary" variant="outlined" size="small">
              Manage vocabulary
            </Button>
          </Stack>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {[...Array(4)].map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={56} />
                ))}
              </Stack>
            </Box>
          ) : recentWords.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
              <Typography variant="h6" sx={{ mt: 1.5 }}>
                No vocabulary added yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Start by translating your first word.
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentWords.map((word) => (
                <ListItem
                  key={word.id}
                  divider
                  secondaryAction={
                    <Typography variant="body2" color="text.secondary">
                      {new Date(word.created_at).toLocaleDateString()}
                    </Typography>
                  }
                  sx={{
                    px: 3,
                    py: 2,
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.22),
                        color: theme.palette.primary.light,
                        width: 44,
                        height: 44,
                        fontWeight: 600,
                      }}
                    >
                      {word.polish.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {word.polish}
                        </Typography>
                        <Chip label={word.category?.name ?? 'Uncategorised'} size="small" variant="outlined" />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {word.english}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
