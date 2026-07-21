# ShieldNet: Enterprise-Grade Fraud Mitigation & Graph AI Platform

ShieldNet is a modern, event-driven multi-agent platform designed to tackle organized cybercrime, counterfeit currency circulation, and digital scams. 

## Key Technical Features (Resume Highlights)
- **Multi-Modal AI Agents**: Asynchronous workers processing image (Gemini 2.0 Flash Vision), audio, and text logs.
- **Graph AI & Analytics**: Entity resolution and community detection (NetworkX / Neo4j) to uncover structured scam syndicates.
- **Real-Time Streaming**: High-throughput FastAPI WebSocket connections pushing threat updates to the client.
- **Command & Control UI**: Modern Next.js interface featuring interactive D3-based graph visualizers, live geospatial alert maps, and a file sandbox.

## Repository Layout
```text
shieldnet/
├── backend/            # FastAPI, Agents, Graph Analytics, Database
│   ├── app/
│   │   ├── agents/     # Vision, NLP, and Graph Agents
│   │   ├── graph/      # Graph algorithms & community detection
│   │   ├── api/        # REST and WebSocket endpoints
│   │   └── main.py
│   ├── requirements.txt
│   └── README.md
└── frontend/           # Next.js, Tailwind CSS, Framer Motion, Vis.js/D3
    ├── src/
    │   ├── components/ # Graph Visualizer, Map, Sandbox
    │   └── app/
    ├── package.json
    └── README.md
```
