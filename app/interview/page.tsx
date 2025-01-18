"use client";

import React, { useState, useEffect, useRef } from "react";
import { Camera, Mic, MicOff, Video, VideoOff, Pause, Play } from "lucide-react";

interface Message {
    id: number;
    sender: string;
    text: string;
    timestamp: string;
  }

const Interview = () => {
  const [mediaState, setMediaState] = useState({
    isRecording: true,
    isMicrophoneOn: true,
    isCameraOn: true
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    initializeMedia();
    return () => {
      // Cleanup media streams when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: { stop: () => any; }) => track.stop());
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Failed to access media devices:", err);
    }
  };

  const toggleMedia = (type: string) => {
    if (!streamRef.current) return;

    const tracks = type === 'audio' 
      ? streamRef.current.getAudioTracks()
      : streamRef.current.getVideoTracks();

    tracks.forEach((track: { enabled: boolean; }) => {
      track.enabled = !track.enabled;
    });

    setMediaState(prev => ({
      ...prev,
      [type === 'audio' ? 'isMicrophoneOn' : 'isCameraOn']: !prev[type === 'audio' ? 'isMicrophoneOn' : 'isCameraOn']
    }));
  };

  const toggleRecording = () => {
    setMediaState(prev => ({
      ...prev,
      isRecording: !prev.isRecording
    }));
  };

  const sendMessage = () => {
    const newMessage = {
      id: Date.now(),
      text: "New message",
      sender: "User",
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="gradient-background min-h-screen bg-gradient-to-r from-slate-900 to-slate-700 p-6">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-50 rounded-lg shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Virtual Interview</h1>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Interviewer View */}
            <div className="relative aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-slate-400">AI Interviewer</span>
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                Interviewer
              </div>
            </div>

            {/* User's Video */}
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden
             ${mediaState.isMicrophoneOn ? 'ring-4 ring-blue-500' : ''}">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                You
              </div>
            </div>
          </div>

          {/* Controls */}
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

          {/* Chat Section */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Chat</h2>
            <div className="h-48 overflow-y-auto space-y-2 mb-4">
              {messages.map(message => (
                <div key={message.id} className="p-2 bg-white rounded shadow">
                  <div className="text-sm font-medium">{message.sender}</div>
                  <div>{message.text}</div>
                  <div className="text-xs text-slate-500">{message.timestamp}</div>
                </div>
              ))}
            </div>
            <button
              onClick={sendMessage}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;