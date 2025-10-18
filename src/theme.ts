import { createTheme } from '@mui/material/styles';

const primaryAccent = '#3FD6C1';
const backgroundDark = '#0F1115';
const backgroundPaper = '#141820';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryAccent,
      contrastText: '#0F1115',
    },
    secondary: {
      main: '#8E97A7',
    },
    background: {
      default: backgroundDark,
      paper: backgroundPaper,
    },
    text: {
      primary: '#E7EAF4',
      secondary: '#959CB2',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          paddingInline: '20px',
          paddingBlock: '10px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#11141B',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: backgroundPaper,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBlock: 4,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: backgroundDark,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(63,214,193,0.08), transparent 60%), radial-gradient(circle at 80% 0%, rgba(63,214,193,0.06), transparent 55%)',
          animation: 'fadeIn 0.6s ease-out',
        },
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '*, *::before, *::after': {
          transition: 'background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease',
        },
        'a': {
          color: primaryAccent,
          textDecoration: 'none',
        },
      },
    },
  },
});

export default theme;
