import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Translator } from './components/Translator';
import { VocabularyList } from './components/VocabularyList';
import { ReviewSession } from './components/ReviewSession';
import { Categories } from './components/Categories';
import { Sentences } from './components/Sentences';

const queryClient = new QueryClient();

function App() {
  console.log('✅ App component rendering');

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/translator" replace />} />
              <Route path="/translator" element={<Translator />} />
              <Route path="/vocabulary" element={<VocabularyList />} />
              <Route path="/review" element={<ReviewSession />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/sentences" element={<Sentences />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App
