import { useState, useEffect } from 'react';
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Reminder, remindersApi } from '../services/supabaseClient';

interface RemindersViewProps {
  onAddReminder?: (title: string, language: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onAddReminder }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await remindersApi.getAll();
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
    setLoading(false);
  };

  const handleToggleComplete = async (reminder: Reminder) => {
    try {
      const updated = await remindersApi.update(reminder.id, {
        completed: !reminder.completed,
      });
      setReminders(reminders.map(r => (r.id === reminder.id ? updated : r)));
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remindersApi.delete(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleAddReminder = async () => {
    const title = prompt('Enter reminder title:');
    if (title) {
      try {
        const description = prompt('Enter reminder description (optional):') || '';
        await remindersApi.create(title, description, 'english');
        loadReminders();
        onAddReminder?.(title, 'english');
      } catch (error) {
        console.error('Error creating reminder:', error);
      }
    }
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Reminders</h2>
        <button
          onClick={handleAddReminder}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading reminders...</p>
      ) : (
        <>
          {activeReminders.length === 0 && completedReminders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reminders yet. Create one to stay organized!</p>
          ) : (
            <>
              {activeReminders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Active</h3>
                  <div className="space-y-3">
                    {activeReminders.map(reminder => (
                      <div key={reminder.id} className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 hover:bg-blue-100 transition-colors">
                        <button
                          onClick={() => handleToggleComplete(reminder)}
                          className="flex-shrink-0 mt-1 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{reminder.title}</p>
                          {reminder.description && <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>}
                          <p className="text-xs text-gray-500 mt-2">{reminder.language.toUpperCase()}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completedReminders.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Completed</h3>
                  <div className="space-y-3">
                    {completedReminders.map(reminder => (
                      <div key={reminder.id} className="bg-gray-50 p-4 rounded-lg flex items-start gap-3 hover:bg-gray-100 transition-colors opacity-60">
                        <button
                          onClick={() => handleToggleComplete(reminder)}
                          className="flex-shrink-0 mt-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-600 line-through">{reminder.title}</p>
                          {reminder.description && <p className="text-sm text-gray-500 line-through mt-1">{reminder.description}</p>}
                        </div>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
