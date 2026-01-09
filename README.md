# 🤖 AI-Powered Personal Finance Advisor

> An intelligent financial dashboard that leverages autonomous AI agents to provide real-time insights, detect anomalies, and optimize your financial health.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.3.1-61dafb)
![PostgreSQL](https://img.shields.io/badge/postgresql-15+-336791)

---

<p align="center">
  <img src="./screenshots/login.png" width="300"/>
  <img src="./screenshots/dashboard.png" width="300"/>
  <img src="./screenshots/panel.png" width="300"/>
</p>

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [License](#license)

---

## 🎯 Overview

The AI-Powered Personal Finance Advisor is a full-stack web application that combines modern financial management with cutting-edge AI technology. Built with an **event-driven architecture** and **prompt caching optimization**, the system provides actionable financial insights while minimizing API costs by 97%.

### What Makes This Project Unique?

- **Agentic AI System**: Four specialized AI agents (Transaction Monitor, Credit Manager, Loan Advisor, Financial Health) that autonomously analyze your finances
- **Event-Driven Architecture**: Agents trigger on user login and specific events (not wasteful cron jobs), reducing API calls from 1,200/day to 150/day
- **Data Aggregation Layer**: Pre-processes data before AI analysis, reducing token usage by 40x (20,000 → 500 tokens)
- **Prompt Caching**: Leverages Claude's prompt caching to save 90% on repeated system instructions
- **Real-Time Updates**: WebSocket integration for instant AI insights and notifications

---

## ✨ Key Features

### 🧠 AI-Powered Intelligence
- **Autonomous Analysis**: AI agents run automatically on login, analyzing spending patterns, credit health, and loan status
- **Anomaly Detection**: Flags unusual transactions 3x+ your average spend
- **Proactive Alerts**: Warns about low balances, high credit utilization (>30%), and upcoming payments
- **Smart Recommendations**: Suggests budget optimizations, early loan payoffs, and savings opportunities

### 💳 Financial Management
- **Credit Health Monitoring**: Real-time credit utilization tracking with color-coded status (good/warning/critical)
- **Transaction History**: Filterable transaction list with category breakdowns and anomaly highlighting
- **Loan Tracking**: Visual progress bars, payment schedules, and interest calculations
- **Multi-Product Dashboard**: Unified view of checking accounts, credit cards, and loans

### 🔒 Security & Performance
- **JWT Authentication**: Secure HTTP-only cookies with Argon2 password hashing
- **Event-Driven Agents**: Cost-optimized AI triggers (97% cost reduction vs. traditional approaches)
- **WebSocket Real-Time**: Instant notifications without polling
- **Responsive Design**: Brutalist-inspired UI with asymmetric layouts and bold typography

---

## 🏗 Architecture

### System Design

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────▶│   Backend    │────────▶│  Database   │
│   (React)   │◀────────│  (Node.js)   │◀────────│ (PostgreSQL)│
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ├─────────────────────┐
                               ▼                     ▼
                        ┌─────────────┐      ┌─────────────┐
                        │  Claude API │      │  WebSocket  │
                        │   (Agents)  │      │   Server    │
                        └─────────────┘      └─────────────┘
```

### AI Agent Workflow

```
User Login Event
     │
     ├──▶ Check: Already run today? ──▶ Skip
     │
     └──▶ Data Aggregator
             │
             ├──▶ Fetch transactions (last 30 days)
             ├──▶ Fetch credit card data
             └──▶ Fetch loan data
             │
             ▼
         Aggregate & Summarize (40x token reduction)
             │
             ▼
         Claude API (with prompt caching)
             │
             ├──▶ Financial Health Agent
             ├──▶ Transaction Monitor
             ├──▶ Credit Manager
             └──▶ Loan Advisor
             │
             ▼
         Generate Insights
             │
             ├──▶ Store in database
             └──▶ Broadcast via WebSocket
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | RESTful API server |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Type-safe database queries |
| **Anthropic Claude** | AI agent intelligence |
| **Argon2** | Password hashing |
| **JWT** | Stateless authentication |
| **WebSocket (ws)** | Real-time communication |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Axios** | HTTP client |
| **Recharts** | Data visualization |
| **Lucide React** | Icon library |

### DevOps & Tools
- **Git** for version control
- **ESLint** for code quality
- **Nodemon** for hot reloading
- **Prisma Migrate** for database migrations

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0
- **PostgreSQL** >= 15
- **npm** or **yarn**
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/personal-finance-agent.git
cd personal-finance-agent
```

#### 2. Database Setup

**Start PostgreSQL:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows - Start PostgreSQL service from Services app
```

**Create Database:**
```bash
psql -U postgres
CREATE DATABASE finance_advisor;
\q
```

**Run Schema:**
```bash
# From project root
psql -U postgres -d finance_advisor -f data-setup/schema.sql
```

**Import Sample Data:**
```bash
# Install Python dependencies
pip install pandas psycopg2-binary argon2-cffi

# Run import script
cd data-setup
python import_data.py
```

#### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Server runs at: `http://localhost:5001`

#### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs at: `http://localhost:5173`

### Demo Credentials

```
Email: joshua.hall@kag.com
Password: Password123!
```

---

## 📊 Performance Metrics

### Cost Optimization Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| API Calls/Day | 1,200 | 150 | 87.5% ↓ |
| Tokens/Call | 20,000 | 500 | 97.5% ↓ |

### Technical Achievements
- **Event-driven architecture** reduces unnecessary API calls
- **Data aggregation** provides 40x token reduction
- **Prompt caching** saves 90% on system instructions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using React, Node.js, and Claude API</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
