import { useState, useCallback, useRef } from 'react';

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

interface UseAdvancedVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: (language?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

// Enhanced multilingual medicine confirmation patterns
const MEDICINE_CONFIRMATION_PATTERNS = {
  // English patterns
  en: [
    /\b(i\s*(have|took|taken|had|consumed|swallowed|drank|ingested|used))\b/i,
    /\b(took|taken|had|consumed|swallowed|drank|ingested|used)\s*(my|the)?\s*(medicine|medication|pill|tablet|drug|dose)\b/i,
    /\b(medicine|medication|pill|tablet|drug|dose)\s*(taken|consumed|swallowed|ingested|done)\b/i,
    /\b(done|finished|completed)\s*(with)?\s*(my|the)?\s*(medicine|medication|pill|tablet)\b/i,
    /\b(yes|yeah|yep|confirmed|confirm|done|finished|taken|ok|okay)\b/i,
  ],
  
  // Hindi patterns - enhanced
  hi: [
    /\b(मैंने|मैने)\s*(ली|लिया|खाई|खाया|पिया|सेवन|लगाई)\b/i,
    /\b(दवा|दवाई|गोली|टेबलेट|कैप्सूल)\s*(ली|लिया|खाई|खाया|पिया|सेवन)\b/i,
    /\b(ली|लिया|खाई|खाया|पिया|सेवन|हो\s*गया|पूरा|समाप्त)\b/i,
    /\b(हाँ|हा|जी|ठीक|हो\s*गया|पूरा|दवा\s*ली)\b/i,
  ],

  // Kannada patterns
  kn: [
    /\b(ನಾನು|ನಾನ್)\s*(ತಗೊಂಡು|ತಗೊಂಡೆ|ಕುಡಿದು|ಕುಡಿದೆ|ತಿಂದು|ತಿಂದೆ)\b/i,
    /\b(ಔಷಧ|ಮದ್ದು|ಗೊಳಿ|ಟ್ಯಾಬ್ಲೆಟ್)\s*(ತಗೊಂಡು|ತಗೊಂಡೆ|ಕುಡಿದು|ಕುಡಿದೆ)\b/i,
    /\b(ತಗೊಂಡು|ತಗೊಂಡೆ|ಮುಗಿಸಿದೆ|ಆಯಿತು|ಹೌದು|ಸರಿ)\b/i,
  ],

  // Malayalam patterns
  ml: [
    /\b(ഞാൻ|ഞാന്)\s*(കഴിച്ചു|എടുത്തു|കുടിച്ചു|തിന്നു)\b/i,
    /\b(മരുന്ന്|ഔഷധം|ഗുളിക|ടാബ്ലെറ്റ്)\s*(കഴിച്ചു|എടുത്തു|കുടിച്ചു)\b/i,
    /\b(കഴിച്ചു|എടുത്തു|കുടിച്ചു|മുഗിച്ചു|ആയി|ശരി)\b/i,
  ],

  // Urdu patterns
  ur: [
    /\b(میں\s*نے|مینے)\s*(لی|لیا|کھائی|کھایا|پیا|استعمال)\b/i,
    /\b(دوا|دوائی|گولی|ٹیبلیٹ)\s*(لی|لیا|کھائی|کھایا|پیا)\b/i,
    /\b(لی|لیا|کھائی|کھایا|پیا|ہو\s*گیا|مکمل|ہاں|ٹھیک)\b/i,
  ],

  // Tulu patterns
  tcy: [
    /\b(ಯಾನ್|ನಾನ್)\s*(ತಿಂದ್|ಕುಡಿದ್|ತಗೊಂಡ್)\b/i,
    /\b(ಔಷಧ|ಮದ್ದು)\s*(ತಿಂದ್|ಕುಡಿದ್|ತಗೊಂಡ್)\b/i,
    /\b(ತಿಂದ್|ಕುಡಿದ್|ತಗೊಂಡ್|ಆಪುಂಡು|ಸರಿ)\b/i,
  ],

  // Tamil patterns
  ta: [
    /\b(நான்|நா)\s*(சாப்பிட்டு|குடிச்சு|எடுத்து|உண்டு)\b/i,
    /\b(மருந்து|மாத்திரை|ட்டாப்லெட்)\s*(சாப்பிட்டு|குடிச்சு|எடுத்து)\b/i,
    /\b(சாப்பிட்டு|குடிச்சு|எடுத்து|முடிச்சு|ஆயிடுச்சு|சரி)\b/i,
  ],

  // Marathi patterns
  mr: [
    /\b(मी|मैं)\s*(घेतली|घेतलं|प्यायली|खाल्ली)\b/i,
    /\b(औषध|गोळी|टॅब्लेट)\s*(घेतली|घेतलं|प्यायली|खाल्ली)\b/i,
    /\b(घेतली|घेतलं|झालं|पूर्ण|होय|ठीक)\b/i,
  ],

  // Telugu patterns
  te: [
    /\b(నేను|నేన్)\s*(తీసుకున్నా|తిన్నా|త్రాగా|వేసుకున్నా)\b/i,
    /\b(మందు|మాత్ర|టాబ్లెట్)\s*(తీసుకున్నా|తిన్నా|త్రాగా)\b/i,
    /\b(తీసుకున్నా|తిన్నా|త్రాగా|అయ్యింది|పూర్తి|సరే)\b/i,
  ],
};

export const useAdvancedVoiceRecognition = (): UseAdvancedVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const checkMedicineConfirmation = useCallback((text: string, language: string = 'en'): boolean => {
    const langCode = language.split('-')[0]; // Extract language code (e.g., 'en' from 'en-US')
    const patterns = MEDICINE_CONFIRMATION_PATTERNS[langCode as keyof typeof MEDICINE_CONFIRMATION_PATTERNS] || MEDICINE_CONFIRMATION_PATTERNS.en;
    return patterns.some(pattern => pattern.test(text));
  }, []);

  const startListening = useCallback((language: string = 'en-US') => {
    if (!supported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);

      // Auto-confirm if medicine confirmation is detected
      if (finalTranscript && checkMedicineConfirmation(finalTranscript, language)) {
        recognition.stop();
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    // Auto-stop after 15 seconds for better UX
    timeoutRef.current = setTimeout(() => {
      if (isListening) {
        recognition.stop();
      }
    }, 15000);
  }, [supported, isListening, checkMedicineConfirmation]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  return {
    isListening,
    transcript,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    supported
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}