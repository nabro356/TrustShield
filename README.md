# 🛡️ ShieldNet

> **Enterprise-Grade Fraud Mitigation & Digital Public Safety AI Platform**

ShieldNet is a modern, event-driven multi-agent platform designed to proactively tackle organized cybercrime, counterfeit currency circulation, and digital scams in real-time across multiple platforms.

![ShieldNet Overview](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Android-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Key Technical Features

- 🤖 **Multi-Modal AI Agents**: Utilizes asynchronous workers to process diverse data streams, including image analysis (Gemini 2.0 Flash Vision), audio transcriptions, and text logs to detect fraudulent patterns.
- 🕸️ **Graph AI & Analytics**: Employs entity resolution and community detection algorithms (using NetworkX/Neo4j) to uncover structured scam syndicates and trace malicious actor networks.
- ⚡ **Real-Time Streaming**: High-throughput FastAPI WebSocket connections push live threat updates, alerts, and telemetry directly to the command center.
- 📱 **On-Device Mobile Protection**: A native Android client leveraging Accessibility Services to screen live calls, SMS messages, and digital interactions in real-time to alert users of potential scams.
- 💻 **Command & Control UI**: A modern Next.js interface featuring interactive D3-based graph visualizers, live geospatial threat maps, and a file sandbox for deep forensic analysis.

## 🏗️ Repository Architecture

```text
shieldnet/
├── android/            # Native Android Client
│   ├── app/            # Kotlin-based app with AccessibilityService
│   │   ├── api/        # Retrofit API clients connecting to backend
│   │   ├── service/    # Call screening & transcription services
│   │   └── ui/         # Scam alert overlays & user interfaces
│   └── build.gradle.kts
│
├── backend/            # FastAPI Command Center & AI Engine
│   ├── app/
│   │   ├── agents/     # Vision, NLP, and Graph Agents
│   │   ├── graph/      # Graph algorithms & community detection
│   │   ├── api/        # REST and WebSocket endpoints
│   │   └── main.py
│   └── requirements.txt
│
└── frontend/           # Next.js Command & Control Dashboard
    ├── src/
    │   ├── components/ # Graph Visualizer, Map, Sandbox, Phone Demo
    │   └── app/        # Dashboard & Demo views
    └── package.json
```

## 🚀 Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

### 3. Android App
Open the `android/` directory in Android Studio. Sync the Gradle project and run it on an emulator or physical device. 

## 🛠️ Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, D3.js / Vis.js
- **Backend**: Python, FastAPI, NetworkX, Uvicorn
- **Mobile**: Android (Kotlin), Android Accessibility Services, Retrofit
- **AI Models**: Gemini 2.0 Flash Vision, Custom NLP pipelines

---
*Built to ensure digital safety and build a trusted digital ecosystem.*
