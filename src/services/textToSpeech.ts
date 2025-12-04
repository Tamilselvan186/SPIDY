interface SpeechOptions {
  language: 'en' | 'ta' | 'th';
  rate?: number;
  pitch?: number;
}

export class TextToSpeechService {
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  speak(text: string, options: SpeechOptions): void {
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getLanguageCode(options.language);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;

    this.synth.speak(utterance);
  }

  stop(): void {
    this.synth.cancel();
  }

  private getLanguageCode(language: 'en' | 'ta' | 'th'): string {
    const codes: Record<string, string> = {
      en: 'en-US',
      ta: 'ta-IN',
      th: 'th-TH',
    };
    return codes[language] || 'en-US';
  }
}
