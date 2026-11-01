# ✈️ TravelMate AI

> **AI-Powered Personalized Travel Itinerary Planner**  
> A full-stack SaaS web application that generates day-by-day travel itineraries, manages trips, calculates budgets, and exports PDFs.

[![Live Web App](https://img.shields.io/badge/Live_App-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://travelmate-ai-2slv.onrender.com)
[![GitHub](https://img.shields.io/badge/Developer-@tejus29--bot-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tejus29-bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

![TravelMate AI](https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80)

---

## 🌟 Features

- 🤖 **AI-Powered Itineraries** — Generates customized day-by-day travel plans based on destination, travel style, and budget.
- 🗺️ **Interactive Maps** — Leaflet / OpenStreetMap integration with pinned landmarks for every itinerary day.
- 💰 **Smart Budget Calculator** — Real-time expense breakdown across accommodation, meals, transport, and activities.
- 📄 **PDF Export** — High-resolution, beautifully formatted PDF travel guides ready to download and print.
- 🔗 **Trip Sharing** — Generate shareable public links to send itineraries to family and travel companions.
- 🔐 **Supabase Cloud Auth & Database** — Secure user authentication, JWT-protected endpoints, and Row Level Security (RLS) PostgreSQL database.
- 📱 **Fully Responsive UI** — Seamless experience optimized for mobile, tablet, and desktop screens with Tailwind CSS and Framer Motion.
- ⚡ **Zero-Config Demo Mode** — Fully interactive demo mode allowing instant testing even without external API credentials.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic |
| **Database & Auth** | Supabase Cloud (PostgreSQL with RLS) |
| **PDF Generation** | ReportLab |
| **Maps** | Leaflet / OpenStreetMap |
| **Cloud Hosting** | Render Cloud |

---

## 🚀 Live Demo

- **Live Web Application:** [https://travelmate-ai-2slv.onrender.com](https://travelmate-ai-2slv.onrender.com)
- **API Health Check:** [https://travelmate-ai-2slv.onrender.com/api/health](https://travelmate-ai-2slv.onrender.com/api/health)
- **Interactive API Documentation:** [https://travelmate-ai-2slv.onrender.com/docs](https://travelmate-ai-2slv.onrender.com/docs)

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js 18+**
- **Python 3.11+**

### 1. Clone the repository
```bash
git clone https://github.com/tejus29-bot/travelmate-ai.git
cd travelmate-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the app locally.

---

## 👤 Author

**Tejus Chourasiya**
- GitHub: [@tejus29-bot](https://github.com/tejus29-bot)
- Project: [TravelMate AI](https://github.com/tejus29-bot/travelmate-ai)

---

## 📄 License
This project is licensed under the MIT License.
