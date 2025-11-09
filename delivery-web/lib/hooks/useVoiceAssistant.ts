'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoiceAssistantStore } from '@/lib/store';

// TypeScript declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};

export type VoiceCommand = 
  | 'accept_order' 
  | 'reject_order' 
  | 'report_issue' 
  | 'confirm_delivery' 
  | 'navigate_to'
  | 'unknown';

interface VoiceAssistantResult {
  command: VoiceCommand;
  text: string;
  confidence?: number;
}

interface UseVoiceAssistantOptions {
  onCommand?: (result: VoiceAssistantResult) => void;
  continuous?: boolean;
  language?: string;
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}) {
  const { onCommand, continuous = false, language = 'en-US' } = options;
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  
  const { 
    setIsListening: setStoreListening, 
    setLastCommand,
    voiceAssistantEnabled 
  } = useVoiceAssistantStore();

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = 
      window.SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = language;
      
      recognition.onstart = () => {
        setIsListening(true);
        setStoreListening(true);
        setError(null);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');
        
        setTranscript(transcript);
        
        // Parse command from transcript
        const command = parseVoiceCommand(transcript);
        setLastCommand(transcript);
        
        if (onCommand) {
          onCommand({
            command,
            text: transcript,
            confidence: event.results[0][0].confidence,
          });
        }
        
        // Stop after getting result if not continuous
        if (!continuous) {
          recognition.stop();
        }
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = 'Voice recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            break;
          case 'network':
            errorMessage = 'Network error';
            break;
          case 'aborted':
            errorMessage = 'Recognition aborted';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        setStoreListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setStoreListening(false);
        
        // Restart if continuous and enabled
        if (continuous && voiceAssistantEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignore if already started
          }
        }
      };
    } else {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [continuous, language, onCommand, voiceAssistantEnabled, setStoreListening, setLastCommand]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        // Already started, ignore
        return;
      }
      setError('Failed to start voice recognition');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback((text: string, options?: Partial<SpeechSynthesisUtterance>) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (options) {
        Object.assign(utterance, options);
      } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.lang = language;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [language]);

  return {
    isSupported,
    isListening,
    error,
    transcript,
    startListening,
    stopListening,
    speak,
  };
}

// Parse voice command from transcript
function parseVoiceCommand(transcript: string): VoiceCommand {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  // Accept order patterns
  if (
    lowerTranscript.includes('accept') && 
    (lowerTranscript.includes('order') || lowerTranscript.includes('delivery'))
  ) {
    return 'accept_order';
  }
  
  // Reject order patterns
  if (
    lowerTranscript.includes('reject') || 
    lowerTranscript.includes('decline') ||
    lowerTranscript.includes('no thanks')
  ) {
    if (lowerTranscript.includes('order') || lowerTranscript.includes('delivery')) {
      return 'reject_order';
    }
  }
  
  // Report issue patterns
  if (
    lowerTranscript.includes('report') ||
    lowerTranscript.includes('issue') ||
    lowerTranscript.includes('problem') ||
    lowerTranscript.includes('spilled') ||
    lowerTranscript.includes('traffic') ||
    lowerTranscript.includes('heavy traffic')
  ) {
    return 'report_issue';
  }
  
  // Confirm delivery patterns
  if (
    lowerTranscript.includes('confirm') ||
    lowerTranscript.includes('delivered') ||
    lowerTranscript.includes('complete') ||
    lowerTranscript.includes('done')
  ) {
    if (
      lowerTranscript.includes('delivery') ||
      lowerTranscript.includes('delivered')
    ) {
      return 'confirm_delivery';
    }
  }
  
  // Navigate patterns
  if (
    lowerTranscript.includes('navigate') ||
    lowerTranscript.includes('directions') ||
    lowerTranscript.includes('go to') ||
    lowerTranscript.includes('drive to')
  ) {
    return 'navigate_to';
  }
  
  return 'unknown';
}

