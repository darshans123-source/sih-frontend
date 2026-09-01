# VAYU-DRISHTI: Convective-Scale Nowcasting Platform
### Smart India Hackathon (SIH26084) — Severe Weather Intelligence for Thunderstorms, Hail, and Cloudbursts

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial%20DB-336791.svg?logo=postgresql&logoColor=white)](https://postgis.net/)

---

## 📌 Executive Summary

**VAYU-DRISHTI** is a high-resolution, operational command-center nowcasting platform engineered specifically for **SIH26084**. It solves the critical challenge of hyper-local sudden convective disasters by providing **0–60 minute forward nowcasts** for **Thunderstorms, Destructive Hail, and Cloudburst Deluges**.

### Key Highlights & Constraints Adherence:
1. **Strict Geolocation Policy**: The application exclusively uses the browser's HTML5 Geolocation API (`navigator.geolocation`). Manual city search, map clicking to change coordinates, or IP approximations are intentionally omitted to provide accurate point-source nowcasts.
2. **Multi-Hazard ML Risk Engine**: Evaluates atmospheric soundings (CAPE, CIN, Lifted Index, 0-6km Bulk Shear, PWAT, VIL, radar dBZ) to categorize threat levels into `LOW`, `MODERATE`, `HIGH`, and `SEVERE`.
3. **Interactive Vector Doppler Map**: Centered on the user's GPS coordinates, displaying tracked storm cell centroids, velocity vectors, precipitation envelopes, and `NOW`, `+15`, `+30`, `+45`, `+60` min kinematic advection trajectories.
4. **Physical Explainability ("Why this risk?")**: Transparent diagnostic attribution detailing thermodynamic buoyancy, column saturation, and vertical shear forcing.
5. **Real-time Alert Engine**: Audio chimes synthesized via native Web Audio API (zero external sound file dependencies) + Desktop Notifications + Acknowledgment workflow.
6. **Live Data & Demo Mode**: Clean `WeatherProvider` adapter interface supporting both live meteorological feeds (Open-Meteo / Doppler radar networks) and deterministic physical simulation scenarios (`NORMAL`, `DEVELOPING_STORM`, `SEVERE_CONVECTIVE_EVENT`).

---

## 🏗️ Architecture

```
sih/
├── backend/
│   ├── app/
│   │   ├── api/             # REST endpoints & WebSocket streams
│   │   ├── core/            # Convective Alert Engine
│   │   ├── models/          # Typed Pydantic schemas & SQLAlchemy ORM
│   │   ├── providers/       # Base, Open-Meteo Live, and Mock Deterministic providers
│   │   ├── services/        # Nowcast orchestration service
│   │   ├── config.py        # Environment & runtime settings
│   │   └── main.py          # FastAPI application
│   ├── requirements.txt     # Python backend dependencies
│   ├── run.py               # Uvicorn entry point
│   └── test_backend.py      # Automated backend verification test suite
├── database/
│   ├── connection.py        # Engine factory with PostGIS / SQLite spatial fallback
│   ├── init_db.py           # Database table bootstrap
│   └── schema.sql           # Production PostGIS schema
├── ml/
│   ├── features/            # Thermodynamic calculations (CAPE, CIN, Shear, PWAT, VIL)
│   ├── preprocessing/       # Storm Cell Identification & Tracking (SCIT) & advection
│   ├── models/              # Multi-hazard severe convective classifier
│   ├── inference/           # 0-60min temporal predictor & explainability engine
│   └── risk_engine.py       # Unified ConvectiveRiskEngine pipeline
├── frontend/
│   ├── src/
│   │   ├── components/      # Command-center UI components (Map, Threat Matrix, Timeline, etc.)
│   │   ├── context/         # React WeatherContext state manager
│   │   ├── services/        # Geolocation, Web Audio synthesizer, WebSocket, API
│   │   ├── types/           # TypeScript data contracts
│   │   ├── App.tsx          # Main command-center dashboard layout
│   │   └── main.tsx         # React root
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
└── README.md
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup
```bash
# In project root
cd backend
pip install -r requirements.txt

# Run automated tests to verify ML calculations & DB setup
python test_backend.py

# Launch FastAPI backend server (runs on http://127.0.0.1:8000)
python run.py
```

### 2. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm run dev
# Dashboard launches on http://localhost:5173
```

---

## 🛰️ Operational Workflow

1. **GPS Lock**: User opens `http://localhost:5173` and clicks **"Enable GPS & Generate Nowcast"**.
2. **Coordinate Ingestion**: High-precision latitude and longitude are transmitted to `POST /api/nowcast`.
3. **Convective Pipeline**:
   - Sounding parameters (CAPE, CIN, Lifted Index, Bulk Shear) are computed.
   - Radar reflectivity volume is scanned for convective storm clusters (>35 dBZ).
   - Storm cell centroids are projected forward to +15m, +30m, +45m, +60m.
4. **Interactive Dashboard**:
   - **Centerpiece Map**: Displays GPS position, moving storm polygons, velocity vectors, and reflectivity radar heatmap.
   - **Threat Matrix**: Thunderstorm, Hail, and Cloudburst risk levels with trends.
   - **Timeline Curves**: Multi-hazard probability curves and rain rates (mm/h).
   - **Explainability**: Physical meteorological indicators explaining the exact causes of elevated risk.
5. **Emergency Alerts**: Alerts trigger audio warning chimes and desktop notifications when thresholds are crossed.

---

## 🎮 Judge / Demo Mode Scenarios

During evaluation or demonstration, click **"Scenario Control"** in the top header to switch between deterministic scenarios anchored around your exact coordinates:

| Scenario | Atmospheric State | Max dBZ | Threat Profile |
| :--- | :--- | :--- | :--- |
| **1. Fair Weather / Low Convection** | High CIN, Low CAPE (~380 J/kg), LI +3.4 | <10 dBZ | **LOW** across all hazards |
| **2. Developing Convective Storm** | CAPE 1650 J/kg, LI -3.2, Shear 15 m/s | 48 dBZ | **MODERATE** Thunderstorm alert |
| **3. Severe Event (Hail & Cloudburst)** | CAPE 2850 J/kg, LI -7.1, Shear 24 m/s, PWAT 58mm | 64 dBZ | **SEVERE** Hail & Flash Deluge Emergency |

You can also switch data provider mode to **Live Atmospheric API** to stream live global sounding parameters.

---

## 📡 API Endpoints

- `GET /api/health` — Service health & diagnostic status
- `POST /api/nowcast` — Primary endpoint: generates localized nowcast for GPS coordinates
- `GET /api/alerts` — Active convective alerts (WATCH / WARNING / SEVERE)
- `GET /api/storm-cells` — Tracked radar cells, vectors, and projected polygons
- `GET /api/timeline` — 0–60 min stepped risk timeline
- `GET /api/scenarios` — Available demo scenarios
- `POST /api/scenarios/select` — Set active demo scenario
- `POST /api/provider/mode` — Switch between `demo` and `live`
- `WS /api/ws/nowcast` — Real-time WebSocket nowcast feed

---

## 🔮 Future ML Roadmap
- Integration of INSAT-3D/3DR Rapid Scan convective cloud-top brightness temperature (TBB) data.
- Dual-Polarization radar differential reflectivity ($Z_{DR}$) and specific differential phase ($K_{DP}$) hydrometeor classification.
- Spatio-temporal U-Net / Graph Neural Network (GNN) precipitation nowcasting models.

---

## 📜 License
Developed for Smart India Hackathon (SIH26084). Open-source under Apache 2.0.
