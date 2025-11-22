import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6',
        },
        secondary: {
            main: '#8b5cf6',
        },
        background: {
            default: '#000000',
            paper: '#09090b',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    },
});
