import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Clock, Globe, Youtube } from 'lucide-react';
import { VoiceRecognitionService, detectLanguageFromText } from '../services/voiceRecognition';
import { TextToSpeechService } from '../services/textToSpeech';
import { voiceLogsApi } from '../services/supabaseClient';
import { VoiceButton } from './VoiceButton';
import { LanguageSelector } from './LanguageSelector';
import { NotesView } from './NotesView';
import { RemindersView } from './RemindersView';

type Language = 'en-US' | 'ta-IN' | 'th-TH';
type View = 'home' | 'notes' | 'reminders';

export const Spidy: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en-US');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [currentView, setCurrentView] = useState<View>('home');
  const [response, setResponse] = useState('');

  const voiceRecognitionRef = useRef<VoiceRecognitionService | null>(null);
  const textToSpeechRef = useRef<TextToSpeechService | null>(null);

  useEffect(() => {
    try {
      voiceRecognitionRef.current = new VoiceRecognitionService();
      textToSpeechRef.current = new TextToSpeechService();
    } catch (error) {
      console.error('Speech API not available:', error);
      setResponse('Sorry, Speech Recognition API is not available in your browser.');
    }
  }, []);

  const handleVoiceStart = () => {
    if (!voiceRecognitionRef.current) return;

    setRecognizedText('');
    setInterimText('');
    setResponse('');

    voiceRecognitionRef.current.start({
      language: selectedLanguage,
      onStart: () => setIsListening(true),
      onResult: (text, isFinal) => {
        if (isFinal) {
          setRecognizedText(text);
          setInterimText('');
          processCommand(text);
        } else {
          setInterimText(text);
        }
      },
      onError: (error) => {
        setResponse(`Error: ${error}`);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });
  };

  const handleVoiceStop = () => {
    if (!voiceRecognitionRef.current) return;
    voiceRecognitionRef.current.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      handleVoiceStop();
    } else {
      handleVoiceStart();
    }
  };

  const processCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    const detectedLang = detectLanguageFromText(text);

    try {
      await voiceLogsApi.create(text, detectedLang);
    } catch (error) {
      console.error('Error logging voice:', error);
    }

    const langMap: Record<string, 'en' | 'ta' | 'th'> = {
      english: 'en',
      tamil: 'ta',
      thanglish: 'th',
    };

    let responseText = '';

    if (lowerText.includes('google')) {
      window.open('https://www.google.com', '_blank');
      responseText = 'Opening Google in a new tab.';
    } else if (lowerText.includes('youtube')) {
      window.open('https://www.youtube.com', '_blank');
      responseText = 'Opening YouTube in a new tab.';
    } else if (lowerText.includes('note') || lowerText.includes('save')) {
      setCurrentView('notes');
      responseText = 'Opening notes section.';
    } else if (lowerText.includes('reminder') || lowerText.includes('todo')) {
      setCurrentView('reminders');
      responseText = 'Opening reminders section.';
    } else if (lowerText.includes('search') || lowerText.includes('find')) {
      responseText = 'Search feature coming soon!';
    } else if (lowerText.includes('home')) {
      setCurrentView('home');
      responseText = 'Going back home.';
    } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
      responseText = 'Hello! I am SPIDY, your voice assistant. You can say "open google", "open youtube", create notes, add reminders, or more.';
    } else {
      responseText = `You said: "${text}". Try commands like "open google", "open youtube", "create note", "add reminder", or "go home".`;
    }

    setResponse(responseText);

    if (textToSpeechRef.current) {
      textToSpeechRef.current.speak(responseText, {
        language: langMap[detectedLang] || 'en',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center">
              <span className="text-2xl">🕷️</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              SPIDY
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Your Multilingual Voice Assistant</p>
        </header>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col items-center gap-8">
            <LanguageSelector selectedLanguage={selectedLanguage} onChange={setSelectedLanguage} />

            <div className="flex flex-col items-center gap-4">
              <VoiceButton isListening={isListening} onClick={toggleListening} />
              <p className="text-center text-gray-600 font-medium min-h-6">
                {isListening ? '🎤 Listening...' : 'Click to speak'}
              </p>
            </div>

            {interimText && (
              <div className="w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Interim:</p>
                <p className="text-blue-900">{interimText}</p>
              </div>
            )}

            {recognizedText && (
              <div className="w-full bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Recognized:</p>
                <p className="text-green-900">{recognizedText}</p>
              </div>
            )}

            {response && (
              <div className="w-full bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600">Response:</p>
                <p className="text-purple-900">{response}</p>
              </div>
            )}
          </div>
        </div>

        {currentView === 'home' && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => setCurrentView('notes')}
              className="bg-gradient-to-br from-blue-100 to-blue-50 hover:from-blue-200 hover:to-blue-100 border border-blue-200 p-6 rounded-xl transition-all hover:shadow-md"
            >
              <FileText className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              <p className="text-gray-600 text-sm mt-2">Create and manage your notes</p>
            </button>

            <button
              onClick={() => setCurrentView('reminders')}
              className="bg-gradient-to-br from-orange-100 to-orange-50 hover:from-orange-200 hover:to-orange-100 border border-orange-200 p-6 rounded-xl transition-all hover:shadow-md"
            >
              <Clock className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Reminders</h3>
              <p className="text-gray-600 text-sm mt-2">Stay organized with reminders</p>
            </button>

            <button
              onClick={() => window.open('https://www.google.com', '_blank')}
              className="bg-gradient-to-br from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 border border-red-200 p-6 rounded-xl transition-all hover:shadow-md"
            >
              <Globe className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Google</h3>
              <p className="text-gray-600 text-sm mt-2">Open Google search</p>
            </button>

            <button
              onClick={() => window.open('https://www.youtube.com', '_blank')}
              className="bg-gradient-to-br from-red-100 to-red-50 hover:from-red-200 hover:to-red-100 border border-red-200 p-6 rounded-xl transition-all hover:shadow-md"
            >
              <Youtube className="w-8 h-8 text-red-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">YouTube</h3>
              <p className="text-gray-600 text-sm mt-2">Open YouTube videos</p>
            </button>
          </div>
        )}

        {currentView === 'notes' && (
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
            >
              ← Back to Home
            </button>
            <NotesView />
          </div>
        )}

        {currentView === 'reminders' && (
          <div className="mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors"
            >
              ← Back to Home
            </button>
            <RemindersView />
          </div>
        )}
      </div>
    </div>
  );
};
