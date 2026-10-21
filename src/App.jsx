import { useState, useEffect,useMemo} from 'react';
import './App.css';

const MAX_TEXT_LENGTH = 20000;
const API_BASE = 'http://127.0.0.1:3001';

function App() {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState([]);
  const [activeHighlightId, setActiveHighlightId] = useState(null);
  const [note, setNote] = useState('');
// 历史记录状态
  const [historyList, setHistoryList] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
// 主题切换：页面加载自动读取本地保存的明暗设置
  const [isDark, setIsDark] = useState(false);

// 监听isDark变化，自动保存主题到本地存储
useEffect(()=>{
  if(isDark){
    localStorage.setItem("theme","dark");
    document.documentElement.classList.add("dark");
  }else{
    localStorage.setItem("theme","light");
    document.documentElement.classList.remove("dark");
  }
},[isDark])

// 切换明暗
const toggleTheme = () => {
  const newDark = !isDark;
  setIsDark(newDark);
  if(newDark){
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme","dark");
  }else{
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme","light");
  }
}

  const charCount = text.trim().length;
  const canSubmit = useMemo(() => !loading, [loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();

    if (!trimmed) {
      setError('文本不能为空，请先粘贴需要总结的内容。');
      setSummary('');
      return;
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
      setError(`文本过长，请控制在 ${MAX_TEXT_LENGTH} 字以内。`);
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch(`${API_BASE}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'API 请求失败，请稍后重试。');
      }

      if (!payload.summary) {
        throw new Error('未收到有效摘要，请稍后重试。');
      }

      setSummary(payload.summary);

      setHighlights([]);
      setNote('');
      const newRecord = {
        id: Date.now(),
        sourceText: trimmed,
        summary: payload.summary,
        createTime: new Date().toLocaleString(),
        highlights: highlights, //新增这一行！把高亮标记存入历史记录
        note: note, //新增这一行！把笔记存入历史记录
      };
      const newHistory = [newRecord, ...historyList.slice(0,9)];
      setHistoryList(newHistory);
// 新生成摘要，清空之前高亮标记


// 保存本次结果到历史记录
const newItem = {
  id: Date.now(),
  sourceText: trimmed,
  summary: payload.summary,
  createTime: new Date().toLocaleString()
};
setHistoryList(prev => [newItem, ...prev]);
setActiveHistoryId(newItem.id);

    } catch (requestError) {
      if (requestError instanceof TypeError) {
        setError('无法连接后端服务，请确认后端已启动。');
      } else {
        setError(requestError.message || '生成摘要失败，请稍后重试。');
      }
    } finally {
      setLoading(false);
    }
  }

// 读取本地历史记录
useEffect(() => {
  const raw = localStorage.getItem('summary_history');
  if (raw) {
    try {
      setHistoryList(JSON.parse(raw));
    } catch (e) {
      setHistoryList([]);
    }
  }
}, []);

// 历史记录变更自动保存
useEffect(() => {
  localStorage.setItem('summary_history', JSON.stringify(historyList));
}, [historyList]);

  return (
    <div className="page">
      <header className="hero">
  <div className="hero-top">
    <p className="eyebrow">AI Text Summarizer</p >
    <button 
      onClick={toggleTheme} 
      className="theme-btn"
      title={isDark ? "切换到亮色" : "切换到护眼深蓝暗色"}
    >
      {isDark ? "☀️ 亮色" : "🌙 深蓝护眼"}
    </button>
  </div>
  <h1>把长文本变成清晰摘要</h1>
  <p className="subtitle">粘贴文章、会议记录或笔记，一键生成精简总结。适配手机与电脑。</p >
</header>

<div style={{marginBottom:"16px"}}>
  <h3>📜 历史记录（点击恢复）</h3>
  <div style={{display:"flex",gap:"8px",flexWrap:"wrap",maxHeight:"120px",overflowY:"auto",padding:"8px",border:"1px solid var(--border)",borderRadius:"12px"}}>
    {historyList.length === 0 ? (
      <span style={{color:"var(--muted)"}}>暂无历史记录，生成摘要后会保存在这里</span>
    ) : (
      historyList.map(item => (
        <button
          key={item.id}
          onClick={()=>{
            setText(item.sourceText);
            setSummary(item.summary);
            setActiveHistoryId(item.id);
            setHighlights(item.highlights || []);
            setNote(item.note || '');// ✅回填备注
          }}
          style={{
            padding:"4px 10px",
            fontSize:"13px",
            borderRadius:"6px",
            border:activeHistoryId===item.id?"1px solid var(--accent)":"1px solid var(--border)",
            background:activeHistoryId===item.id?"var(--accent-bg)":"var(--panel-2)",
            color:"var(--text-body)"
          }}
        >
          {item.createTime}
        </button>
      ))
    )}
  </div>
  {historyList.length>0 && (
    <button
      onClick={()=>{
        setHistoryList([]);
        localStorage.removeItem('summary_history');
        setActiveHistoryId(null);
      }}
      style={{marginTop:"6px",fontSize:"12px",padding:"3px 8px"}}
    >
      清空全部历史
    </button>
  )}
</div>

      <main className="card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="source-text">原文</label>
          <textarea
            id="source-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="在这里粘贴需要总结的长文本…"
            rows={12}
            disabled={loading}
          />
          <div className="meta">
            <span>{charCount} 字</span>
            <span>建议不超过 {MAX_TEXT_LENGTH} 字</span>
          </div>

          {error ? <div className="alert">{error}</div> : null}

          <button type="submit" disabled={!canSubmit}>
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                正在生成总结…
              </>
            ) : (
              '生成总结'
            )}
          </button>
        </form>

        {summary ? (
  <section className="result" aria-live="polite">
    <h2>摘要</h2>
    <div style={{marginBottom:"8px"}}>
      <button
        onClick={() => {
          const selection = window.getSelection();
          const selectedText = selection.toString().trim();
          if(selectedText){
            setHighlights([
              ...highlights,
              {
                id: Date.now(),
                text: selectedText,
                color: "#ff4444"
              }
            ])
          }
        }}
        style={{padding:"4px 8px",marginRight:"6px"}}
      >
        选中文字标红
      </button>
      <button
        onClick={()=>setHighlights([])}
        style={{padding:"4px 8px"}}
      >
        清除全部标记
      </button>
    </div>
    <p>
      {(()=>{
        let content = summary;
        // 依次替换所有高亮文本
        highlights.forEach(h=>{
          content = content.replaceAll(h.text, `<mark style="background:#ffdddd;color:#d02020">${h.text}</mark>`)
        })
        return <span dangerouslySetInnerHTML={{__html:content}} />
      })()}
    </p >
    <div style={{marginTop:"12px"}}>
      <h4>📝 本条备注</h4>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="给这条摘要写备注、想法、待办..."
        rows={3}
        style={{width:"100%",padding:"8px",marginTop:"4px",boxSizing:"border-box"}}
      />
    </div>
  </section>
) : null}
      </main>
    </div>
  );
}

export default App;
