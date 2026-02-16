import { Request, Response, NextFunction } from 'express';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const expectedKey = process.env.API_KEY;

  // If no API_KEY configured, skip auth (dev mode)
  if (!expectedKey) {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== expectedKey) {
    res.status(401).json({ message: 'Unauthorized: invalid or missing API key' });
    return;
  }
  next();
};
