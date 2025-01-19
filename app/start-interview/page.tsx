"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Mic, MicOff, Video, VideoOff, Pause, Play, RefreshCcw } from "lucide-react";

// Types
interface MediaState {
  isRecording: boolean;
  isMicrophoneOn: boolean;
  isCameraOn: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
}

interface InterviewState {
  introMessage: string;
  questions: Question[];
  currentQuestionIndex: number;
  error: string | null;
}

const Interview: React.FC = () => {
  // URL parameters
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const userQuery = searchParams?.get("query");

  // Media state
  const [mediaState, setMediaState] = useState<MediaState>({
    isRecording: true,
    isMicrophoneOn: false,
    isCameraOn: true
  });

  // Interview state
  const [interviewState, setInterviewState] = useState<InterviewState>({
    introMessage: "",
    questions: [],
    currentQuestionIndex: 0,
    error: null
  });

  // Speech recognition state
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Initialize interview data
  useEffect(() => {
    if (!sessionId || !userQuery) return;

    fetch("/api/sessions/start-interview", {
      method: "POST",
      body: JSON.stringify({ sessionId, userQuery }),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch interview data");
        return response.json();
      })
      .then(data => {
        if (data.error) {
          setInterviewState(prev => ({ ...prev, error: data.error }));
        } else {
          setInterviewState(prev => ({
            ...prev,
            introMessage: data.introMessage,
            questions: data.questions,
            error: null
          }));
          
          // Add intro message to chat
          setMessages([{
            id: 0,
            text: data.introMessage,
            sender: "AI Interviewer"
          }]);
        }
      })
      .catch(error => {
        setInterviewState(prev => ({
          ...prev,
          error: `Error: ${error.message}`
        }));
      });
  }, [sessionId, userQuery]);

  // Initialize media devices
  useEffect(() => {
    initializeMedia();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        stopListening();
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
              setTranscript(prev => prev + event.results[i][0].transcript);
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening && mediaState.isMicrophoneOn && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.error("Error restarting recognition:", error);
            }
          }
        };
      }
    }
  }, []);

  // Audio analysis for speaking detection
  useEffect(() => {
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

      // Mute microphone by default
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
    } catch (err) {
      console.error("Failed to access media devices:", err);
      setInterviewState(prev => ({
        ...prev,
        error: "Failed to access camera or microphone"
      }));
    }
  };

  const toggleMedia = (type: "audio" | "video") => {
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
      
      if (newMicState) {
        startListening();
      } else {
        stopListening();
        setInterimTranscript("");
      }
    } else {
      setMediaState(prev => ({
        ...prev,
        isCameraOn: !prev.isCameraOn
      }));
    }
  };

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

  const resetTranscript = () => {
    if (transcript.trim()) {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          text: transcript,
          sender: "You"
        }
      ]);

      // Add next question from AI after user response
      if (interviewState.currentQuestionIndex < interviewState.questions.length) {
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 2,
            text: interviewState.questions[interviewState.currentQuestionIndex].text,
            sender: "AI Interviewer"
          }
        ]);
        
        setInterviewState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
    }
    setTranscript("");
    setInterimTranscript("");
  };

  const toggleRecording = () => {
    setMediaState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
  };

  return (
    <div className="gradient-background min-h-screen bg-gradient-to-r from-slate-900 to-slate-700 p-6">
      <div className="max-w-4xl mx-auto bg-opacity-50 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Virtual Interview</h1>

          {interviewState.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {interviewState.error}
            </div>
          ) : (
            <>
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
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Interview Progress</h2>
                <div className="h-48 overflow-y-auto space-y-2">
                  {messages.map((message) => (
                    <div key={message.id} className="p-2 bg-white rounded shadow">
                      <div className="text-sm font-medium">{message.sender}</div>
                      <div>{message.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mt-6">
                <h2 className="text-lg font-semibold mb-4">Live Transcript</h2>
                <div className="h-40 overflow-y-auto border rounded p-2 bg-white">
                  {transcript + interimTranscript}
                </div>
                <button
                  onClick={resetTranscript}
                  className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded"
                >
                  Submit Answer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;