import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Filter,
  Edit2,
  Trash2,
  Volume2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  X
} from 'lucide-react';
import { db } from '../lib/supabase';
import type { Sentence, Vocabulary, Category } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { cn } from '../lib/utils';

interface SentenceWithVocabulary extends Sentence {
  vocabulary?: Vocabulary & { category?: Category };
}

interface EditingState {
  sentence_english: string;
  sentence_polish: string;
}

export function Sentences() {
  const [sentences, setSentences] = useState<SentenceWithVocabulary[]>([]);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<string | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: string; state: EditingState } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // UX Features
  const [clozeMode, setClozeMode] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sentencesData, vocabularyData] = await Promise.all([
          db.sentences.getAll(),
          db.vocabulary.getAll(),
        ]);
        setSentences(sentencesData);
        setVocabulary(vocabularyData);
      } catch (error) {
        console.error(error);
        setFeedback({ type: 'error', message: 'Failed to load sentences.' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredSentences = useMemo(() => {
    return sentences
      .filter((item) => (selectedVocabulary ? item.vocabulary_id === selectedVocabulary : true))
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.sentence_english.toLowerCase().includes(term) ||
          item.sentence_polish.toLowerCase().includes(term) ||
          item.vocabulary?.english.toLowerCase().includes(term) ||
          item.vocabulary?.polish.toLowerCase().includes(term)
        );
      });
  }, [sentences, selectedVocabulary, searchTerm]);

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, state } = editing;
    try {
      const updated = await db.sentences.update(id, {
        sentence_english: state.sentence_english,
        sentence_polish: state.sentence_polish,
      });
      setSentences((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setFeedback({ type: 'success', message: 'Sentence updated.' });
      setEditing(null);
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to update sentence.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.sentences.delete(id);
      setSentences((prev) => prev.filter((item) => item.id !== id));
      setFeedback({ type: 'success', message: 'Sentence deleted.' });
    } catch (error) {
      console.error(error);
      setFeedback({ type: 'error', message: 'Failed to delete sentence.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Text-to-Speech
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Copy to Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setFeedback({ type: 'success', message: 'Copied to clipboard.' });
  };

  // Get vocabulary that have sentences
  const vocabularyWithSentences = useMemo(() => {
    const vocabIds = new Set(sentences.map(s => s.vocabulary_id));
    return vocabulary.filter(v => vocabIds.has(v.id));
  }, [sentences, vocabulary]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Generated Sentences</h1>
          <p className="text-muted-foreground">AI-generated context for your vocabulary.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setClozeMode(!clozeMode)}
            className={cn(
              "border-white/5 hover:bg-white/5",
              clozeMode && "bg-primary/10 text-primary border-primary/20"
            )}
          >
            {clozeMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {clozeMode ? 'Cloze Mode Active' : 'Cloze Mode'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="Search sentences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/50 border-white/5"
          />
        </div>
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>
          <select
            value={selectedVocabulary}
            onChange={(e) => setSelectedVocabulary(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card/50 border border-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
          >
            <option value="">All words</option>
            {vocabularyWithSentences.map((vocab) => (
              <option key={vocab.id} value={vocab.id}>
                {vocab.english}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sentences List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : filteredSentences.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No sentences found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters or generate new sentences.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSentences.map((item) => (
            <div
              key={item.id}
              className="group relative p-5 rounded-xl bg-card border border-white/5 hover:border-primary/20 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-3">
                    <p className="text-lg font-medium text-foreground leading-relaxed">
                      {clozeMode && item.vocabulary ? (
                        <>
                          {item.sentence_english.split(new RegExp(`(${item.vocabulary.english})`, 'gi')).map((part, i) =>
                            part.toLowerCase() === item.vocabulary!.english.toLowerCase() ? (
                              <span key={i} className="bg-primary/20 text-transparent rounded px-1 select-none">
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </>
                      ) : (
                        item.sentence_english
                      )}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => speak(item.sentence_english)}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-muted-foreground">
                    {item.sentence_polish}
                  </p>

                  {item.vocabulary && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {item.vocabulary.english}
                      </span>
                      {item.vocabulary.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted-foreground">
                          {item.vocabulary.category.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-start">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(item.sentence_english)}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing({
                      id: item.id,
                      state: {
                        sentence_english: item.sentence_english,
                        sentence_polish: item.sentence_polish
                      }
                    })}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit Sentence"
      >
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">English Sentence</label>
            <Input
              value={editing?.state.sentence_english ?? ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, state: { ...prev.state, sentence_english: e.target.value } } : null)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Polish Translation</label>
            <Input
              value={editing?.state.sentence_polish ?? ''}
              onChange={(e) => setEditing(prev => prev ? { ...prev, state: { ...prev.state, sentence_polish: e.target.value } } : null)}
              className="bg-background"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Delete Sentence"
      >
        <div className="space-y-4 pt-2">
          <p className="text-muted-foreground">
            Are you sure you want to delete this sentence? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete && handleDelete(confirmDelete)}>
              Delete Sentence
            </Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-bottom duration-300 flex items-center gap-3 z-50",
          feedback.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <p className="text-sm font-medium">{feedback.message}</p>
          <button onClick={() => setFeedback(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
