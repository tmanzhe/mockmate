"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, MicOff, Video, VideoOff, Pause, Play, RefreshCcw } from "lucide-react";

// TypeScript interfaces
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }

  interface SpeechRecognitionErrorEvent {
    readonly error: SpeechRecognitionErrorCode;
    readonly message: string;
  }
}

interface MediaState {
  isRecording: boolean;
  isMicrophoneOn: boolean;
  isCameraOn: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: string;
  isLive?: boolean;
}

// Add missing TypeScript definitions for the Web Speech API
interface Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

const Interview: React.FC = () => {
  const [mediaState, setMediaState] = useState<MediaState>({
    isRecording: true,
    isMicrophoneOn: false,
    isCameraOn: true
  });

  // Web speech recognition 
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [hasPendingResults, setHasPendingResults] = useState<boolean>(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              setTranscript((prev) => prev + event.results[i][0].transcript);
              setHasPendingResults(false);
            } else {
              interim += event.results[i][0].transcript;
              setHasPendingResults(true);
            }
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          const recognition = recognitionRef.current;
          if (isListening && mediaState.isMicrophoneOn && recognition) {
            try {
              recognition.start();
            } catch (error) {
              console.error("Error restarting recognition:", error);
            }
          }
        };
      } else {
        console.error("Speech recognition not supported in this browser");
      }
    }

    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.stop();
        } catch (error) {
          console.error("Error stopping recognition:", error);
        }
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  // Recording variables
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Create a computed messages array that includes the live transcript
  const allMessages = React.useMemo(() => {
    const messagesList = [...messages];
    
    // Only add live transcript if there's something to show
    if (transcript || interimTranscript) {
      messagesList.push({
        id: -1, // Special ID for live transcript
        text: transcript + interimTranscript,
        sender: "You",
        isLive: true
      });
    }
    
    return messagesList;
  }, [messages, transcript, interimTranscript]);

  const resetTranscript = () => {
    if (hasPendingResults) {
      console.log("Waiting for interim results to finalize before resetting.");
      return;
    }
    // Check if there's any ongoing interim transcript
    if (transcript.trim()) {
      // Check if the last non-live message is the same as the current transcript
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || lastMessage.text !== transcript) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            text: transcript,
            sender: "You",
            isLive: false,
          },
        ]);
      }
    }
    setTranscript("");
    setInterimTranscript("");
  };

  useEffect(() => {
    initializeMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        stopListening();
      }
    };
  }, []);

  // Audio analysis for speaking detection
  useEffect(() => {
    try {
      if (!mediaState.isMicrophoneOn || !streamRef.current) {
        setIsSpeaking(false);
        return;
      }

      let animationFrameId: number;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      const source = audioContext.createMediaStreamSource(streamRef.current);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const detectSpeech = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setIsSpeaking(avg > 10);
        
        if (mediaState.isMicrophoneOn) {
          animationFrameId = requestAnimationFrame(detectSpeech);
        }
      };

      detectSpeech();

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        audioContext.close();
        setIsSpeaking(false);
      };
    }
    catch (e) {
      console.log(e);
    }
  }, [mediaState.isMicrophoneOn]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Mute the microphone by default
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = false;
      });

    } catch (err) {
      console.error("Failed to access media devices:", err);
    }
  };

  const toggleMedia = (type: "audio" | "video") => {
    try {
      if (!streamRef.current) return;

      const tracks = type === 'audio' 
        ? streamRef.current.getAudioTracks()
        : streamRef.current.getVideoTracks();

      tracks.forEach(track => {
        track.enabled = !track.enabled;
      });

      if (type === 'audio') {
        const newMicState = !mediaState.isMicrophoneOn;
        setMediaState(prev => ({
          ...prev,
          isMicrophoneOn: newMicState
        }));
        
        // Synchronize speech recognition with microphone state
        if (newMicState) {
          startListening();
        } else {
          stopListening();
          setInterimTranscript(""); // Clear interim transcript when muting
        }
      } else {
        setMediaState(prev => ({
          ...prev,
          isCameraOn: !prev.isCameraOn
        }));
      }
    }
    catch (e) {
      console.log(e);
    }
  };

  const toggleRecording = () => {
    setMediaState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
  };

  const switchCamera = () => {
    console.log("Switch camera button clicked.");
  };

  return (
    <div className="gradient-background min-h-screen bg-gradient-to-r from-slate-900 to-slate-700 p-6">
      {/* Rest of your JSX remains the same */}
      <div className="max-w-4xl mx-auto bg-opacity-50 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Virtual Interview</h1>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="relative aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-slate-400">AI Interviewer</span>
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                Interviewer
              </div>
            </div>

            <div className={`relative aspect-video bg-slate-800 rounded-lg overflow-hidden ${isSpeaking ? 'ring-4 ring-blue-500' : ''}`}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                You
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={switchCamera}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
            >
              <RefreshCcw size={20} />
            </button>

            <button
              onClick={() => toggleMedia('audio')}
              className={`p-3 rounded-full ${
                mediaState.isMicrophoneOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-500'
              } text-white`}
            >
              {mediaState.isMicrophoneOn ? <Mic size={20} /> : <MicOff size={20} />}
            </button>

            <button
              onClick={() => toggleMedia('video')}
              className={`p-3 rounded-full ${
                mediaState.isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-500'
              } text-white`}
            >
              {mediaState.isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
            </button>

            <button
              onClick={toggleRecording}
              className={`p-3 rounded-full ${
                mediaState.isRecording ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'
              } text-white`}
            >
              {mediaState.isRecording ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={resetTranscript}
              className={`p-3 rounded-full ${
                'bg-yellow-600 hover:bg-yellow-500'
              } text-white`}
            >
               <Play size={20} />
            </button>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Chat</h2>
      <div className="h-48 overflow-y-auto space-y-2">
        {allMessages.map((message: Message) => (
          <div 
            key={message.id} 
            className={`p-2 bg-white rounded shadow ${
              message.isLive ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="text-sm font-medium flex justify-between">
              <span>{message.sender}</span>
              {message.isLive && (
                <span className="text-blue-500 text-xs">Live</span>
              )}
            </div>
            <div>{message.text}</div>
          </div>
        ))}
      </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;