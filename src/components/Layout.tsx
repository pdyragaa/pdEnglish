import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import TranslateIcon from '@mui/icons-material/TranslateRounded';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooksRounded';
import PsychologyIcon from '@mui/icons-material/PsychologyRounded';
import CategoryIcon from '@mui/icons-material/CategoryRounded';
import InsightsIcon from '@mui/icons-material/InsightsRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeRounded';

const drawerWidth = 240;

const navigation = [
  { name: 'Dashboard', href: '/', icon: <DashboardIcon fontSize="small" /> },
  { name: 'Translator', href: '/translator', icon: <TranslateIcon fontSize="small" /> },
  { name: 'Vocabulary', href: '/vocabulary', icon: <LibraryBooksIcon fontSize="small" /> },
  { name: 'Sentences', href: '/sentences', icon: <AutoAwesomeIcon fontSize="small" /> },
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

  const drawer = (
    <Stack spacing={2} sx={{ height: '100%', p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette.primary.main, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="subtitle1" color="primary" fontWeight={700}>
            pd
          </Typography>
        </Box>
        <Typography variant="h6" fontWeight={700}>
          pdEnglish
        </Typography>
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
                  borderRadius: 1.5,
                  mb: 0.25,
                  px: 1.5,
                  py: 0.75,
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.16),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.24),
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#000000' }}>
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
          p: { xs: 1, sm: 2, lg: 2 },
          pb: { xs: 8, lg: 2 },
          minHeight: '100vh',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>{children}</Box>
      </Box>

      <BottomNavigation
        value={location.pathname}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: 'flex', lg: 'none' },
          backgroundColor: '#000000',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {navigation.map((item) => (
          <BottomNavigationAction
            key={item.href}
            label={item.name}
            value={item.href}
            icon={item.icon}
            component={RouterLink}
            to={item.href}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
