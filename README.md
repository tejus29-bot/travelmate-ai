# ✈️ TravelMate AI

> **AI-Powered Personalized Travel Itinerary Planner**  
> A full-stack SaaS web application that generates day-by-day travel itineraries using OpenAI GPT.

![TravelMate AI](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80)

---

## 🌟 Features

- 🤖 **AI-Powered Itineraries** — GPT-4o-mini generates personalized day-by-day travel plans
- 🗺️ **Interactive Maps** — OpenStreetMap with location markers for every activity
- 💰 **Smart Budget Planning** — Budget breakdown by accommodation, food, transport, activities
- 📄 **PDF Export** — Download your itinerary as a formatted PDF
- 🔗 **Trip Sharing** — Share itineraries via unique shareable links
- 🔐 **Supabase Auth** — Secure sign up, login, and profile management
- 📱 **Fully Responsive** — Works beautifully on mobile, tablet, and desktop
- 🎭 **Demo Mode** — Works without API keys for demonstration

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Python, FastAPI, Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Authentication |
| AI | OpenAI GPT-4o-mini |
| Maps | React Leaflet (OpenStreetMap) |
| PDF | ReportLab |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Quick Start

### Prerequisites

Before starting, install:
1. **Node.js** — https://nodejs.org (download LTS version)
2. **Python 3.11+** — https://python.org
3. **Git** — https://git-scm.com

### Step 1 — Set Up Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"** and fill in:
   - Project name: `travelmate-ai`
   - Database password: (save this!)
   - Region: closest to you
3. Wait ~2 minutes for the project to be ready
4. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon/public` key
   - `service_role` key (keep secret!)
5. Go to **SQL Editor** → click **"New Query"**
6. Paste the contents of `supabase/migrations/001_initial_schema.sql`
7. Click **Run** — this creates all tables and security policies

### Step 2 — Get OpenAI API Key (Optional — Demo Mode works without it)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / log in
3. Go to **API Keys** → **Create new secret key**
4. Copy it (you won't see it again!)
5. Add some credits at **Billing** (starts at \$5)

### Step 3 — Configure Environment Variables

**Backend:**
```bash
cd backend
copy .env.example .env
# Now open .env in Notepad and fill in your values
```

**Frontend:**
```bash
cd frontend
copy .env.example .env
# Now open .env in Notepad and fill in your values
```

### Step 4 — Install and Run Backend

Open **PowerShell** and run:
```powershell
cd "c:\Users\lenovo\Downloads\TRAVELMATE_AI\backend"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

You should see: `Uvicorn running on http://127.0.0.1:8000`

### Step 5 — Install and Run Frontend

Open a **new PowerShell window** and run:
```powershell
cd "c:\Users\lenovo\Downloads\TRAVELMATE_AI\frontend"
npm install
npm run dev
```

You should see: `Local: http://localhost:5173/`

### Step 6 — Open the App

Open your browser and go to: **http://localhost:5173**

🎉 TravelMate AI is running!

---

## 📁 Project Structure

```
TravelMate-AI/
├── frontend/                  # React/Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/            # Base UI (Button, Input, Card...)
│   │   │   ├── layout/        # Navbar, Footer
│   │   │   └── trip/          # Trip-specific components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React Context (Auth)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API calls (axios)
│   │   └── assets/            # Images, icons
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Python/FastAPI backend
│   ├── app/
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic (AI, PDF)
│   │   ├── schemas/           # Pydantic models
│   │   ├── core/              # Config, settings
│   │   └── database/          # Supabase client
│   ├── main.py
│   └── requirements.txt
│
├── supabase/
│   └── migrations/            # SQL schema files
│
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/destinations` | Popular destinations list |
| POST | `/api/trips` | Create new trip |
| GET | `/api/trips` | Get user's trips |
| GET | `/api/trips/{id}` | Get specific trip |
| PUT | `/api/trips/{id}` | Update trip |
| DELETE | `/api/trips/{id}` | Delete trip |
| POST | `/api/ai/generate-itinerary` | Generate AI itinerary |
| POST | `/api/ai/regenerate-day` | Regenerate single day |
| POST | `/api/ai/regenerate-itinerary` | Regenerate full itinerary |
| GET | `/api/trips/{id}/itinerary` | Get saved itinerary |
| GET | `/api/trips/{id}/download-pdf` | Download PDF |
| GET | `/api/trips/{id}/share` | Get share token |
| GET | `/api/shared/{token}` | View shared itinerary |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Set **Root Directory** to `frontend`
5. Add environment variables (VITE_SUPABASE_URL etc.)
6. Deploy!

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy!

---

## 🔒 Security

- ✅ API keys stored in environment variables only
- ✅ Supabase Row Level Security (RLS) prevents unauthorized data access
- ✅ JWT token verification on all protected endpoints
- ✅ Input validation via Pydantic
- ✅ CORS configured for specific frontend origin
- ✅ Service role key never exposed to frontend

---

## 📝 Demo Mode

TravelMate AI works without any API keys in Demo Mode:
- AI itinerary generation returns realistic sample data
- Clearly labeled as "[DEMO]" data
- All UI features work normally
- Set `DEMO_MODE=false` in `.env` to enable live AI generation

---

## 👨‍💻 Built With

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [React Leaflet](https://react-leaflet.js.org/)

---

## 📄 License

MIT License — free to use for educational and portfolio purposes.

---

*Built as a final-year engineering project demonstrating full-stack AI application development.*
