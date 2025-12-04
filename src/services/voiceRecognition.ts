interface VoiceRecognitionOptions {
  language: 'en-US' | 'ta-IN' | 'th-TH';
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

type SpeechRecognitionEvent = Event & {
  results?: SpeechRecognitionResultList;
  isFinal?: boolean;
};

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class VoiceRecognitionService {
  private recognition: any;
  private isListening = false;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition API not supported');
    }
    this.recognition = new SpeechRecognition();
  }

  start(options: VoiceRecognitionOptions): void {
    if (this.isListening) return;

    this.recognition.language = options.language;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      options.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.results!.length - 1; i >= 0; i--) {
        const transcript = event.results![i][0].transcript;

        if (event.results![i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        options.onResult?.(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        options.onResult?.(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      options.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };

    this.recognition.start();
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const detectLanguageFromText = (text: string): 'english' | 'tamil' | 'thanglish' => {
  const tamilScript = /[\u0B80-\u0BFF]/g;
  const thanglishPatterns = /kh|ph|th|ng|ch|sh|ai|ei|oi|ao|yu/gi;
  const tamilCount = (text.match(tamilScript) || []).length;

  if (tamilCount > text.length * 0.2) {
    return 'tamil';
  }

  if (thanglishPatterns.test(text) && /[aeiou]{2,}/.test(text)) {
    return 'thanglish';
  }

  return 'english';
};
