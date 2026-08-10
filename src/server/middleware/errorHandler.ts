import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  const errorType = err.statusCode === 409 ? 'StockConflict' : err.name || 'ServerError';

  res.status(statusCode).json({
    error: errorType,
    message,
    ...(err.shortageDetails && { shortageDetails: err.shortageDetails }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
