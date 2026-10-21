import express from 'express';
import cors from 'cors';
import { summarizeText } from './summarize.js';

const MAX_TEXT_LENGTH = 20000;

function getCorsOrigin() {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw) return true;
  const origins = raw.split(',').map((item) => item.trim()).filter(Boolean);
  return origins.length > 1 ? origins : origins[0];
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: getCorsOrigin(),
    }),
  );
  app.use(express.json({ limit: '1mb' }));

  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return res.status(400).json({ error: '请求格式不正确，请提交 JSON 文本。' });
    }
    return next(error);
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.post('/api/summarize', async (req, res) => {
    console.log('收到请求！', new Date().toLocaleTimeString());
    try {
      const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';

      if (!text) {
        return res.status(400).json({ error: '文本不能为空，请粘贴需要总结的内容。' });
      }

      if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({
          error: `文本过长，请控制在 ${MAX_TEXT_LENGTH} 字以内。`,
        });
      }

      const summary = await summarizeText(text);
      return res.json({ summary });
    } catch (error) {
      console.error('后端发生错误：', error);
      
      const status = error.status || 500;
      return res.status(status).json({
        error: error.message || '服务器内部错误，请稍后重试。',
      });
    }
  });

  return app;
}
