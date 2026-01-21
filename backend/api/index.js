import dotenv from 'dotenv';
import { app } from '../src/app.js';
import { dbConnect } from '../src/utils/dbConnect.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: new URL('../src/.env', import.meta.url) });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'OPTIONS') {
      await dbConnect();
    }
    return app(req, res);
  } catch (error) {
    console.error('Serverless handler error', error);
    return res.status(500).json({
      message: 'Backend initialization failed.',
      details: error?.message || 'Unknown error',
    });
  }
}
