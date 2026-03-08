# SoloCorpTax Frontend

Frontend application for SoloCorpTax - Built with Next.js, React, Redux Toolkit, and Radix UI.

## Features

- Next.js with static export for S3/CloudFront hosting
- Redux Toolkit for state management
- Radix UI components for accessible UI
- JWT authentication with refresh tokens
- Responsive design
- CSV upload and transaction management
- Company profile management
- Tax-Ready Pack generation and download

## Tech Stack

- Next.js 14
- React 18
- Redux Toolkit
- Radix UI
- Axios for API calls
- date-fns for date formatting

## Prerequisites

- Node.js 16+
- Backend API running

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Build

Build for production:

```bash
npm run build
```

Export static files:

```bash
npm run export
```

The static files will be in the `out/` directory, ready for S3 upload.

## Project Structure

```
src/
├── pages/           # Next.js pages
├── components/      # React components
├── store/           # Redux store and slices
├── services/        # API services
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── styles/          # Global styles
└── __tests__/       # Unit tests
```

## Key Pages

- `/` - Home/redirect page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard/[companyId]` - Company dashboard

## State Management

The app uses Redux Toolkit with the following slices:

- `authSlice` - Authentication state
- `companySlice` - Company management
- `transactionSlice` - Transaction management

## API Integration

All API calls go through `apiClient.js` which handles:

- Request/response interceptors
- JWT token attachment
- Automatic token refresh
- Error handling

## Deployment

1. Build the static export:
   ```bash
   npm run export
   ```

2. Upload `out/` directory to S3:
   ```bash
   aws s3 sync out/ s3://your-bucket-name --delete
   ```

3. Invalidate CloudFront cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
   ```

## License

See LICENSE file
