# SoloCorpTax Backend

Backend API for SoloCorpTax - AI-guided T2 DIY Coach for Canadian solo corporations.

## Features

- JWT-based authentication with refresh tokens
- Google OAuth integration
- Multi-tenant company management
- CSV transaction import and auto-categorization
- Document vault with S3 storage
- Tax-Ready Pack generation (PDF/CSV)
- Stripe payment integration
- Comprehensive audit logging

## Tech Stack

- Node.js with Express.js
- PostgreSQL with db-migrate
- AWS S3 for file storage
- Stripe for payments
- Passport.js for authentication
- PDFKit for PDF generation

## Prerequisites

- Node.js 16+
- PostgreSQL database (Neon or local)
- AWS S3 bucket
- Stripe account
- Google OAuth credentials

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

## Database Setup

Run migrations:

```bash
npm run migrate:up
```

Rollback migrations:

```bash
npm run migrate:down
```

## Development

Start the development server:

```bash
npm run dev
```

## Testing

Run unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Linting

Check for lint errors:

```bash
npm run lint
```

Fix lint errors:

```bash
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/me` - Get current user

### Companies
- `POST /companies` - Create company
- `GET /companies` - Get user's companies
- `GET /companies/:companyId` - Get company details
- `PUT /companies/:companyId` - Update company
- `DELETE /companies/:companyId` - Delete company

### Transactions
- `POST /companies/:companyId/transactions/upload` - Upload CSV
- `GET /companies/:companyId/transactions` - Get transactions
- `GET /companies/:companyId/transactions/summary` - Get P&L summary
- `PUT /companies/:companyId/transactions/:transactionId` - Update transaction
- `POST /companies/:companyId/transactions/bulk-update` - Bulk update
- `DELETE /companies/:companyId/transactions/:transactionId` - Delete transaction

### Documents
- `POST /companies/:companyId/documents` - Upload document
- `GET /companies/:companyId/documents` - Get documents
- `GET /companies/:companyId/documents/:documentId/url` - Get signed URL
- `DELETE /companies/:companyId/documents/:documentId` - Delete document

### Exports
- `POST /companies/:companyId/exports` - Generate Tax-Ready Pack
- `GET /companies/:companyId/exports` - Get exports
- `GET /companies/:companyId/exports/:exportId/url` - Get export URL

### Billing
- `POST /billing/create-checkout-session` - Create Stripe checkout
- `POST /billing/webhook` - Stripe webhook handler
- `GET /billing/status` - Get subscription status

## Security Features

- Helmet.js for security headers
- Rate limiting
- Input validation with express-validator
- SQL injection prevention with parameterized queries
- CORS configuration
- JWT token expiration
- Password hashing with bcrypt

## License

See LICENSE file
