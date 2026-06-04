# 🌾 Bhoomi Bandhu — Smart Agriculture Assistant

A full-stack mobile-first web application for Indian farmers providing crop info, AI disease detection, mandi prices, government schemes, weather, and more in **English, Hindi, and Telugu**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env      # edit .env with your API keys
npm install
npm run dev               # runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev               # runs on http://localhost:5173
```

---

## 🔑 Environment Variables (backend/.env)

| Key | Description |
|-----|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `WEATHER_API_KEY` | OpenWeatherMap API key |
| `AI_API_KEY` | OpenAI / Gemini API key for chatbot |
| `MAPS_API_KEY` | Google Maps API key |

> In development, OTP codes are printed to the server console.

---

## 📱 Features

| Module | Description |
|--------|-------------|
| 🌱 **Crops** | Detailed info for 12+ Indian crops |
| 🔬 **Disease Detection** | AI-powered plant disease detection from photos |
| 🧪 **Fertilizer Recognition** | Identify fertilizers from product images |
| 🛡️ **Pesticide Recognition** | Identify pesticides with hazard warnings |
| 📊 **Mandi Rates** | Live market prices with trend charts |
| 📋 **Govt. Schemes** | PM-KISAN, PMFBY, KCC, eNAM, PMKSY & more |
| 🌤 **Weather** | 7-day forecast with farming advisories |
| 🤖 **AI Chatbot** | Ask farming questions in EN/HI/TE |
| 🎙 **Voice Assistant** | Speech-to-text & text-to-speech |
| 📅 **Crop Calendar** | Personalized sowing-to-harvest schedule |
| 📰 **News** | Latest agriculture news |
| 📍 **Nearby Services** | Find fertilizer shops, soil testing centers |
| 🌍 **Soil Analyzer** | NPK + pH based crop & fertilizer recommendations |
| 🔔 **Notifications** | Weather, market, pest & scheme alerts |

---

## 🏗️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Recharts, i18next
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **AI**: Rule-based + OpenAI/Gemini integration ready
- **Languages**: English, Hindi (हिंदी), Telugu (తెలుగు)
- **PWA**: Installable, offline-capable

---

## 📁 Project Structure

```
farmer/
├── backend/
│   ├── models/          # Mongoose models (User, Crop, Scheme)
│   ├── routes/          # API routes (14 modules)
│   ├── middleware/       # Auth middleware
│   └── server.js        # Express entry point
└── frontend/
    └── src/
        ├── pages/       # All 16 page components
        ├── components/  # Layout, BottomNav
        ├── context/     # AppContext (auth, lang, theme)
        ├── i18n/        # EN/HI/TE translations
        └── lib/         # Axios API client
```
