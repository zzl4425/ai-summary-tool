import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const port = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(3001, '0.0.0.0', () => {
  console.log(`Backend running at http://127.0.0.1:3001`);
});
