const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const transactionRoutes = require('./routes/transactions');
const documentRoutes = require('./routes/documents');
const exportRoutes = require('./routes/exports');
const billingRoutes = require('./routes/billing');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
});
app.use(limiter);

app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/companies', companyRoutes);
app.use('/companies', transactionRoutes);
app.use('/companies', documentRoutes);
app.use('/companies', exportRoutes);
app.use('/billing', billingRoutes);

app.use(errorHandler);

module.exports = app;
