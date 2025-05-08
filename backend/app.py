import os
from flask import Flask, json, request, jsonify, send_file
from flask_cors import CORS
import requests
from agent import agent, search_freesound

app = Flask(__name__)
CORS(app)


@app.route("/api/add_transcript", methods=["POST"])
def add_transcript():
    data = request.json
    text = data.get("text", "")
    thread_id = data.get("thread_id", "")

    if not text or not thread_id:
        return jsonify({"error": "No text or thread_id provided"}), 400

    try:
        result = agent.invoke(
            {
                "messages": [{"role": "user", "content": text}],
            },
            {"configurable": {"thread_id": thread_id}},
        )

        print(f"Result: {result}")

        

        sound = result["messages"][-1].content

        print(sound)

        return jsonify(json.loads(sound))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/download_sound/<int:sound_id>", methods=["GET"])
def download_sound(sound_id):
    try:
        # Get the Freesound API key from environment variables
        freesound_api_key = os.getenv("FREESOUND_API_KEY")
        if not freesound_api_key:
            return jsonify({"error": "Freesound API key not configured"}), 500

        # TODO: Forward auth header from client (after oAuth)
        # headers = {"Authorization": f"Authorization {freesound_api_key}"}
        cookies = {"sessionid": os.getenv("FREESOUND_SESSION_ID")}
        response = requests.get(
            f"https://freesound.org/apiv2/sounds/{sound_id}/download/",
            # headers=headers,
            cookies=cookies,
            stream=True,
        )

        if response.status_code != 200:
            return jsonify({"error": f"Failed to download sound: {response.status_code}"}), response.status_code

        # Stream the file back to the client
        return send_file(
            response.raw,
            mimetype=response.headers.get("content-type", "audio/mpeg"),
            as_attachment=True,
            download_name=f"sound_{sound_id}.mp3",
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# TODO: Build a proxy to download the sound file


if __name__ == "__main__":
    app.run(debug=True, port=5000)


"""
Example input
{
    "text": "I cast Fireball",
    "thread_id": "1",
}
"""
