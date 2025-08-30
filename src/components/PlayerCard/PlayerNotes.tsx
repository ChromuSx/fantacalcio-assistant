// src/components/PlayerCard/PlayerNotes.tsx
import { useState, useMemo } from 'react';
import { Player, PlayerNote } from '@/types';
import { useAuctionStore } from '@/stores/auctionStore';
import { 
  BookOpen, Edit2, Save, X, Plus, Trash2, 
  AlertTriangle, TrendingUp, Target, BarChart,
  ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';
import clsx from 'clsx';

interface PlayerNotesProps {
  player: Player;
}

export function PlayerNotes({ player }: PlayerNotesProps) {
  const { 
    getPlayerNotes, 
    updateNote, 
    deleteNote, 
    addManualNote,
    generateNotesForPlayer 
  } = useAuctionStore();
  
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(true);
  const [filterCategory, setFilterCategory] = useState<'all' | PlayerNote['category']>('all');
  
  const notes = useMemo(() => getPlayerNotes(player.id), [player.id, getPlayerNotes]);
  
  // Filtra note per categoria
  const filteredNotes = useMemo(() => {
    if (filterCategory === 'all') return notes;
    return notes.filter(n => n.category === filterCategory);
  }, [notes, filterCategory]);
  
  // Conta note per categoria
  const categoryCounts = useMemo(() => {
    const counts = {
      opportunity: 0,
      warning: 0,
      tactical: 0,
      statistical: 0
    };
    notes.forEach(n => counts[n.category]++);
    return counts;
  }, [notes]);
  
  const handleEdit = (note: PlayerNote) => {
    setEditingNote(note.id);
    setEditText(note.content);
  };
  
  const handleSave = () => {
    if (editingNote && editText.trim()) {
      updateNote(editingNote, editText);
      setEditingNote(null);
      setEditText('');
    }
  };
  
  const handleDelete = (noteId: string) => {
    if (confirm('Sei sicuro di voler eliminare questa nota?')) {
      deleteNote(noteId);
    }
  };
  
  const handleAddNote = () => {
    if (newNoteText.trim()) {
      addManualNote(player.id, newNoteText);
      setNewNoteText('');
      setShowAddNote(false);
    }
  };
  
  const handleRegenerateNotes = () => {
    if (confirm('Rigenerare le note automatiche? Le modifiche manuali saranno preservate.')) {
      generateNotesForPlayer(player.id);
    }
  };
  
  const getCategoryIcon = (category: PlayerNote['category']) => {
    switch(category) {
      case 'opportunity': return <TrendingUp size={16} className="text-green-600" />;
      case 'warning': return <AlertTriangle size={16} className="text-red-600" />;
      case 'tactical': return <Target size={16} className="text-blue-600" />;
      case 'statistical': return <BarChart size={16} className="text-purple-600" />;
    }
  };
  
  const getCategoryStyle = (category: PlayerNote['category']) => {
    switch(category) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-red-50 border-red-200';
      case 'tactical': return 'bg-blue-50 border-blue-200';
      case 'statistical': return 'bg-purple-50 border-purple-200';
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };
  
  if (notes.length === 0 && !showAddNote) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center py-4">
          <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-3">Nessuna nota per questo giocatore</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => generateNotesForPlayer(player.id)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Lightbulb size={16} />
              Genera Note Automatiche
            </button>
            <button
              onClick={() => setShowAddNote(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
            >
              <Plus size={16} />
              Aggiungi Nota
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setExpandedNotes(!expandedNotes)}
          className="flex items-center gap-2 text-lg font-bold text-gray-800 hover:text-purple-600 transition"
        >
          <BookOpen size={20} />
          Note e Insights ({notes.length})
          {expandedNotes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => generateNotesForPlayer(player.id)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            title="Rigenera note automatiche"
          >
            <Lightbulb size={16} />
          </button>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {expandedNotes && (
        <>
          {/* Filtri categoria */}
          {notes.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFilterCategory('all')}
                className={clsx(
                  "px-3 py-1 rounded-lg text-sm transition",
                  filterCategory === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                )}
              >
                Tutte ({notes.length})
              </button>
              
              {Object.entries(categoryCounts).map(([cat, count]) => (
                count > 0 && (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as PlayerNote['category'])}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm transition flex items-center gap-1",
                      filterCategory === cat 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    )}
                  >
                    {getCategoryIcon(cat as PlayerNote['category'])}
                    {count}
                  </button>
                )
              ))}
            </div>
          )}
          
          {/* Lista note */}
          <div className="space-y-3">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={clsx(
                  "p-4 rounded-lg border transition",
                  getCategoryStyle(note.category)
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(note.category)}
                    <div className="flex gap-2">
                      {note.type === 'auto' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          Auto
                        </span>
                      )}
                      {note.type === 'mixed' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
                          Modificata
                        </span>
                      )}
                      {note.type === 'manual' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                          Manuale
                        </span>
                      )}
                      <span className={clsx(
                        "px-2 py-0.5 text-xs rounded bg-white",
                        getConfidenceColor(note.confidence)
                      )}>
                        {note.confidence}% affidabilità
                      </span>
                    </div>
                  </div>
                  
                  {note.editable && (
                    <div className="flex gap-1">
                      {editingNote !== note.id && (
                        <>
                          <button
                            onClick={() => handleEdit(note)}
                            className="p-1 text-gray-500 hover:text-purple-600 transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="p-1 text-gray-500 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {editingNote === note.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        <Save size={14} className="inline mr-1" />
                        Salva
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(null);
                          setEditText('');
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        <X size={14} className="inline mr-1" />
                        Annulla
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700">{note.content}</p>
                )}
                
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>Fonte: {note.source.join(', ')}</span>
                  {note.updatedAt && (
                    <span>Aggiornata: {new Date(note.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Aggiungi nuova nota */}
          {showAddNote && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <h4 className="font-semibold mb-2">Aggiungi nota personale</h4>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Scrivi le tue osservazioni su questo giocatore..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddNote}
                  disabled={!newNoteText.trim()}
                  className={clsx(
                    "px-4 py-2 rounded-lg font-medium transition",
                    newNoteText.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Plus size={16} className="inline mr-1" />
                  Salva Nota
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNoteText('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}