/**
 * Speech-to-Text utility using Web Speech API
 */
export class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.onTranscript = null;
    this.onLanguageDetected = null;
    this.onError = null;
    
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    } else {
      console.warn('Speech Recognition API not supported in this browser');
    }
  }

  setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US'; // Default, will be updated based on detection

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (this.onTranscript) {
        this.onTranscript({
          interim: interimTranscript,
          final: finalTranscript,
          full: finalTranscript + interimTranscript
        });
      }

      // Detect language from first result
      if (event.results.length > 0 && this.onLanguageDetected) {
        const detectedLang = this.detectLanguageFromText(finalTranscript + interimTranscript);
        if (detectedLang) {
          this.onLanguageDetected(detectedLang);
        }
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Auto-restart if it was listening
      if (this.shouldRestart) {
        this.start();
      }
    };
  }

  start(language = 'en-US') {
    if (!this.recognition) {
      throw new Error('Speech Recognition not supported');
    }

    if (this.isListening) {
      return;
    }

    this.recognition.lang = language;
    this.recognition.start();
    this.isListening = true;
    this.shouldRestart = true;
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.shouldRestart = false;
      this.recognition.stop();
      this.isListening = false;
    }
  }

  setLanguage(language) {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  detectLanguageFromText(text) {
    // Simple language detection based on common words/patterns
    const textLower = text.toLowerCase();
    
    // Hindi detection (Devanagari script or common words)
    if (/[\u0900-\u097F]/.test(text) || 
        /\b(है|में|के|का|की|से|को|पर|यह|वह|हो|था|थी)\b/.test(textLower)) {
      return 'hi-IN';
    }
    
    // Bengali
    if (/[\u0980-\u09FF]/.test(text)) {
      return 'bn-IN';
    }
    
    // Telugu
    if (/[\u0C00-\u0C7F]/.test(text)) {
      return 'te-IN';
    }
    
    // Tamil
    if (/[\u0B80-\u0BFF]/.test(text)) {
      return 'ta-IN';
    }
    
    // Marathi
    if (/\b(आहे|मध्ये|च्या|ला|पासून)\b/.test(textLower)) {
      return 'mr-IN';
    }
    
    // Gujarati
    if (/[\u0A80-\u0AFF]/.test(text)) {
      return 'gu-IN';
    }
    
    // Default to English
    return 'en-US';
  }
}

/**
 * Text-to-Speech utility
 */
export class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();
    
    // Try to find a good voice for the language
    this.currentVoice = this.voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  speak(text, language = 'en-US', onEnd = null) {
    if (!this.synth) {
      console.warn('Speech Synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on language
    const voice = this.findVoiceForLanguage(language);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
    return utterance;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  findVoiceForLanguage(language) {
    const langCode = language.split('-')[0];
    return this.voices.find(v => v.lang.startsWith(langCode)) || this.currentVoice;
  }

  isSpeaking() {
    return this.synth && this.synth.speaking;
  }
}

/**
 * Language detection from audio (simplified - uses text after transcription)
 */
export const SUPPORTED_LANGUAGES = {
  'en': { code: 'en-US', name: 'English', nativeName: 'English' },
  'hi': { code: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी' },
  'bn': { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
  'te': { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  'ta': { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
  'mr': { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  'gu': { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' }
};

export const getLanguageCode = (lang) => {
  return SUPPORTED_LANGUAGES[lang]?.code || 'en-US';
};

export const getLanguageName = (lang) => {
  return SUPPORTED_LANGUAGES[lang]?.name || 'English';
};

