import { createApp } from '../src/app.js';
import { connectDb } from '../src/config/db.js';

const app = createApp();
let databaseConnection;

export default async function handler(req, res) {
  databaseConnection ||= connectDb();
  await databaseConnection;
  return app(req, res);
}
