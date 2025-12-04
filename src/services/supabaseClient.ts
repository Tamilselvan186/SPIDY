import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Note {
  id: string;
  content: string;
  language: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  language: string;
  created_at: string;
}

export const notesApi = {
  async create(content: string, language: string): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ content, language }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const remindersApi = {
  async create(title: string, description: string, language: string, dueDate?: string): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert([{ title, description, language, due_date: dueDate }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('due_date', { ascending: true, nullsLast: true });

    if (error) throw error;
    return data || [];
  },

  async update(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const voiceLogsApi = {
  async create(recognizedText: string, language: string, confidence?: number): Promise<void> {
    const { error } = await supabase
      .from('voice_logs')
      .insert([{ recognized_text: recognizedText, language, confidence }]);

    if (error) throw error;
  },
};
