# Quick Reference - Linting & Testing

## Backend Commands

### Install Dependencies
```bash
cd backend
npm install
```

### Linting
```bash
# Check for lint errors
npm run lint

# Automatically fix lint errors
npm run lint:fix
```

**ESLint Configuration:**
- Airbnb base style guide
- Security plugin enabled
- Node.js environment
- Custom rules for project needs

### Testing
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Framework:**
- Jest for unit testing
- Supertest for API testing
- Coverage reports in `coverage/` directory

**Test Files:**
- `src/__tests__/health.test.js` - Health endpoint
- `src/__tests__/password.test.js` - Password utilities
- `src/__tests__/categorization.test.js` - Transaction categorization
- `src/__tests__/transactionUtils.test.js` - Transaction utilities
- `src/__tests__/jwt.test.js` - JWT token operations

### Database Migrations
```bash
# Run migrations
npm run migrate:up

# Rollback migrations
npm run migrate:down
```

---

## Frontend Commands

### Install Dependencies
```bash
cd frontend
npm install
```

### Linting
```bash
# Check for lint errors
npm run lint

# Automatically fix lint errors
npm run lint:fix
```

**ESLint Configuration:**
- Airbnb style guide
- Next.js core web vitals rules
- React hooks rules
- JSX a11y (accessibility) rules

### Testing
```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

**Test Framework:**
- Jest with jsdom environment
- React Testing Library
- Testing Library Jest DOM matchers

**Test Files:**
- `src/__tests__/index.test.js` - Home page
- `src/__tests__/authSlice.test.js` - Auth state
- `src/__tests__/companySlice.test.js` - Company state
- `src/__tests__/transactionSlice.test.js` - Transaction state

### Build & Export
```bash
# Development server
npm run dev

# Production build
npm run build

# Static export for S3
npm run export
```

---

## Running Both Together

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Lint Everything
```bash
# Backend linting
cd backend && npm run lint:fix

# Frontend linting
cd frontend && npm run lint:fix
```

### Test Everything
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

---

## Expected Results

### Linting ✅
When you run `npm run lint`, you should see:
- **No errors** if code follows style guide
- **Warnings** for non-critical style issues
- **Errors** for critical security or syntax issues

When you run `npm run lint:fix`:
- Automatically fixes formatting issues
- Reports remaining manual fixes needed

### Testing ✅
When you run `npm test`, you should see:
- All test suites passing
- Coverage report showing:
  - % of statements covered
  - % of branches covered
  - % of functions covered
  - % of lines covered
- Coverage summary at the end

---

## Troubleshooting

### Lint Errors
If you get lint errors:
1. Run `npm run lint:fix` to auto-fix
2. Check the error message for manual fixes needed
3. Review ESLint rules in `.eslintrc.js`

### Test Failures
If tests fail:
1. Check error messages for details
2. Ensure dependencies are installed
3. Verify environment variables (for integration tests)
4. Run tests individually: `npm test -- <test-file-name>`

### Migration Errors
If migrations fail:
1. Check database connection in `.env`
2. Verify PostgreSQL is running
3. Check migration SQL syntax
4. Review `database.json` configuration

---

## CI/CD Integration

### Jenkins Pipeline Example
```groovy
stage('Lint') {
  steps {
    dir('backend') {
      sh 'npm install'
      sh 'npm run lint'
    }
    dir('frontend') {
      sh 'npm install'
      sh 'npm run lint'
    }
  }
}

stage('Test') {
  steps {
    dir('backend') {
      sh 'npm test'
    }
    dir('frontend') {
      sh 'npm test'
    }
  }
}
```

---

## Coverage Goals

### Backend
- **Minimum**: 70% overall coverage
- **Target**: 80%+ for critical paths (auth, payments)
- **Exclude**: Server startup, config files

### Frontend
- **Minimum**: 60% overall coverage
- **Target**: 70%+ for state management
- **Exclude**: Next.js pages, global styles

---

## Additional Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Airbnb Style Guide](https://github.com/airbnb/javascript)
