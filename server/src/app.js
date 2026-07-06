import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import apiRoutes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errors.js';
import { attachUser } from './middlewares/auth.js';

dotenv.config();

const app = express();

const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.set('trust proxy', 1); // para req.ip correcto detrás de proxies
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true, // necesario para que el navegador envíe la cookie httpOnly
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/', (_req, res) => {
  res.json({
    name: 'RiskFlow Web API',
    description: 'API REST para gestión de riesgos. ISO 31000 + PMBOK + Scrum + MAGERIT/NIST',
    docs: '/api/health',
  });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
