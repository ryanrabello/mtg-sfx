# MTG SoundFX Companion

A mobile web application that enhances Magic: The Gathering Commander games by adding immersive sound effects in real-time. The app listens to table-talk and gameplay announcements, recognizes key game events, and plays appropriate sound effects.

## Features

- Real-time voice recognition for game events
- AI-powered sound effect selection
- Beautiful, mobile-friendly interface
- Volume control and mute options
- Event log with timestamps
- Sound effects from Freesound.org

## Prerequisites

- Node.js 18+ and Yarn
- Python 3.8+
- OpenAI API key
- Freesound.org API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mtg-soundfx-companion.git
cd mtg-soundfx-companion
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
OPENAI_API_KEY=your_openai_api_key_here
FREESOUND_API_KEY=your_freesound_api_key_here
```

4. Set up the frontend:
```bash
cd frontend
yarn install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. In a new terminal, start the frontend development server:
```bash
cd frontend
yarn dev
```

3. Open your browser to `http://localhost:5173`

## Usage

1. Open the app on your mobile device
2. Place the device near the game table
3. Tap the microphone button to start listening
4. The app will automatically detect game events and play appropriate sound effects
5. Use the volume slider to adjust sound levels
6. Tap the microphone button again to pause listening

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 