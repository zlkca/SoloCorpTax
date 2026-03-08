# SoloCorpTax

AI-guided T2 DIY Coach for Canadian solo corporations with minimal bookkeeping and cloud document vault for audit readiness.

## Project Overview

SoloCorpTax helps solo incorporated owners (especially software/IT contractors and newly incorporated dormant companies) file simple T2 returns themselves with confidence. This product does **NOT** file T2 directly - it generates a **Tax-Ready Pack** (PDF + CSV + step-by-step instructions) to be used with CRA-certified T2 software.

## Features

### MVP Features
- ✅ JWT + Google OAuth authentication
- ✅ Company profile management with document upload
- ✅ CSV transaction import with auto-categorization
- ✅ Transaction review and bulk editing
- ✅ Document vault with S3 storage
- ✅ Tax-Ready Pack generation (PDF/CSV)
- ✅ Stripe payment integration
- ✅ Eligibility gates and warnings
- ✅ Audit logging
- ⚠️ GST/HST simplified summary (backend ready, frontend pending)
- ⚠️ Shareholder loan tracker (backend ready, frontend pending)
- ⚠️ PSB checklist (backend ready, frontend pending)

## Architecture

### Backend (`/backend`)
- **Stack**: Node.js, Express.js, PostgreSQL
- **Database**: Neon Postgres with db-migrate
- **Storage**: AWS S3
- **Payments**: Stripe
- **Authentication**: JWT with refresh tokens + Google OAuth

### Frontend (`/frontend`)
- **Stack**: Next.js, React, Redux Toolkit, Radix UI
- **Deployment**: Static export to S3 + CloudFront
- **State Management**: Redux Toolkit

## Project Structure

```
SoloCorpTax/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, JWT, S3, Stripe config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── __tests__/       # Unit tests
│   ├── migrations/          # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   ├── components/      # React components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API clients
│   │   ├── utils/           # Utilities
│   │   └── __tests__/       # Unit tests
│   └── package.json
└── requirements.md          # Detailed requirements
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL (Neon or local)
- AWS S3 bucket
- Stripe account
- Google OAuth credentials

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Run migrations:
   ```bash
   npm run migrate:up
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with API URL
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:3000`

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:watch
```

## Linting

Both frontend and backend have linting configured with ESLint.

### Backend
```bash
cd backend
npm run lint        # Check for errors
npm run lint:fix    # Fix errors
```

### Frontend
```bash
cd frontend
npm run lint        # Check for errors
npm run lint:fix    # Fix errors
```

## API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/google` - Google OAuth
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

### Companies
- `POST /companies` - Create company
- `GET /companies` - List companies
- `GET /companies/:id` - Get company
- `PUT /companies/:id` - Update company

### Transactions
- `POST /companies/:id/transactions/upload` - Upload CSV
- `GET /companies/:id/transactions` - List transactions
- `PUT /companies/:id/transactions/:tid` - Update transaction
- `POST /companies/:id/transactions/bulk-update` - Bulk update

### Exports
- `POST /companies/:id/exports` - Generate Tax-Ready Pack
- `GET /companies/:id/exports` - List exports

### Billing
- `POST /billing/create-checkout-session` - Create Stripe checkout
- `POST /billing/webhook` - Stripe webhook
- `GET /billing/status` - Get subscription status

## Deployment

### Backend (EC2)
1. Deploy backend to EC2 as systemd service
2. Use Nginx as reverse proxy
3. Configure environment variables in `/etc/solocorptax.env`

### Frontend (S3 + CloudFront)
1. Build static export:
   ```bash
   cd frontend
   npm run export
   ```

2. Upload to S3:
   ```bash
   aws s3 sync out/ s3://your-bucket --delete
   ```

3. Invalidate CloudFront cache

## Database Migrations

Using db-migrate with SQL files:

```bash
cd backend
npm run migrate:up      # Run migrations
npm run migrate:down    # Rollback migrations
```

Migrations are located in `backend/migrations/`

## Security Features

- Password hashing with bcrypt
- JWT with refresh tokens
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- S3 server-side encryption

## Support

For issues and questions, please refer to the detailed requirements in `requirements.md`

## License

See LICENSE file
