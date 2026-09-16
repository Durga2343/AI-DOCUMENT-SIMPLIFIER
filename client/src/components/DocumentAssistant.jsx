import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const DocumentAssistant = ({ documentId }) => {
  const [activeTab, setActiveTab] = useState('chat'); // chat, translate, explain
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Translate state
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [translationText, setTranslationText] = useState('');
  const [translatedResult, setTranslatedResult] = useState('');
  const [isTranslateLoading, setIsTranslateLoading] = useState(false);

  // Explain state
  const [highlightedText, setHighlightedText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isExplainLoading, setIsExplainLoading] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for text selection on the page for the 'explain' feature
  useEffect(() => {
    const handleSelection = () => {
      const text = window.getSelection().toString().trim();
      if (text.length > 0) {
        setHighlightedText(text);
      }
    };
    
    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [activeTab]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsChatLoading(true);

    try {
      const res = await axios.post(`${API_URL}/assistant/chat/${documentId}`, {
        message: userMessage.text,
        history: messages
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { role: 'model', text: res.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!translationText.trim()) return;
    setIsTranslateLoading(true);
    setTranslatedResult('');
    
    try {
      const res = await axios.post(`${API_URL}/assistant/translate/${documentId}`, {
        text: translationText,
        targetLanguage
      });
      if (res.data.success) {
        setTranslatedResult(res.data.translatedText);
      }
    } catch (err) {
      console.error(err);
      setTranslatedResult('Translation failed. Please try again.');
    } finally {
      setIsTranslateLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!highlightedText.trim()) return;
    setIsExplainLoading(true);
    setExplanation('');

    try {
      const res = await axios.post(`${API_URL}/assistant/explain/${documentId}`, {
        highlightedText
      });
      if (res.data.success) {
        setExplanation(res.data.explanation);
      }
    } catch (err) {
      console.error(err);
      setExplanation('Failed to explain text. Please try again.');
    } finally {
      setIsExplainLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1C1722] rounded-3xl border border-[#2A2433] overflow-hidden shadow-xl">
      {/* Tabs Header */}
      <div className="flex border-b border-[#2A2433] bg-[#100E14] p-1.5 gap-1">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat' 
              ? 'bg-[#8B5CF6] text-white shadow-md' 
              : 'text-[#A9A1AE] hover:text-[#F8F5FA] hover:bg-[#1C1722]'
          }`}
        >
          Chat
        </button>
        <button 
          onClick={() => setActiveTab('translate')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'translate' 
              ? 'bg-[#E879A8] text-white shadow-md' 
              : 'text-[#A9A1AE] hover:text-[#F8F5FA] hover:bg-[#1C1722]'
          }`}
        >
          Translate
        </button>
        <button 
          onClick={() => setActiveTab('explain')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'explain' 
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] text-white shadow-md' 
              : 'text-[#A9A1AE] hover:text-[#F8F5FA] hover:bg-[#1C1722]'
          }`}
        >
          Explain
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2A2433] flex items-center justify-center text-[#8B5CF6] mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-bold mb-1">Smart Document Assistant</h3>
                  <p className="text-[#A9A1AE] text-xs leading-relaxed">Ask any question about this document! I have complete context of its extracted contents.</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] text-white rounded-br-none shadow-md' : 'bg-[#100E14] text-[#F8F5FA] rounded-bl-none border border-[#2A2433]'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#100E14] text-[#A9A1AE] rounded-2xl rounded-bl-none px-4 py-3 border border-[#2A2433] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E879A8] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F0A6C7] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#2A2433] bg-[#100E14]">
              <form onSubmit={handleSendMessage} className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..." 
                  className="w-full bg-[#16121C] border border-[#2A2433] rounded-full py-2.5 pl-4 pr-12 text-sm text-[#F8F5FA] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isChatLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#E879A8] text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'translate' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto custom-scroll space-y-4">
            <div>
              <label className="block text-xs text-[#A9A1AE] mb-1.5 font-semibold">Target Language</label>
              <select 
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full bg-[#16121C] border border-[#2A2433] rounded-xl py-2 px-3 text-sm text-[#F8F5FA] focus:outline-none focus:border-[#E879A8]"
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Hindi">Hindi</option>
                <option value="Chinese">Chinese (Simplified)</option>
                <option value="Arabic">Arabic</option>
                <option value="Japanese">Japanese</option>
                <option value="Portuguese">Portuguese</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#A9A1AE] mb-1.5 font-semibold">Text to Translate</label>
              <textarea 
                value={translationText}
                onChange={(e) => setTranslationText(e.target.value)}
                placeholder="Paste any section or excerpt from the document here..."
                className="w-full h-32 bg-[#16121C] border border-[#2A2433] rounded-xl p-3 text-sm text-[#F8F5FA] focus:outline-none focus:border-[#E879A8] resize-none custom-scroll"
              ></textarea>
            </div>
            <button 
              onClick={handleTranslate}
              disabled={!translationText.trim() || isTranslateLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {isTranslateLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Translating...</>
              ) : 'Translate Now'}
            </button>

            {translatedResult && (
              <div className="mt-4 p-4 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
                <h4 className="text-xs font-bold text-[#F0A6C7] uppercase tracking-wider mb-2">Translation ({targetLanguage})</h4>
                <p className="text-sm text-[#F8F5FA] whitespace-pre-wrap leading-relaxed">{translatedResult}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="flex flex-col h-full p-4 overflow-y-auto custom-scroll space-y-4">
            <div className="bg-[#E879A8]/10 rounded-2xl p-4 border border-[#E879A8]/20">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#E879A8]/20 text-[#E879A8] mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 1 0-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Highlight &amp; Explain</h4>
                  <p className="text-xs text-[#A9A1AE] leading-relaxed">Select any text on the page or paste a complex clause below to get a plain-English explanation.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#A9A1AE] mb-1.5 font-semibold">Target Clause / Text</label>
              <textarea 
                value={highlightedText}
                onChange={(e) => setHighlightedText(e.target.value)}
                placeholder="Highlight text on the page, or paste it here..."
                className="w-full h-24 bg-[#16121C] border border-[#2A2433] rounded-xl p-3 text-sm text-[#F8F5FA] focus:outline-none focus:border-[#E879A8] resize-none custom-scroll"
              ></textarea>
            </div>
            
            <button 
              onClick={handleExplain}
              disabled={!highlightedText.trim() || isExplainLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
            >
              {isExplainLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Explaining...</>
              ) : 'Explain Clause'}
            </button>

            {explanation && (
              <div className="mt-4 p-4 rounded-2xl bg-[#E879A8]/15 border border-[#E879A8]/30">
                <h4 className="text-xs font-bold text-[#F0A6C7] uppercase tracking-wider mb-2">Plain English Breakdown</h4>
                <p className="text-sm text-[#F8F5FA] whitespace-pre-wrap leading-relaxed">{explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentAssistant;
