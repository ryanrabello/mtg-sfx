import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Howl } from "howler";

// interface SpeechRecognitionEvent extends Event {
//   results: SpeechRecognitionResultList;
//   resultIndex: number;
// }

// interface SpeechRecognitionErrorEvent extends Event {
//   error: string;
// }

// declare global {
//   interface Window {
//     SpeechRecognition: new () => SpeechRecognitionEvent;
//   }
// }

interface LogEntry {
  timestamp: string;
  text: string;
  category: string;
  soundUrl?: string;
}

const threadID = uuidv4();

let recognitionVar: SpeechRecognition | null = null;
window.recognition = recognitionVar;
const startListening = (onEnd: () => void) => {
  console.log("Starting recognition");
  const recognition = new webkitSpeechRecognition();
  // const speechRecognitionList = new SpeechGrammarList();
  // speechRecognitionList.addFromString(grammar, 1);
  // recognition.grammars = speechRecognitionList;
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = async (event: SpeechRecognitionEvent) => {
    const lastMessage = Array.from(event.results).pop()[0].transcript;
    console.log("Transcript", lastMessage);

    const response = await fetch("http://localhost:5000/api/add_transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: lastMessage, thread_id: threadID }),
    });

    const data = await response.json();

    if (data.id) {
      const sound = new Howl({
        src: [`http://localhost:5000/api/download_sound/${data.id}`],
        format: data.type,
      });
      sound.play();
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error("Speech recognition error:", event.error);
  };
  recognition.onend = () => {
    console.log("Recognition ended");
    onEnd();
  };
  console.log("Starting recognition", recognition);
  recognition.start();
};

const stopListening = () => {
  recognitionVar?.stop();
};

function App() {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isListening) {
      startListening(() => {
        setIsListening(false);
      });
    } else {
      stopListening();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    setIsListening(!isListening);
  }, [isListening]);

  return (
    <>
      <button onClick={toggleListening}>
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>
      {isListening ? "Listening" : "Not Listening"}
    </>
  );
}

export default App;
