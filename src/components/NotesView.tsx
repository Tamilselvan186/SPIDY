import { useState, useEffect } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Note, notesApi } from '../services/supabaseClient';

interface NotesViewProps {
  onAddNote?: (content: string, language: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onAddNote }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await notesApi.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await notesApi.delete(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleAddNote = async () => {
    const content = prompt('Enter your note:');
    if (content) {
      try {
        const newNote = await notesApi.create(content, 'english');
        setNotes([newNote, ...notes]);
        onAddNote?.(content, 'english');
      } catch (error) {
        console.error('Error creating note:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
        <button
          onClick={handleAddNote}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No notes yet. Create one to get started!</p>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-50 p-4 rounded-lg flex justify-between items-start hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="text-gray-900">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(note.created_at).toLocaleDateString()} - {note.language.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
