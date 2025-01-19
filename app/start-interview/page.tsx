"use client";

import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, Mic, MicOff, Video, VideoOff, RefreshCcw, FileText } from "lucide-react";

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
  isLive?: boolean;
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
  isInterviewComplete: boolean;
}

const Interview: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasPendingResults, setHasPendingResults] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isBotProcessing, setIsBotProcessing] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  // Speech synthesis configuration
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
    process.env.NEXT_PUBLIC_AZURE_REGION || "eastus"
  );
  speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
  const synthesizerRef = useRef<sdk.SpeechSynthesizer | null>(null);

  // State for tracking last spoken message
  const lastSpokenMessageIdRef = useRef<number>(-1);

  // State for AI avatar
  const [mouthOpen, setMouthOpen] = useState(false);
  const [modelSpeaking, setModelSpeaking] = useState(false);

  // URL parameters
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");
  const userQuery = searchParams?.get("query");

  const [mediaState, setMediaState] = useState<MediaState>({
    isRecording: true,
    isMicrophoneOn: false,
    isCameraOn: true,
  });

  const [interviewState, setInterviewState] = useState<InterviewState>({
    introMessage: "",
    questions: [],
    currentQuestionIndex: 0,
    error: null,
    isInterviewComplete: false,
  });

  // Function to speak text
  const speakText = (text: string) => {
    if (!synthesizerRef.current) return;

    setModelSpeaking(true); // Start animation

    synthesizerRef.current.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Speech synthesis completed.");
          setModelSpeaking(false); // Stop animation
        } else {
          console.error("Speech synthesis failed:", result.errorDetails);
          setModelSpeaking(false); // Stop animation
        }
      },
      (error) => {
        console.error("Error during speech synthesis:", error);
        setModelSpeaking(false); // Stop animation
      }
    );
  };

  // Effect for mouth animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (modelSpeaking) {
      const animate = () => {
        const interval = 100 + Math.random() * 150; // Random interval between 100-250ms
        intervalId = setTimeout(() => {
          setMouthOpen((prev) => !prev); // Toggle mouth state
          animate(); // Continue animation
        }, interval);
      };
      animate(); // Start animation
    } else {
      setMouthOpen(false); // Reset mouth state when not speaking
    }

    return () => {
      if (intervalId) clearTimeout(intervalId); // Cleanup interval
    };
  }, [modelSpeaking]);

  // Effect to handle new AI messages
  useEffect(() => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
      process.env.NEXT_PUBLIC_AZURE_REGION || "eastus"
    );
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    synthesizerRef.current = new sdk.SpeechSynthesizer(speechConfig);

    return () => {
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
        synthesizerRef.current = null; // Clear the reference
      }
    };
  }, []);
  //Clean up syntehsizer
  useEffect(() => {
    // Initialize synthesizer
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.NEXT_PUBLIC_AZURE_API_KEY || "",
      process.env.NEXT_PUBLIC_AZURE_REGION || "eastus"
    );
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  
    // Cleanup function
    return () => {
      if (synthesizer) {
        synthesizer.close();
      }
    };
  }, []);

  // Initialize interview data
  useEffect(() => {
    if (!sessionId || !userQuery) return;

    fetch("/api/sessions/start-interview", {
      method: "POST",
      body: JSON.stringify({ sessionId, userQuery }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch interview data");
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          setInterviewState((prev) => ({ ...prev, error: data.error }));
        } else {
          setInterviewState((prev) => ({
            ...prev,
            introMessage: data.introMessage,
            questions: data.questions,
            error: null,
          }));

          setMessages([
            {
              id: 0,
              text: data.introMessage,
              sender: "MockMate",
            },
          ]);
        }
      })
      .catch((error) => {
        setInterviewState((prev) => ({
          ...prev,
          error: `Error: ${error.message}`,
        }));
      });
  }, [sessionId, userQuery]);

  // Initialize media devices
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

  // Create a computed messages array that includes the live transcript
  const allMessages = React.useMemo(() => {
    const messagesList = [...messages];

    if (transcript || interimTranscript) {
      messagesList.push({
        id: -1,
        text: transcript + interimTranscript,
        sender: "You",
        isLive: true,
      });
    }

    if (isBotProcessing) {
      messagesList.push({
        id: -2,
        text: "MockMate is thinking...",
        sender: "MockMate",
        isLive: false,
      });
    }

    return messagesList;
  }, [messages, transcript, interimTranscript, isBotProcessing]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    } catch (err) {
      console.error("Failed to access media devices:", err);
      setInterviewState((prev) => ({
        ...prev,
        error: "Failed to access camera or microphone",
      }));
    }
  };

  const toggleMedia = (type: "audio" | "video") => {
    if (!streamRef.current) return;

    const tracks = type === "audio" ? streamRef.current.getAudioTracks() : streamRef.current.getVideoTracks();

    tracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    if (type === "audio") {
      const newMicState = !mediaState.isMicrophoneOn;
      setMediaState((prev) => ({
        ...prev,
        isMicrophoneOn: newMicState,
      }));

      if (newMicState) {
        startListening();
      } else {
        stopListening();
        setInterimTranscript("");
      }
    } else {
      setMediaState((prev) => ({
        ...prev,
        isCameraOn: !prev.isCameraOn,
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

  const resetTranscript = async () => {
    if (hasPendingResults) {
      console.log("Waiting for interim results to finalize before resetting.");
      return;
    }
    if (transcript.trim()) {
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

        setIsBotProcessing(true);

        try {
          const response = await fetch("/api/sessions/response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              userResponse: transcript,
            }),
          });

          if (!response.ok) throw new Error("Failed to fetch AI feedback");

          const data = await response.json();

          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 2,
              text: data.botReply,
              sender: "MockMate",
            },
          ]);

          if (interviewState.currentQuestionIndex < interviewState.questions.length) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 3,
                text: interviewState.questions[interviewState.currentQuestionIndex].text,
                sender: "MockMate",
              },
            ]);

            setInterviewState((prev) => ({
              ...prev,
              currentQuestionIndex: prev.currentQuestionIndex + 1,
            }));
          } else {
            setInterviewState((prev) => ({
              ...prev,
              isInterviewComplete: true,
            }));

            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 3,
                text: "Thank you for completing the interview!",
                sender: "MockMate",
              },
            ]);
          }
        } catch (error) {
          console.error("Error fetching AI feedback:", error);
          setInterviewState((prev) => ({
            ...prev,
            error: "Failed to fetch AI feedback",
          }));
        } finally {
          setIsBotProcessing(false);
        }
      }
    }
    setTranscript("");
    setInterimTranscript("");
  };

  const toggleRecording = () => {
    setMediaState((prev) => ({
      ...prev,
      isRecording: !prev.isRecording,
    }));
  };

  const switchPerspective = () => {
    if(!router) return;
    router.push("/summary");
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
                <div
                  className={`relative aspect-video bg-slate-800 rounded-lg flex items-center justify-center ${
                    modelSpeaking ? "ring-4 ring-blue-500 transition-all duration-200" : ""
                  }`}
                >
                  {/* Face Container */}
                  <div className="w-48 h-48 relative">
                    {/* Head */}
                    <div className="absolute inset-0 bg-zinc-200 rounded-full" />

                    {/* Eyes */}
                    <div className="absolute w-full top-1/3 flex justify-center space-x-8">
                      <div className="w-4 h-4 bg-slate-800 rounded-full" />
                      <div className="w-4 h-4 bg-slate-800 rounded-full" />
                    </div>

                    {/* Mouth */}
                    <div
                      className={`absolute left-1/2 bottom-1/4 -translate-x-1/2 w-16 ${
                        mouthOpen ? "h-6" : "h-1"
                      } bg-slate-800 rounded-full transition-all duration-150`}
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                    Interviewer
                  </div>
                </div>

                <div
                  className={`relative aspect-video bg-slate-800 rounded-lg overflow-hidden ${
                    isSpeaking ? "ring-4 ring-blue-500" : ""
                  }`}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                    You
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-6">
                <button
                  title="Switch to interviewee perspective"
                  onClick={switchPerspective}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <RefreshCcw size={20} />
                </button>

                <button
                  title="Mute/unmute"
                  onClick={() => toggleMedia("audio")}
                  className={`p-3 rounded-full ${
                    mediaState.isMicrophoneOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600 hover:bg-red-500"
                  } text-white`}
                >
                  {mediaState.isMicrophoneOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button
                  title="Toggle camera"
                  onClick={() => toggleMedia("video")}
                  className={`p-3 rounded-full ${
                    mediaState.isCameraOn ? "bg-slate-700 hover:bg-slate-600" : "bg-red-600 hover:bg-red-500"
                  } text-white`}
                >
                  {mediaState.isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                  title="Log answer"
                  onClick={resetTranscript}
                  className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
                >
                  <FileText size={20} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4">Chat</h2>
                <div
                  ref={chatBoxRef}
                  className="h-48 overflow-y-auto space-y-2"
                >
                  {allMessages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`p-2 bg-white rounded shadow ${
                        message.isLive ? "border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <div className="text-sm font-medium flex justify-between">
                        <span>{message.sender}</span>
                        {message.isLive && <span className="text-blue-500 text-xs">Live</span>}
                      </div>
                      <div>{message.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Interview;