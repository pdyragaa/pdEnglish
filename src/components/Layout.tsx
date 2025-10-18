import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import TranslateIcon from '@mui/icons-material/TranslateRounded';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooksRounded';
import PsychologyIcon from '@mui/icons-material/PsychologyRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import InsightsIcon from '@mui/icons-material/InsightsRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';

const drawerWidth = 260;

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    width: 240,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.text.primary, 0.6),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.2, 1.2, 1.2, 0),
    paddingLeft: `calc(1.5em + ${theme.spacing(4)})`,
  },
}));

const navigation = [
  { name: 'Dashboard', href: '/', icon: <DashboardIcon fontSize="small" /> },
  { name: 'Translator', href: '/translator', icon: <TranslateIcon fontSize="small" /> },
  { name: 'Vocabulary', href: '/vocabulary', icon: <LibraryBooksIcon fontSize="small" /> },
  { name: 'Practice', href: '/practice', icon: <PsychologyIcon fontSize="small" /> },
  { name: 'Categories', href: '/categories', icon: <CategoryIcon fontSize="small" /> },
  { name: 'Stats', href: '/stats', icon: <InsightsIcon fontSize="small" /> },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [open, setOpen] = useState(false);

  const pageTitle = useMemo(() => {
    const current = navigation.find((item) => item.href === location.pathname);
    return current?.name ?? 'pdEnglish';
  }, [location.pathname]);

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      return [
        <Typography key="home" color="text.secondary">
          Home
        </Typography>,
      ];
    }

    const crumbs = [
      <Typography key="home" color="text.secondary">
        Home
      </Typography>,
    ];

    segments.forEach((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const isLast = index === segments.length - 1;
      crumbs.push(
        isLast ? (
          <Typography key={href} color="text.primary">
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </Typography>
        ) : (
          <Typography key={href} component={RouterLink} to={href} color="text.secondary" sx={{ textDecoration: 'none' }}>
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </Typography>
        )
      );
    });

    return crumbs;
  }, [location.pathname]);

  const drawer = (
    <Stack spacing={3} sx={{ height: '100%', p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" color="primary" fontWeight={700}>
              pd
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              pdEnglish
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Learn smarter every day
            </Typography>
          </Box>
        </Stack>
        {!isDesktop && (
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.06) }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <List disablePadding>
          {navigation.map((item) => {
            const active = location.pathname === item.href;
            return (
              <ListItemButton
                key={item.href}
                component={RouterLink}
                to={item.href}
                onClick={() => !isDesktop && setOpen(false)}
                selected={active}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box>
        <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.common.white, 0.06) }} />
        <Typography variant="caption" color="text.secondary">
          Crafted for focused language learning.
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'rgba(15,17,21,0.92)' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          backgroundImage: 'none',
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3, lg: 4 } }}>
          {!isDesktop && (
            <IconButton
              color="inherit"
              onClick={() => setOpen(true)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Stack direction="column" spacing={0.5} sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {pageTitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Breadcrumbs separator="/" aria-label="breadcrumb" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {breadcrumbs}
            </Breadcrumbs>
            <SearchWrapper>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
            </SearchWrapper>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundImage: 'none',
              px: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          p: { xs: 3, sm: 4, lg: 6 },
          mt: { xs: 9, lg: 9 },
          minHeight: '100vh',
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: 'auto', width: '100%' }}>{children}</Box>
      </Box>
    </Box>
  );
}
