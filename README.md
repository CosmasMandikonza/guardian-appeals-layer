# Guardian Appeals Layer (GAL)

<div align="center">

![GAL Logo](./docs/assets/gal-logo.svg)

**A Verifiable Appeals System for AI Safety Decisions**

*Built on OriginTrail DKG × Polkadot × Umanitek Guardian*

[![DKG](https://img.shields.io/badge/OriginTrail-DKG%20V8-6366F1?style=for-the-badge)](https://origintrail.io)
[![Polkadot](https://img.shields.io/badge/Polkadot-NeuroWeb-E6007A?style=for-the-badge)](https://polkadot.network)
[![License](https://img.shields.io/badge/License-MIT-00D4AA?style=for-the-badge)](./LICENSE)

[Demo Video](#demo) • [Architecture](#architecture) • [Quick Start](#quick-start) • [Documentation](#documentation)

</div>

---

## 🎯 Problem Statement

AI content moderation systems (deepfake detectors, harmful content filters, Umanitek Guardian) frequently make mistakes:

- **5-10% error rate** in AI moderation systems (Center for Democracy & Technology)
- **98% success rate on appeals** when they're actually available (Meta Oversight Board)
- **No transparent, verifiable appeals process** exists for most platforms

When AI wrongly flags your content as a deepfake or harmful material:
- ❌ Your account gets suspended or banned
- ❌ No explanation of what triggered the flag
- ❌ Appeals are opaque, slow, or non-existent
- ❌ Decisions aren't recorded transparently

## ✅ Our Solution: Guardian Appeals Layer (GAL)

GAL is a **verifiable, DKG-backed appeals system** that:

1. **Records AI moderation decisions** as immutable Knowledge Assets
2. **Enables transparent appeals** with creator statements and evidence
3. **Uses AI agents to gather evidence** from multiple sources
4. **Computes reputation-weighted decisions** 
5. **Implements x402 micropayments** for priority processing
6. **Stores everything on the OriginTrail DKG** for verifiable provenance

### Key Innovation

> **"What happens when AI moderation is wrong?"**
>
> While others ask "Is this fact true?", GAL asks the overlooked question:
> **"Was this moderation decision fair?"**

---

## 🏗️ Architecture

### Three-Layer Integration (Agent–Knowledge–Trust)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           GUARDIAN APPEALS LAYER                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         🤖 AGENT LAYER                                   │ │
│  │                                                                          │ │
│  │   ┌─────────────┐    ┌─────────────┐    ┌──────────────────────────┐   │ │
│  │   │   Guardian  │    │   Appeals   │    │  Evidence & Resolution   │   │ │
│  │   │   Ingest    │───▶│   Intake    │───▶│        Agent            │   │ │
│  │   │   Agent     │    │   Agent     │    │                          │   │ │
│  │   └─────────────┘    └─────────────┘    └──────────────────────────┘   │ │
│  │         │                  │                        │                   │ │
│  │         │    MCP Protocol  │                        │                   │ │
│  │         ▼                  ▼                        ▼                   │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                       🧠 KNOWLEDGE LAYER                                 │ │
│  │                                                                          │ │
│  │   ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │   │              OriginTrail DKG (Decentralized Knowledge Graph)      │  │ │
│  │   │                                                                   │  │ │
│  │   │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐             │  │ │
│  │   │  │ContentAsset │  │ CaseAsset   │  │ EvidenceAsset │             │  │ │
│  │   │  │  (Flagged   │──│  (Appeal    │──│  (Supporting  │             │  │ │
│  │   │  │   Content)  │  │   Record)   │  │   Evidence)   │             │  │ │
│  │   │  └─────────────┘  └─────────────┘  └───────────────┘             │  │ │
│  │   │         │                │                  │                     │  │ │
│  │   │         └────────────────┼──────────────────┘                     │  │ │
│  │   │                          ▼                                        │  │ │
│  │   │                  ┌───────────────┐                                │  │ │
│  │   │                  │ReputationAsset│                                │  │ │
│  │   │                  │ (Trust Score) │                                │  │ │
│  │   │                  └───────────────┘                                │  │ │
│  │   │                                                                   │  │ │
│  │   │              JSON-LD / RDF • Linked Knowledge Assets              │  │ │
│  │   └──────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                          │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                          │
│                                    ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         ⚖️ TRUST LAYER                                   │ │
│  │                                                                          │ │
│  │   ┌─────────────────────┐        ┌────────────────────────────────┐    │ │
│  │   │  Reputation System  │        │      x402 Micropayments        │    │ │
│  │   │                     │        │                                │    │ │
│  │   │  • Review scores    │        │  • HTTP 402 Payment Required   │    │ │
│  │   │  • Weight evidence  │        │  • Fast-track review queue     │    │ │
│  │   │  • Sybil resistance │        │  • USDC on Base (testnet)      │    │ │
│  │   └─────────────────────┘        └────────────────────────────────┘    │ │
│  │                                                                          │ │
│  │                    NeuroWeb Parachain × Polkadot Security               │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
                                    Creator's Content
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         1. GUARDIAN FLAGS CONTENT                            │
│                                                                              │
│    ┌──────────────────┐         ┌──────────────────┐                        │
│    │ Umanitek Guardian │   ───▶  │  ContentAsset    │  ───▶ Published to DKG │
│    │ (Deepfake/Harm)   │         │  created         │                        │
│    └──────────────────┘         └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         2. CREATOR APPEALS                                   │
│                                                                              │
│    ┌──────────────────┐         ┌──────────────────┐                        │
│    │  Appeal Form UI   │   ───▶  │   CaseAsset      │  ───▶ Published to DKG │
│    │  + Statement      │         │   status: open   │                        │
│    └──────────────────┘         └──────────────────┘                        │
│                                          │                                   │
│                              (Optional) x402 Payment ──▶ priority: true      │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    3. EVIDENCE & RESOLUTION AGENT                            │
│                                                                              │
│    ┌──────────────────────────────────────────────────────────────────┐     │
│    │                                                                   │     │
│    │  1. Query DKG for:                                               │     │
│    │     • ContentAsset (original flag data)                          │     │
│    │     • Creator's ReputationAsset                                  │     │
│    │     • Past cases involving same content/creator                  │     │
│    │                                                                   │     │
│    │  2. Gather external evidence:                                    │     │
│    │     • Original source verification                               │     │
│    │     • Social graph context                                       │     │
│    │     • Guardian log analysis                                      │     │
│    │                                                                   │     │
│    │  3. Create EvidenceAsset with:                                   │     │
│    │     • Summary of findings                                        │     │
│    │     • Support score (-1 to +1)                                   │     │
│    │     • Source references                                          │     │
│    │                                                                   │     │
│    │  4. Compute resolution:                                          │     │
│    │     • Weighted score = f(evidence, reputation, guardian_conf)    │     │
│    │     • decision = score > threshold ? "overturned" : "upheld"     │     │
│    │                                                                   │     │
│    └──────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         4. RESOLUTION RECORDED                               │
│                                                                              │
│    ┌────────────────────────────────────────────────────────────────┐       │
│    │                                                                 │       │
│    │   CaseAsset (Updated)                                          │       │
│    │   {                                                            │       │
│    │     "appealStatus": "resolved_overturned",                     │       │
│    │     "resolution": {                                            │       │
│    │       "status": "resolved",                                    │       │
│    │       "decidedBy": "did:dkg:agent:evidence-resolver",          │       │
│    │       "confidenceScore": 0.87,                                 │       │
│    │       "decisionTime": "2025-11-28T14:30:00Z"                   │       │
│    │     },                                                         │       │
│    │     "evidence": ["did:dkg:evidence:abc", ...]                  │       │
│    │   }                                                            │       │
│    │                                                                 │       │
│    └────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│    ───▶ Creator's ReputationAsset updated                                   │
│    ───▶ Decision permanently recorded on DKG                                │
│    ───▶ Verifiable provenance for all future queries                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Stack

### Backend
- **Runtime**: Node.js v20 + TypeScript
- **Framework**: Fastify (high-performance HTTP server)
- **DKG Integration**: OriginTrail DKG SDK / Edge Node API
- **Database**: SQLite (local cache) + DKG (source of truth)
- **Job Queue**: In-memory queue with persistence

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom glassmorphism design system
- **State Management**: Zustand
- **Charts**: Recharts (for metrics visualization)

### Blockchain / Trust Layer
- **DKG Network**: OriginTrail V8 (Base testnet)
- **Parachain**: NeuroWeb (Polkadot ecosystem)
- **Payments**: x402 protocol (Coinbase specification)
- **Token**: USDC on Base Sepolia testnet

---

## 🚀 Quick Start

### Prerequisites

- Node.js v20+
- npm v10+
- Git

### Installation

```bash
# Clone or extract the repository
cd guardian-appeals-layer

# Install all dependencies (from root)
npm install

# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (in another terminal)
cd frontend
npm run dev
```

**Important for Windows users**: The frontend needs the backend running on port 3001. Make sure both terminals are running concurrently.

### Alternative: Using npm concurrently (from root)

```bash
npm install
npm run dev  # Starts both backend and frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs

### Environment Variables

Create `.env` files in both `backend` and `frontend` directories:

```bash
# backend/.env
NODE_ENV=development
PORT=3001
DKG_ENDPOINT=http://localhost:8900
DKG_BLOCKCHAIN_ID=base:84532
DATABASE_URL=./data/gal.db

# frontend/.env
VITE_API_URL=http://localhost:3001
```

---

## 🤖 MCP Integration (Model Context Protocol)

GAL implements MCP tools that allow AI agents to interact with the appeals system:

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `query_flagged_content` | Search DKG for content flagged by Guardian AI |
| `verify_content_authenticity` | Check if content exists in DKG with provenance chain |
| `get_appeal_status` | Get current status of an appeal case |
| `submit_appeal` | File a new appeal for flagged content |
| `gather_evidence` | Trigger evidence collection for a case |
| `get_trust_metrics` | Retrieve system accuracy and improvement metrics |
| `sparql_query` | Execute SPARQL queries against DKG |

### Example Usage

```bash
# Get MCP server info
curl http://localhost:3001/api/mcp/info

# List available tools
curl http://localhost:3001/api/mcp/tools

# Execute a tool
curl -X POST http://localhost:3001/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"tool": "query_flagged_content", "params": {"classification": "deepfake_suspected"}}'
```

### Integration with LLMs

The MCP endpoints follow the Anthropic MCP specification, enabling:
- LangChain/LlamaIndex integration as a tool
- Claude function calling via MCP
- GPT function calling adapter
- Any MCP-compatible AI framework

---

## 📊 Judging Criteria Alignment

### 💡 Excellence & Innovation (20%)

| Criteria | Our Implementation |
|----------|-------------------|
| Multi-layer architecture | ✅ Clear Agent–Knowledge–Trust separation with DKG at core |
| Original agent behavior | ✅ Evidence-gathering + resolution agents that query DKG and make verifiable decisions |
| Polkadot interoperability | ✅ NeuroWeb parachain integration via DKG, cross-chain asset references |
| Depth of analysis | ✅ Weighted scoring algorithm combining evidence, reputation, Guardian confidence |
| Conceptual clarity | ✅ Comprehensive architecture diagrams + reasoning workflows |

### ⚙️ Technical Implementation (40%)

| Criteria | Our Implementation |
|----------|-------------------|
| Functional implementation | ✅ Full working prototype with UI, API, agents |
| DKG Edge Node | ✅ Direct integration with Edge Node API for Knowledge Asset publishing |
| Knowledge Assets | ✅ ContentAsset, CaseAsset, EvidenceAsset, ReputationAsset (valid JSON-LD) |
| Code quality | ✅ TypeScript, comprehensive documentation, clean architecture |

### 💥 Impact & Relevance (20%)

| Criteria | Our Implementation |
|----------|-------------------|
| Theme contribution | ✅ Directly addresses "Scaling Trust in AI" via transparent appeals |
| Real-world value | ✅ Solves documented problem (5-10% AI moderation error rate) |
| Measurable outcomes | ✅ Built-in metrics: baseline accuracy vs. post-GAL accuracy |

### ⚖️ Ethics & Openness (10%)

| Criteria | Our Implementation |
|----------|-------------------|
| Transparency | ✅ All decisions recorded on public DKG with full provenance |
| Open standards | ✅ JSON-LD/RDF, x402 protocol, open-source MIT license |
| Human-centric | ✅ Gives creators transparent recourse against AI errors |

### 🎬 Communication (10%)

| Criteria | Our Implementation |
|----------|-------------------|
| Three-layer clarity | ✅ Explicit architecture diagrams showing all layers |
| Demo thoroughness | ✅ Live walkthrough of full appeal flow |
| Visual clarity | ✅ Professional UI with clear status indicators |

---

## 📁 Project Structure

```
guardian-appeals-layer/
├── backend/
│   ├── src/
│   │   ├── agents/           # AI agents (ingest, appeals, evidence)
│   │   ├── dkg/              # DKG client and Knowledge Asset schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Data models
│   │   └── x402/             # x402 payment implementation
│   ├── data/                 # Sample datasets
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Main application pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # State management
│   │   └── styles/           # Global styles
│   └── public/
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   └── assets/
└── README.md
```

---

## 📈 Metrics & Evaluation

GAL includes a built-in evaluation system to demonstrate measurable outcomes:

```bash
# Run evaluation script
npm run evaluate

# Output:
# ┌────────────────────────────────────────────────────────┐
# │           GAL Evaluation Results                       │
# ├────────────────────────────────────────────────────────┤
# │ Dataset size:              50 items                    │
# │ Guardian false positives:  8 (16%)                     │
# │ GAL appeals submitted:     8                           │
# │ GAL overturned (correct):  7                           │
# │ GAL upheld (correct):      1                           │
# │ ─────────────────────────────────────────────────────  │
# │ Baseline accuracy:         84%                         │
# │ Post-GAL accuracy:         98%                         │
# │ Improvement:               +14%                        │
# └────────────────────────────────────────────────────────┘
```

---

## 🔗 Links

- **Demo Video**: [YouTube link]
- **Live Demo**: [Deployed URL]
- **GitHub**: [Repository URL]
- **DKG Explorer**: [Knowledge Assets on DKG]

---

## 👥 Team

Built for the **DKG Global Hackathon 2025** - "Scaling Trust in the Age of AI"

---

## 📜 License

MIT License - see [LICENSE](./LICENSE) for details.

---

<div align="center">

**Guardian Appeals Layer** - *Making AI moderation accountable, one appeal at a time.*

Built with ❤️ for the OriginTrail × Polkadot × Umanitek ecosystem

</div>
