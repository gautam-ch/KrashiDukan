import { app } from '../src/app.js';
import { dbConnect } from '../src/utils/dbConnect.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await dbConnect();
    isConnected = true;
  }
  return app(req, res);
}
