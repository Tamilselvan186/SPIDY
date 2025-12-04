import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ isListening, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
          : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isListening ? (
        <MicOff className="w-7 h-7 text-white" />
      ) : (
        <Mic className="w-7 h-7 text-white" />
      )}
    </button>
  );
};
