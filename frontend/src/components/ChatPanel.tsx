import { useState, useRef, useEffect, useCallback } from 'react';
import type { GraphNode, NodeType } from '../types/graph';
import { NODE_COLORS, NODE_LABELS } from '../types/graph';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: NodeRef[];
  timestamp: number;
}

interface NodeRef {
  id: string;
  name: string;
  node_type: string;
  summary_zh: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onFocusNode: (nodeType: string, nodeId: string) => void;
}

export default function ChatPanel({ isOpen, onClose, onFocusNode }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是 AI 知识图谱助手。你可以用自然语言向我提问，比如：\n\n• "Claude Code 和 Cursor 有什么区别？"\n• "最新的代码 Agent 有哪些？"\n• "Agentic AI 基于哪些技术？"\n\n我会搜索知识图谱来回答你的问题。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context
      const history = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/graph/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          history,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        references: data.references,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `抱歉，请求失败：${err instanceof Error ? err.message : '未知错误'}。请确保后端服务正在运行。`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cosmos-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(91,156,245,0.15))' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-semibold text-cosmos-text font-display tracking-tight">AI 对话</span>
            <span className="text-[10px] text-cosmos-dim ml-2 font-display">RAG</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-cosmos-muted hover:text-cosmos-text transition-colors p-1 rounded hover:bg-white/5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onFocusNode={onFocusNode}
          />
        ))}
        {loading && (
          <div className="flex items-center gap-2 px-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-stellar-violet/60 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-stellar-violet/60 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-stellar-violet/60 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-cosmos-dim">思考中...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-cosmos-border shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="向 AI 知识图谱提问..."
            rows={2}
            className="flex-1 bg-cosmos-surface/60 border border-cosmos-border rounded-xl px-3.5 py-2.5 text-sm text-cosmos-text placeholder:text-cosmos-muted outline-none focus:border-stellar-blue/40 focus:shadow-[0_0_20px_rgba(91,156,245,0.08)] transition-all resize-none font-body"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(91,156,245,0.25))'
                : 'rgba(100,130,180,0.08)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? '#a78bfa' : '#5c6a85'} strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-cosmos-dim mt-2 text-center font-display">
          Enter 发送 · Shift+Enter 换行 · 基于图谱的 RAG 回答
        </p>
      </div>
    </div>
  );
}

/* ─── Message Bubble ─────────────────────────── */
function MessageBubble({
  message,
  onFocusNode,
}: {
  message: Message;
  onFocusNode: (nodeType: string, nodeId: string) => void;
}) {
  const isUser = message.role === 'user';
  const isWelcome = message.id === 'welcome';

  // Parse [[node_id|node_name]] references and render as clickable buttons
  const renderContent = (text: string) => {
    const parts = text.split(/(\[\[[a-zA-Z0-9_-]+\|[^\]]+\]\])/g);
    return parts.map((part, i) => {
      const match = part.match(/^\[\[([a-zA-Z0-9_-]+)\|([^\]]+)\]\]$/);
      if (match) {
        const [, nodeId, nodeName] = match;
        return (
          <button
            key={i}
            onClick={() => {
              // Try to find the node type from references
              const ref = message.references?.find(r => r.id === nodeId);
              if (ref) {
                onFocusNode(ref.node_type, nodeId);
              }
            }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold transition-colors hover:opacity-80"
            style={{
              background: 'rgba(91,156,245,0.12)',
              color: '#5b9cf5',
            }}
          >
            <span className="text-[10px]">◈</span>
            {nodeName}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed font-body ${
            isUser
              ? 'rounded-br-md'
              : isWelcome
                ? 'rounded-bl-md'
                : 'rounded-bl-md'
          }`}
          style={{
            background: isUser
              ? 'linear-gradient(135deg, rgba(91,156,245,0.2), rgba(91,156,245,0.1))'
              : isWelcome
                ? 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(167,139,250,0.05))'
                : 'rgba(100,130,180,0.06)',
            border: isUser
              ? '1px solid rgba(91,156,245,0.2)'
              : '1px solid rgba(100,130,180,0.08)',
          }}
        >
          <div className="text-cosmos-text whitespace-pre-wrap">
            {renderContent(message.content)}
          </div>
        </div>

        {/* References chips */}
        {message.references && message.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
            {message.references.map(ref => (
              <button
                key={ref.id}
                onClick={() => onFocusNode(ref.node_type, ref.id)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold font-display tracking-wide transition-all hover:opacity-80"
                style={{
                  color: NODE_COLORS[ref.node_type as NodeType] || '#5b9cf5',
                  background: `${NODE_COLORS[ref.node_type as NodeType] || '#5b9cf5'}12`,
                  border: `1px solid ${NODE_COLORS[ref.node_type as NodeType] || '#5b9cf5'}20`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: NODE_COLORS[ref.node_type as NodeType] }}
                />
                {ref.name}
                <span className="opacity-50">{NODE_LABELS[ref.node_type as NodeType]}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-cosmos-dim mt-1 font-body ${isUser ? 'text-right mr-1' : 'ml-1'}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
