'use client';
import { useState, useEffect } from 'react';

const CSS = `
@keyframes aiScaleIn {
  from { transform: scale(0.85) translateY(8px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.ai-chat-fab { position: fixed; bottom: 28px; right: 28px; width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #2a195c 0%, #6366f1 100%); color: #fff; border: none; font-size: 12.5px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 24px rgba(99,102,241,0.45); z-index: 990; display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.4,0,0.2,1); font-family: 'Inter', sans-serif; }
.ai-chat-fab:hover { transform: scale(1.08) translateY(-3px); box-shadow: 0 12px 28px rgba(99,102,241,0.55); }
.ai-chat-panel { position: fixed; bottom: 90px; right: 28px; background: #fff; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04); z-index: 990; width: 360px; height: 500px; display: flex; flex-direction: column; overflow: hidden; animation: aiScaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; font-family: 'Inter', sans-serif; }
.ai-chat-header { background: linear-gradient(135deg, #2a195c 0%, #3b2080 100%); color: #fff; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.ai-chat-title { font-size: 13.5px; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 6px; }
.ai-chat-actions { display: flex; align-items: center; gap: 8px; }
.ai-chat-btn-icon { background: none; border: none; color: #E2E8F0; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px; border-radius: 50%; transition: background 0.15s; }
.ai-chat-btn-icon:hover { background: rgba(255,255,255,0.15); color: #fff; }
.ai-chat-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; background: #F8FAFC; scroll-behavior: smooth; }
.ai-msg { max-width: 82%; padding: 10px 14px; border-radius: 12px; font-size: 12.5px; line-height: 1.5; font-weight: 500; word-break: break-word; }
.ai-msg-user { background: #6366f1; color: #fff; align-self: flex-end; border-bottom-right-radius: 2px; }
.ai-msg-bot { background: #fff; color: #1E293B; align-self: flex-start; border-bottom-left-radius: 2px; border: 1px solid #E2E8F0; }
.ai-msg-error { background: #FEF2F2; color: #EF4444; align-self: center; border: 1px solid #FEE2E2; text-align: center; border-radius: 8px; font-size: 12px; }
.ai-chat-footer { padding: 12px; background: #fff; border-top: 1px solid #E2E8F0; display: flex; flex-direction: column; gap: 8px; }
.ai-chat-input-row { display: flex; gap: 8px; }
.ai-chat-inp { flex: 1; padding: 9px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 13px; font-weight: 500; outline: none; transition: border-color 0.15s; font-family: 'Inter', sans-serif; }
.ai-chat-inp:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.1); }
.ai-chat-send { padding: 8px 14px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: background 0.15s; font-family: 'Inter', sans-serif; }
.ai-chat-send:hover { background: #4f46e5; }
.ai-chat-send:disabled { opacity: 0.55; cursor: not-allowed; }
.ai-chat-quick-tags { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.ai-chat-quick-tags::-webkit-scrollbar { display: none; }
.ai-chat-tag { font-size: 10.5px; font-weight: 700; background: #EEF2FF; color: #6366f1; border: 1px solid #E0E7FF; padding: 4px 8px; border-radius: 15px; cursor: pointer; white-space: nowrap; transition: all 0.15s; flex-shrink: 0; }
.ai-chat-tag:hover { background: #E0E7FF; }
.ai-chat-settings { padding: 12px; background: #FAF5FF; border-bottom: 1px solid #E8DFFA; display: flex; flex-direction: column; gap: 6px; }
.ai-chat-key-lbl { font-size: 11px; font-weight: 700; color: #2A195C; }
.ai-chat-key-inp { padding: 7px 10px; border: 1.5px solid #DDD6FE; border-radius: 6px; font-size: 12px; font-weight: 500; background: #fff; outline: none; font-family: 'Inter', sans-serif; }
.ai-chat-key-inp:focus { border-color: #2A195C; }
.ai-typing-dots { display: flex; gap: 4px; align-items: center; padding: 8px 14px; }
.ai-typing-dots span { width: 7px; height: 7px; background: #94A3B8; border-radius: 50%; animation: typingBounce 1.2s infinite ease-in-out; }
.ai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.ai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
`;

export default function AiChatBot() {
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; isError?: boolean }[]>([
    { role: 'bot', text: 'Hello! I\'m Evegah AI — your intelligent dashboard assistant. I can add vehicles, assign zones, configure pricing, and answer any questions about the platform.' }
  ]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('evegah_gemini_key') || '';
    setGeminiKey(saved);
  }, []);

  const saveKey = (val: string) => {
    setGeminiKey(val);
    localStorage.setItem('evegah_gemini_key', val);
  };

  const sendMessage = async (preset?: string) => {
    const textToSend = preset || chatInput;
    if (!textToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    if (!preset) setChatInput('');
    setIsSending(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, apiKey: geminiKey })
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
      } else {
        const errText = data.message || data.error || `Error ${res.status}: AI request failed. Check your API key.`;
        setMessages(prev => [...prev, { role: 'bot', text: errText, isError: true }]);
      }
    } catch (err: any) {
      const errMsg = err?.message?.includes('fetch') 
        ? 'Cannot reach backend server. Is it running on port 5000?'
        : (err?.message || 'Unexpected error — please try again.');
      setMessages(prev => [...prev, { role: 'bot', text: errMsg, isError: true }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Sleek Round Shape Floating Button */}
      <button className="ai-chat-fab" onClick={() => setShowChat(v => !v)} id="evegah-ai-fab" title="Ask Evegah AI Automator">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Panel */}
      {showChat && (
        <div className="ai-chat-panel" id="evegah-ai-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D2FC00" strokeWidth="2.5">
                <polygon points="12 2 2 22 22 22" />
              </svg>
              Evegah AI Automator
            </div>
            <div className="ai-chat-actions">
              <button
                className="ai-chat-btn-icon"
                onClick={() => setShowSettings(v => !v)}
                title={geminiKey ? 'API Key configured ✓' : 'Configure Gemini API Key'}
              >
                {geminiKey ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                )}
              </button>
              <button className="ai-chat-btn-icon" onClick={() => setShowChat(false)} title="Close">✕</button>
            </div>
          </div>

          {/* Settings panel — API key input */}
          {showSettings && (
            <div className="ai-chat-settings">
              <span className="ai-chat-key-lbl">
                🔑 Gemini API Key {geminiKey ? '(configured ✓)' : '(required)'}
              </span>
              <input
                type="password"
                className="ai-chat-key-inp"
                placeholder="Paste your Gemini API key here..."
                value={geminiKey}
                onChange={e => saveKey(e.target.value)}
                autoComplete="off"
              />
              <span style={{ fontSize: '10px', color: '#64748B' }}>
                Get your key at <strong>aistudio.google.com</strong> → Get API Key. Stored locally only.
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="ai-chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ${msg.role === 'user' ? 'ai-msg-user' : msg.isError ? 'ai-msg-error' : 'ai-msg-bot'}`}>
                {msg.text}
              </div>
            ))}
            {isSending && (
              <div className="ai-msg ai-msg-bot" style={{ padding: '6px 10px' }}>
                <div className="ai-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Footer: quick tags + input */}
          <div className="ai-chat-footer">
            <div className="ai-chat-quick-tags">
              <span className="ai-chat-tag" onClick={() => sendMessage('Add vehicle EVM-999 with model Evegah Mink to Gotri Zone')}>➕ Add Vehicle</span>
              <span className="ai-chat-tag" onClick={() => sendMessage('Assign vehicle EVM-999 to Aatapi Zone')}>📍 Assign Zone</span>
              <span className="ai-chat-tag" onClick={() => sendMessage('Configure Gotri Zone pricing to Hourly Based with base price 120 and extra 15')}>💰 Set Pricing</span>
              <span className="ai-chat-tag" onClick={() => sendMessage('How many vehicles are active today?')}>📊 Stats</span>
            </div>
            <div className="ai-chat-input-row">
              <input
                type="text"
                className="ai-chat-inp"
                placeholder={geminiKey ? 'Type a command or question...' : '⚠ Set API key in ⚙ settings first'}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                disabled={isSending}
              />
              <button className="ai-chat-send" onClick={() => sendMessage()} disabled={isSending || !chatInput.trim()}>
                {isSending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
