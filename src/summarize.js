const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';

function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  return { apiKey, baseUrl, model };
}

export async function summarizeText(text) {
  const { apiKey, baseUrl, model } = getConfig();

  if (!apiKey) {
    const error = new Error('未配置大模型 API 密钥，请在 .env 中设置 OPENAI_API_KEY。');
    error.status = 500;
    throw error;
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              '你是一名专业的文本总结助手。请用简洁、准确的中文输出摘要，保留关键信息、结论和要点，不要编造原文没有的内容。',
          },
          {
            role: 'user',
            content: `请为下面的文本生成精简摘要：\n\n${text}`,
          },
        ],
      }),
    });
  } catch (err) {
    console.error('[底层网络错误]:', err.message);
    if(err.cause) console.error('[错误原因]:', err.cause);

    const error = new Error('无法连接大模型服务:${err.message}');
    error.status = 502;
    throw error;
  }

  if (!response.ok) {
    let detail = '';
    try {
      const payload = await response.json();
      detail = payload?.error?.message || '';
    } catch {
      detail = '';
    }
    console.error('[API返回异常]status=',response.status,'detail=',detail);
    const error = new Error(detail || '大模型 API 调用失败，请稍后重试。');
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const summary = data?.choices?.[0]?.message?.content?.trim();

  if (!summary) {
    const error = new Error('大模型未返回有效摘要，请稍后重试。');
    error.status = 502;
    throw error;
  }

  return summary;
}
