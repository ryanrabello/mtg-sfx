import requests
import os
from dotenv import load_dotenv
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent
from langchain.globals import set_verbose
from langchain_core.tools import tool

# Load environment variables
load_dotenv()

set_verbose(True)

checkpointer = InMemorySaver()

soundsCache = {}

# Freesound API configuration
FREESOUND_API_KEY = os.getenv("FREESOUND_API_KEY")
FREESOUND_BASE_URL = "https://freesound.org/apiv2"


def search_freesound(query: str) -> str:
    """Search Freesound API for sound effects."""
    print(f"Searching for {query}")
    headers = {"Authorization": f"Token {FREESOUND_API_KEY}"}
    params = {
        "query": query,
        "fields": "id,name,description,duration,type",
        "page_size": 4,
        "filter": "duration:[1 TO 20]",
    }

    response = requests.get(
        f"{FREESOUND_BASE_URL}/search/text/", headers=headers, params=params
    )

    if response.status_code == 200:
        results = response.json()
        if results.get("results"):
            sounds = results["results"]
            # Add sounds to cache using their IDs as keys
            for sound in sounds:
                soundsCache[sound["id"]] = sound

            # Create a text-only response with sound details
            text_response = []
            for sound in sounds:
                text_response.append(
                    f"""ID: {sound['id']}
Name: {sound['name']}
Duration: {sound['duration']}s
Description: {sound['description']}
"""
                )
            sound_list = "\n".join(text_response)
            print(sound_list)
            return sound_list
    return "No results found. Try another query."


@tool(return_direct=True)
def play_sound(sound_id: str) -> str:
    """Play a sound effect."""
    print(f"Playing sound: {sound_id}")
    # Convert sound_id to integer for cache lookup
    sound_id_int = int(sound_id)
    if soundsCache.get(sound_id_int):
        sound = soundsCache[sound_id_int]
        print(f"Playing sound: {sound['name']}")
        return {"id": sound_id, "sound_name": sound["name"], "type": sound["type"]}
    return "Sound not found. Try another query."

@tool(return_direct=True)
def continue_listening() -> str:
    """Continue listening to the transcript."""
    return "Continuing..."


agent = create_react_agent(
    "openai:gpt-4o-mini",
    tools=[search_freesound, play_sound],
    prompt="""You are a Magic: The Gathering sound effect assistant. 
Your job is to 
1. Listen to the transcript of an MTG commander match. 
2. If applicable, like when a player casts a spell or looses life. Search freesound for relevant sound effects
3. Only if there is a good match, pick one of the sound effects and play it.
4. Continue listening to the transcript.

Freesounds has general sound effects, feel free to get creative. A card like "Dragonback lancer" for example could have a query of "dragon roaring" or "sword swing".
""",
    checkpointer=checkpointer,
)
