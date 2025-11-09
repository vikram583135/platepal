'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, X, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useVoiceAssistant, VoiceCommand } from '@/lib/hooks/useVoiceAssistant';
import { useVoiceAssistantStore } from '@/lib/store';
import { toast } from 'sonner';

interface VoiceAssistantProps {
  onCommand?: (command: VoiceCommand, text: string) => void;
  className?: string;
}

export default function VoiceAssistant({ onCommand, className = '' }: VoiceAssistantProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const { 
    voiceAssistantEnabled, 
    setVoiceAssistantEnabled,
    lastCommand: storeLastCommand 
  } = useVoiceAssistantStore();

  const { 
    isSupported, 
    isListening, 
    error, 
    transcript,
    startListening, 
    stopListening,
    speak 
  } = useVoiceAssistant({
    onCommand: (result) => {
      if (result.command !== 'unknown') {
        setLastCommand(result.text);
        if (onCommand) {
          onCommand(result.command, result.text);
        }
        // Provide audio feedback
        speak(`Command recognized: ${result.command.replace('_', ' ')}`);
      }
    },
    continuous: voiceAssistantEnabled,
  });

  useEffect(() => {
    if (voiceAssistantEnabled && isSupported && !isListening) {
      startListening();
    } else if (!voiceAssistantEnabled && isListening) {
      stopListening();
    }
  }, [voiceAssistantEnabled, isSupported, isListening, startListening, stopListening]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        icon: '🎤',
        duration: 3000,
      });
    }
  }, [error]);

  const toggleVoiceAssistant = () => {
    if (!isSupported) {
      toast.error('Speech recognition not supported in this browser', {
        icon: '⚠️',
      });
      return;
    }

    setVoiceAssistantEnabled(!voiceAssistantEnabled);
    
    if (!voiceAssistantEnabled) {
      toast.success('Voice assistant enabled', {
        icon: '🎤',
        description: 'Speak commands like "Accept order" or "Report issue"',
      });
    } else {
      toast.info('Voice assistant disabled', {
        icon: '🔇',
      });
    }
  };

  const voiceCommands = [
    { command: 'Accept order', description: 'Accept the current delivery task' },
    { command: 'Reject order', description: 'Reject the current delivery task' },
    { command: 'Report issue', description: 'Report a delivery issue (spilled drink, traffic, etc.)' },
    { command: 'Confirm delivery', description: 'Mark delivery as completed' },
    { command: 'Navigate to [location]', description: 'Get directions to a location' },
  ];

  if (!isSupported) {
    return null; // Don't show if not supported
  }

  return (
    <>
      {/* Floating Microphone Button */}
      <button
        onClick={toggleVoiceAssistant}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
          voiceAssistantEnabled
            ? isListening
              ? 'bg-error animate-pulse'
              : 'bg-primary'
            : 'bg-neutral-text-secondary'
        } ${className}`}
        aria-label={voiceAssistantEnabled ? 'Disable voice assistant' : 'Enable voice assistant'}
        title={voiceAssistantEnabled ? 'Voice assistant active - Click to disable' : 'Click to enable voice assistant'}
      >
        {isListening ? (
          <Mic size={28} className="text-white" />
        ) : (
          <MicOff size={28} className="text-white" />
        )}
      </button>

      {/* Recording Indicator */}
      {isListening && (
        <div className="fixed bottom-24 right-6 z-50 bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-error rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Listening...</span>
          </div>
          {transcript && (
            <p className="text-xs mt-2 text-white/80 max-w-xs">{transcript}</p>
          )}
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-6 right-24 z-50 w-12 h-12 rounded-full bg-neutral-surface border-2 border-primary flex items-center justify-center shadow-xl hover:shadow-2xl-glow transition-all active:scale-95"
        aria-label="Show voice commands help"
        title="Voice commands help"
      >
        <HelpCircle size={20} className="text-primary" />
      </button>

      {/* Help Menu */}
      {showHelp && (
        <div className="fixed bottom-28 right-6 z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm animate-fade-in-up border-2 border-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-neutral-text-primary">Voice Commands</h3>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1 hover:bg-neutral-light rounded-full transition-colors"
              aria-label="Close help"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-primary" />
                  <span className="font-semibold text-sm text-neutral-text-primary">
                    &ldquo;{cmd.command}&rdquo;
                  </span>
                </div>
                <p className="text-xs text-neutral-text-secondary ml-6">
                  {cmd.description}
                </p>
              </div>
            ))}
          </div>
          {lastCommand && (
            <div className="mt-4 pt-4 border-t border-neutral-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-success" />
                <span className="text-xs font-medium text-neutral-text-secondary">
                  Last command:
                </span>
              </div>
              <p className="text-sm text-neutral-text-primary mt-1 font-semibold">
                &ldquo;{lastCommand}&rdquo;
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 pt-4 border-t border-neutral-border">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-error" />
                <span className="text-xs text-error">{error}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

