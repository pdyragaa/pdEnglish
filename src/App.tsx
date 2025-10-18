import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Translator } from './components/Translator';
import { VocabularyList } from './components/VocabularyList';
import { ReviewSession } from './components/ReviewSession';
import { Categories } from './components/Categories';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Translator />} />
            <Route path="/vocabulary" element={<VocabularyList />} />
            <Route path="/practice" element={<ReviewSession />} />
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App
