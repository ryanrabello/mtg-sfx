import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Howl } from "howler";
import "./App.css";

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
  soundUrl?: string;
  soundId?: number;
  soundType?: string;
  soundName?: string;
}

const threadID = uuidv4();

let recognitionVar: SpeechRecognition | null = null;
window.recognition = recognitionVar;

const playSound = (soundId: number, soundType: string) => {
  const sound = new Howl({
    src: [`http://localhost:5000/api/download_sound/${soundId}`],
    format: soundType,
  });
  sound.play();
};

const startListening = (onEnd: () => void, onSoundPlayed: (entry: LogEntry) => void) => {
  console.log("Starting recognition");
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

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
      const entry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        text: lastMessage,
        soundId: data.id,
        soundType: data.type,
        soundName: data.sound_name,
      };
      onSoundPlayed(entry);
      playSound(data.id, data.type);
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
  Howler.stop(); // Stop all playing sounds
};

function App() {
  const [isListening, setIsListening] = useState(false);
  const [soundHistory, setSoundHistory] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (isListening) {
      startListening(
        () => {
          setIsListening(false);
        },
        (entry) => {
          setSoundHistory((prev) => [entry, ...prev]);
        }
      );
    } else {
      stopListening();
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    setIsListening(!isListening);
  }, [isListening]);

  const replaySound = useCallback((entry: LogEntry) => {
    if (entry.soundId && entry.soundType) {
      playSound(entry.soundId, entry.soundType);
    }
  }, []);

  return (
    <div className="app-container">
      <h1>🪄 MTG SoundFX Companion</h1>
      
      <div className="controls">
        <button 
          className={`listen-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
        <div className="status">
          {isListening ? "🎤 Listening..." : "⏸️ Paused"}
        </div>
      </div>

      <div className="sound-history">
        <h2>Sound History</h2>
        <div className="history-list">
          {soundHistory.map((entry, index) => (
            <div key={index} className="history-item">
              <div className="history-content">
                <span className="timestamp">[{entry.timestamp}]</span>
                <span className="text">{entry.text}</span>
                <span className="sound-name">{entry.soundName}</span>
              </div>
              <button 
                className="replay-button"
                onClick={() => replaySound(entry)}
              >
                🔄 Replay
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
