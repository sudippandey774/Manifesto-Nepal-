from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
import requests
from dotenv import load_dotenv
from manifestos_data import MANIFESTOS, TOPICS

load_dotenv()

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
DB_PATH = "manifestos.db"


def init_db():
    """Create tables and load manifesto data on first run."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS parties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            party_name TEXT NOT NULL,
            short_name TEXT NOT NULL,
            color TEXT NOT NULL,
            symbol TEXT NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            party_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            content TEXT NOT NULL,
            FOREIGN KEY (party_id) REFERENCES parties(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("SELECT COUNT(*) FROM parties")
    if c.fetchone()[0] == 0:
        print("Loading manifesto data into database...")
        for manifesto in MANIFESTOS:
            c.execute(
                "INSERT INTO parties (party_name, short_name, color, symbol) VALUES (?, ?, ?, ?)",
                (manifesto["party_name"], manifesto["short_name"], manifesto["color"], manifesto["symbol"])
            )
            party_id = c.lastrowid
            for topic, content in manifesto["policies"].items():
                c.execute(
                    "INSERT INTO policies (party_id, topic, content) VALUES (?, ?, ?)",
                    (party_id, topic, content.strip())
                )
        print("Manifesto data loaded successfully!")

    conn.commit()
    conn.close()


def get_all_manifestos_text():
    """Get all manifesto content as a formatted string for AI context."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("""
        SELECT p.party_name, po.topic, po.content
        FROM parties p
        JOIN policies po ON p.id = po.party_id
        ORDER BY p.id, po.topic
    """)

    rows = c.fetchall()
    conn.close()

    manifesto_text = ""
    current_party = ""
    for party_name, topic, content in rows:
        if party_name != current_party:
            manifesto_text += f"\n\n=== {party_name} ===\n"
            current_party = party_name
        manifesto_text += f"\n[{topic.upper().replace('_', ' ')}]:\n{content}\n"

    return manifesto_text


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Nepal Manifesto AI API is running"})


@app.route("/api/parties", methods=["GET"])
def get_parties():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, party_name, short_name, color, symbol FROM parties")
    parties = [
        {"id": row[0], "party_name": row[1], "short_name": row[2], "color": row[3], "symbol": row[4]}
        for row in c.fetchall()
    ]
    conn.close()
    return jsonify(parties)


@app.route("/api/topics", methods=["GET"])
def get_topics():
    return jsonify(TOPICS)


@app.route("/api/compare", methods=["GET"])
def compare_topic():
    topic = request.args.get("topic", "")
    if not topic:
        return jsonify({"error": "topic parameter required"}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT p.party_name, p.short_name, p.color, p.symbol, po.content
        FROM parties p
        JOIN policies po ON p.id = po.party_id
        WHERE po.topic = ?
        ORDER BY p.id
    """, (topic,))

    results = [
        {
            "party_name": row[0],
            "short_name": row[1],
            "color": row[2],
            "symbol": row[3],
            "content": row[4]
        }
        for row in c.fetchall()
    ]
    conn.close()

    if not results:
        return jsonify({"error": f"Topic '{topic}' not found"}), 404

    return jsonify(results)


@app.route("/api/ask", methods=["POST"])
def ask_ai():
    """Ask AI a question about party manifestos using OpenRouter."""
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"error": "Question is required"}), 400

    if not OPENROUTER_API_KEY:
        return jsonify({"error": "OpenRouter API key not configured. Add OPENROUTER_API_KEY to .env file"}), 500

    manifesto_context = get_all_manifestos_text()

    prompt = f"""You are a nonpartisan civic education assistant helping Nepali citizens understand what political parties promise in their manifestos.

Here are the complete manifesto policies from Nepal's major political parties:

{manifesto_context}

USER QUESTION: {question}

INSTRUCTIONS:
- Answer ONLY based on what the manifestos say above. Do not add your own opinions.
- Compare all 5 parties: Nepali Congress (NC), CPN-UML, CPN (Maoist Centre), Rastriya Swatantra Party (RSP), and Rastriya Prajatantra Party (RPP).
- Format your response as JSON with this exact structure:
{{
  "summary": "A 2-3 sentence overall summary answering the question",
  "party_answers": [
    {{
      "party": "Party Name",
      "short_name": "SHORT",
      "answer": "What this specific party promises on this topic in 2-4 sentences"
    }}
  ],
  "disclaimer": "This comparison is based solely on party manifestos and does not reflect actual implementation."
}}

Return ONLY valid JSON, no other text."""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            },
            json={
                "model": "openrouter/auto",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
            },
            timeout=30,
        )
        response.raise_for_status()
        response_data = response.json()

        response_text = response_data["choices"][0]["message"]["content"].strip()

        # Strip markdown code fences if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        result = json.loads(response_text)

        # Save to history
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute(
            "INSERT INTO chat_history (question, answer) VALUES (?, ?)",
            (question, json.dumps(result))
        )
        conn.commit()
        conn.close()

        return jsonify(result)

    except json.JSONDecodeError as e:
        return jsonify({"error": f"AI response parsing error: {str(e)}", "raw": response_text}), 500
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"OpenRouter API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"AI error: {str(e)}"}), 500


@app.route("/api/history", methods=["GET"])
def get_history():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT question, created_at FROM chat_history ORDER BY created_at DESC LIMIT 10")
    history = [{"question": row[0], "asked_at": row[1]} for row in c.fetchall()]
    conn.close()
    return jsonify(history)


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Starting Nepal Manifesto AI Backend...")
    init_db()
    print("API running at http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
