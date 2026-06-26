# 🗳️ Nepal Manifesto AI — Hackathon Project

Compare Nepal's party manifestos using AI. Ask questions, get side-by-side answers.

---

## 📁 Project Structure

```
nepal-manifesto-ai/
├── frontend/        ← React + TypeScript (Node.js)
├── backend/         ← Python Flask + Gemini AI + SQLite
└── README.md
```

---

## ⚡ Quick Start (Step by Step)

### Step 1 — Get a Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key — you'll need it in Step 3

---

### Step 2 — Set Up the Backend

```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

### Step 3 — Configure Environment

```bash
# Still in /backend
# Create a .env file:
echo GEMINI_API_KEY=your_key_here > .env
```

Replace `your_key_here` with your actual Gemini API key.

---

### Step 4 — Start the Backend

```bash
# Still in /backend, with venv active:
python app.py
```

You should see: `Running on http://127.0.0.1:5000`

---

### Step 5 — Set Up the Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

You should see: `Local: http://localhost:5173`

---

### Step 6 — Open the App

Visit **http://localhost:5173** in your browser. 🎉

---

## 🚀 Git Commands for Hackathon

```bash
# Initialize
git init
git add .
git commit -m "Initial commit: Nepal Manifesto AI"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/nepal-manifesto-ai.git
git branch -M main
git push -u origin main
```

---

## 🛠️ Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React + TypeScript + Vite   |
| Backend  | Python Flask                |
| AI       | Google Gemini 1.5 Flash     |
| Database | SQLite (built-in, no setup) |
| Styling  | CSS (no extra dependencies) |

---

## 📝 Notes

- The SQLite database (`manifestos.db`) is created automatically on first run
- Manifesto data is pre-loaded from `backend/manifestos_data.py`
- The app is fully nonpartisan — AI only reflects what manifestos say
- CORS is configured so frontend and backend can talk on localhost
