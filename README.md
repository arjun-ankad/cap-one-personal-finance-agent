# Personal Finance Agent

An AI-powered personal finance dashboard that provides insights, tracks transactions, monitors credit health, and manages loans.

## Features

- 🤖 **AI Analysis** - Get AI-powered financial insights and recommendations
- 💳 **Credit Health Monitoring** - Track credit utilization and payment status
- 📊 **Transaction History** - View and filter transactions by category
- 🏦 **Loan Tracking** - Monitor loan balances and payment schedules
- 🔒 **Secure Authentication** - JWT-based authentication with HTTP-only cookies

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- Claude AI (Anthropic) for financial analysis
- WebSocket for real-time updates

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion for animations
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Anthropic API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your database URL and API keys.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key for JWT tokens |
| ANTHROPIC_API_KEY | API key from Anthropic |
| PORT | Server port (default: 5001) |
| NODE_ENV | Environment (development/production) |

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/credit-cards/health` - Get credit health status
- `GET /api/loans/summary` - Get loan summary
- `POST /api/agent/run` - Run AI analysis

## License

MIT
