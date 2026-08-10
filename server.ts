import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './src/server/routes/auth';
import customerRoutes from './src/server/routes/customers';
import productRoutes from './src/server/routes/products';
import challanRoutes from './src/server/routes/challans';
import dashboardRoutes from './src/server/routes/dashboard';
import { errorHandler } from './src/server/middleware/errorHandler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/challans', challanRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Wholesale ERP + CRM Portal', timestamp: new Date().toISOString() });
  });

  // Global Centralized Error Handler
  app.use(errorHandler);

  // Vite middleware in dev mode / Static serving in production mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Wholesale ERP + CRM Portal] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
