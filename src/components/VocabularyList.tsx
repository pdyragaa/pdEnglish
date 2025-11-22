import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  Search,
  Edit2,
  Trash2,
  Loader2,
  Sparkles,
  ArrowUpDown,
  X,
  Check
} from 'lucide-react';
import { db } from '../lib/supabase';
import { generateSentenceVariations } from '../lib/deepseek';
import type { Vocabulary, Category } from '../types';
import { cn } from '../lib/utils';

// Minimalist Button Component
const ActionButton = ({ onClick, icon: Icon, variant = 'ghost', className, disabled }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-1.5 rounded-md transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed",
      variant === 'ghost' && "hover:bg-white/10 text-muted-foreground hover:text-white",
      variant === 'primary' && "bg-primary/10 text-primary hover:bg-primary/20",
      variant === 'danger' && "bg-red-500/10 text-red-400 hover:bg-red-500/20",
      className
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
);

export function VocabularyList() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Editing & Actions State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vocabulary>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debug State
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkDebug = async () => {
      const { data: { session } } = await db.supabase.auth.getSession();
      const { count, error: countError } = await db.supabase
        .from('vocabulary')
        .select('*', { count: 'exact', head: true });

      setDebugInfo({
        session: session ? 'Logged In' : 'No Session',
        user: session?.user?.email,
        rowCount: count,
        countError: countError,
        url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 20) + '...'
      });
    };
    checkDebug();
  }, []);

  // Data Loading
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    console.log('🚀 Starting data load...');
    setLoading(true);
    setError(null);

    try {
      // Load categories first (fast)
      console.log('📡 Fetching categories...');
      try {
        const catData = await db.categories.getAll();
        console.log('✅ Categories loaded:', catData.length);
        setCategories(catData);
      } catch (e) {
        console.error('⚠️ Failed to load categories:', e);
        // Don't stop, try to load vocabulary anyway
      }

      // Load vocabulary (main data)
      console.log('📡 Fetching vocabulary...');
      const vocabData = await db.vocabulary.getAll();
      console.log('✅ Vocabulary loaded:', vocabData.length);
      setVocabulary(vocabData);

    } catch (err) {
      console.error('❌ Critical Load Error:', err);
      const message = err instanceof Error ? err.message : 'Failed to load vocabulary';
      setError(message);
      showFeedback('error', message);
    } finally {
      console.log('🏁 Loading finished');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Actions
  const handleSave = async (id: string) => {
    try {
      await db.vocabulary.update(id, {
        polish: editForm.polish,
        english: editForm.english,
        category_id: editForm.category_id
      });

      setVocabulary(prev => prev.map(item =>
        item.id === id ? { ...item, ...editForm, category: categories.find(c => c.id === editForm.category_id) } : item
      ));
      setEditingId(null);
      showFeedback('success', 'Saved successfully');
    } catch (err) {
      showFeedback('error', 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.vocabulary.delete(id);
      setVocabulary(prev => prev.filter(item => item.id !== id));
      setDeletingId(null);
      showFeedback('success', 'Deleted successfully');
    } catch (err) {
      showFeedback('error', 'Failed to delete');
    }
  };

  const handleGenerateSentences = async (id: string) => {
    const item = vocabulary.find(v => v.id === id);
    if (!item) return;

    setGeneratingId(id);
    try {
      const { variations } = await generateSentenceVariations(item.english, item.polish);
      await db.sentences.createMany(variations.map(v => ({
        vocabulary_id: id,
        sentence_english: v.english,
        sentence_polish: v.polish
      })));
      showFeedback('success', 'Sentences generated');
    } catch (err) {
      showFeedback('error', 'Generation failed');
    } finally {
      setGeneratingId(null);
    }
  };

  // Table Configuration
  const columnHelper = createColumnHelper<Vocabulary>();

  const columns = useMemo(() => [
    columnHelper.accessor('polish', {
      header: 'Polish',
      cell: info => editingId === info.row.original.id ? (
        <input
          className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-primary"
          value={editForm.polish || ''}
          onChange={e => setEditForm(prev => ({ ...prev, polish: e.target.value }))}
        />
      ) : (
        <span className="font-medium text-white">{info.getValue()}</span>
      )
    }),
    columnHelper.accessor('english', {
      header: 'English',
      cell: info => editingId === info.row.original.id ? (
        <input
          className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-primary"
          value={editForm.english || ''}
          onChange={e => setEditForm(prev => ({ ...prev, english: e.target.value }))}
        />
      ) : (
        <span className="text-muted-foreground">{info.getValue()}</span>
      )
    }),
    columnHelper.accessor('category_id', {
      header: 'Category',
      cell: info => editingId === info.row.original.id ? (
        <select
          className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-sm focus:outline-none focus:border-primary"
          value={editForm.category_id || ''}
          onChange={e => setEditForm(prev => ({ ...prev, category_id: e.target.value }))}
        >
          <option value="">No Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      ) : (
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/5">
          {info.row.original.category?.name || 'Uncategorized'}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => (
        <div className="flex items-center justify-end gap-1">
          {editingId === info.row.original.id ? (
            <>
              <ActionButton icon={Check} variant="primary" onClick={() => handleSave(info.row.original.id)} />
              <ActionButton icon={X} onClick={() => setEditingId(null)} />
            </>
          ) : (
            <>
              <ActionButton
                icon={Sparkles}
                variant="ghost"
                className={generatingId === info.row.original.id ? "animate-pulse text-amber-400" : "text-amber-400/50 hover:text-amber-400"}
                onClick={() => handleGenerateSentences(info.row.original.id)}
                disabled={!!generatingId}
              />
              <ActionButton icon={Edit2} onClick={() => {
                setEditingId(info.row.original.id);
                setEditForm(info.row.original);
              }} />
              {deletingId === info.row.original.id ? (
                <ActionButton icon={Trash2} variant="danger" onClick={() => handleDelete(info.row.original.id)} />
              ) : (
                <ActionButton icon={Trash2} onClick={() => setDeletingId(info.row.original.id)} />
              )}
            </>
          )}
        </div>
      )
    })
  ], [editingId, editForm, categories, generatingId, deletingId]);

  const table = useReactTable({
    data: vocabulary,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Apply category filter manually since it's specific
  const filteredRows = table.getRowModel().rows.filter(row => {
    if (!categoryFilter) return true;
    return row.original.category_id === categoryFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your vocabulary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-3 bg-red-500/10 rounded-full">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white">Failed to load data</h3>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-secondary/20 p-4 rounded-xl border border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white">Vocabulary</h2>
          <p className="text-xs text-muted-foreground">{vocabulary.length} words stored</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={cn(
          "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-5",
          feedback.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
        )}>
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden bg-black">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-white/5 bg-secondary/10">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      <div
                        className={cn("flex items-center gap-2 cursor-pointer hover:text-white transition-colors", header.column.getCanSort() && "select-none")}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3 opacity-50" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                    No vocabulary found.
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => (
                  <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Showing {filteredRows.length} of {vocabulary.length} words
      </div>

      {/* Debug Info Panel */}
      <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-white/10 text-xs font-mono text-muted-foreground">
        <h3 className="font-bold text-white mb-2">Debug Info</h3>
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
}
