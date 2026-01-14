import { useState, useEffect, useRef } from "react";
import { toast } from "sonner"


interface UseSpeechRecognitionProps {
  onTranscript: (text: string) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export function useSpeechRecognition({ 
  onTranscript, 
  inputRef 
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  ;

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        onTranscript(transcript);
        
        // Focus the textarea and adjust its height if ref is provided
        if (inputRef?.current) {
          inputRef.current.focus();
          inputRef.current.style.height = 'inherit';
          inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
        }
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Failed to access microphone. Please check your permissions.')
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [onTranscript, toast, inputRef]);

  const toggleListening = () => {
    if (!recognition.current) {
      toast.error('Speech recognition is not supported in your browser.')
      return;
    }

    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      recognition.current.start();
      setIsListening(true);
      // Focus the textarea when starting to listen
      if (inputRef?.current) {
        inputRef.current.focus();
      }
      toast.info('Listening...')
    }
  };

  return {
    isListening,
    toggleListening
  };
}