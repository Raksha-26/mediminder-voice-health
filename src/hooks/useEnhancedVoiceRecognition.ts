import { useState, useCallback, useRef } from 'react';

interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
}

interface UseEnhancedVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  startListening: (language?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  supported: boolean;
}

// Enhanced voice patterns for natural language recognition
const MEDICINE_CONFIRMATION_PATTERNS = [
  // English patterns
  /\b(i\s*(have|took|taken|had|consumed|swallowed|drank|ingested|used))\b/i,
  /\b(took|taken|had|consumed|swallowed|drank|ingested|used)\s*(my|the)?\s*(medicine|medication|pill|tablet|drug|dose)\b/i,
  /\b(medicine|medication|pill|tablet|drug|dose)\s*(taken|consumed|swallowed|ingested|done)\b/i,
  /\b(done|finished|completed)\s*(with)?\s*(my|the)?\s*(medicine|medication|pill|tablet)\b/i,
  /\b(yes|yeah|yep|confirmed|confirm|done|finished|taken|ok|okay)\b/i,
  
  // Hindi patterns
  /\b(मैंने|मैने)\s*(ली|लिया|खाई|खाया|पिया|सेवन|लगाई)\b/i,
  /\b(दवा|दवाई|गोली|टेबलेट|कैप्सूल)\s*(ली|लिया|खाई|खाया|पिया|सेवन)\b/i,
  /\b(ली|लिया|खाई|खाया|पिया|सेवन|हो\s*गया|पूरा|समाप्त)\b/i,
  /\b(हाँ|हा|जी|ठीक|हो\s*गया|पूरा)\b/i,
  
  // Spanish patterns
  /\b(he\s*(tomado|consumido|bebido|tragado)|tomé|consumí|bebí|trague)\b/i,
  /\b(medicina|medicamento|pastilla|tableta|cápsula)\s*(tomada|consumida|bebida|tragada)\b/i,
  /\b(sí|si|vale|bien|hecho|terminado|listo)\b/i,
  
  // French patterns
  /\b(j'ai\s*(pris|consommé|bu|avalé)|j'ai\s*pris)\b/i,
  /\b(médicament|pilule|comprimé|capsule)\s*(pris|consommé|bu|avalé)\b/i,
  /\b(oui|d'accord|bien|fait|terminé|fini)\b/i,
  
  // German patterns
  /\b(ich\s*(habe|hab)\s*(genommen|eingenommen|getrunken|geschluckt))\b/i,  
  /\b(medikament|pille|tablette|kapsel)\s*(genommen|eingenommen|getrunken|geschluckt)\b/i,
  /\b(ja|jawohl|gut|fertig|erledigt|gemacht)\b/i,
  
  // Portuguese patterns
  /\b(eu\s*(tomei|consumi|bebi|engoli)|tomei|consumi|bebi|engoli)\b/i,
  /\b(remédio|medicamento|pílula|comprimido|cápsula)\s*(tomado|consumido|bebido|engolido)\b/i,
  /\b(sim|está\s*bem|feito|terminado|pronto)\b/i,
  
  // Russian patterns
  /\b(я\s*(принял|принимал|выпил|съел)|принял|принимал|выпил|съел)\b/i,
  /\b(лекарство|таблетка|пилюля|капсула)\s*(принял|принимал|выпил|съел)\b/i,
  /\b(да|хорошо|готово|сделано|закончено)\b/i
];

export const useEnhancedVoiceRecognition = (): UseEnhancedVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const supported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const checkMedicineConfirmation = useCallback((text: string): boolean => {
    return MEDICINE_CONFIRMATION_PATTERNS.some(pattern => pattern.test(text));
  }, []);

  const startListening = useCallback((language: string = 'en-US') => {
    if (!supported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 3;

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
      if (finalTranscript && checkMedicineConfirmation(finalTranscript)) {
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

    // Auto-stop after 10 seconds
    timeoutRef.current = setTimeout(() => {
      if (isListening) {
        recognition.stop();
      }
    }, 10000);
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