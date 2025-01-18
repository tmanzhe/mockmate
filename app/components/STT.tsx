import { FC, useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface STTProps {
  isMicrophoneOn: boolean;
}

const STT: FC<STTProps> = ({ isMicrophoneOn }) => {
  const [fullTranscript, setFullTranscript] = useState<string>("");
  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Only append finalTranscript (confirmed transcription) to the full transcript
  useEffect(() => {
    if (finalTranscript) {
      setFullTranscript((prev) => prev + " " + finalTranscript);
      resetTranscript(); // Clear the library's temporary transcript
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(() => {
    if (isMicrophoneOn) {
        SpeechRecognition.startListening({ continuous: true, interimResults: true }); // Start speech recognition if microphone is on
    } else {
        SpeechRecognition.stopListening(); // Stop speech recognition if microphone is off
    }
  }, [isMicrophoneOn]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>;
  }

  return (
    <div>
      {fullTranscript}
    </div>
  );
};

export default STT;
