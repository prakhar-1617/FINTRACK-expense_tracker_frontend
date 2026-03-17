import { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { Sparkles, TrendingUp, TrendingDown, MessageSquare, Send, Bot, User, AlertCircle } from 'lucide-react';

export default function AIInsights() {
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chatbot State
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your AI Financial Assistant. Ask me about saving, budgeting, or managing your expenses." }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchAIData = async () => {
      try {
        const [insightsRes, predictRes] = await Promise.all([
          API.get('/ai/insights').catch(() => ({ data: { insights: [] } })),
          API.get('/ai/predict').catch(() => ({ data: null }))
        ]);
        
        if (insightsRes.data && insightsRes.data.insights) {
          setInsights(insightsRes.data.insights);
        }
        if (predictRes.data) {
          setPrediction(predictRes.data);
        }
      } catch (err) {
        console.error('Error fetching AI data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = inputMsg.trim();
    setInputMsg('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setSending(true);

    try {
      const { data } = await API.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I couldn't process your request right now." }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Financial Insights</h1>
          <p className="text-slate-500 text-sm">Smart analysis and predictions for your finances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Insights & Prediction */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Prediction Card */}
          {prediction && prediction.predicted !== null ? (
            <div className="card shadow-sm border-l-4 border-l-indigo-500">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                <TrendingUp className="text-indigo-500 w-5 h-5" /> Next Month Expense Prediction
              </h2>
              <div className="flex items-end gap-4">
                <div className="text-4xl font-bold text-slate-800 dark:text-white">
                  ₹{prediction.predicted.toLocaleString()}
                </div>
                <div className={`flex items-center text-sm font-semibold mb-1 ${prediction.slope > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {prediction.slope > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {prediction.message}
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Based on your historical spending patterns over the last few months using linear regression.
              </p>
            </div>
          ) : (
             <div className="card shadow-sm flex items-center gap-3 text-slate-500">
               <AlertCircle className="w-5 h-5 text-amber-500" />
               <p>Not enough historical data to predict next month's expenses. Add more transactions.</p>
             </div>
          )}

          {/* Insights List */}
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4">Personalized Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length === 0 ? (
              <div className="col-span-full p-6 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                Tracking more transactions will help AI generate specific insights.
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                  insight.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' :
                  insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' :
                  'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{insight.icon}</span>
                    <h3 className={`font-semibold ${
                      insight.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' :
                      insight.type === 'warning' ? 'text-amber-700 dark:text-amber-400' :
                      'text-blue-700 dark:text-blue-400'
                    }`}>{insight.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{insight.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: AI Chatbot */}
        <div className="card shadow-sm flex flex-col h-[600px] p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-white">AI Assistant</h2>
              <p className="text-xs text-slate-500">Ask financial questions</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <form onSubmit={handleSendMessage} className="relative">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your question..."
                className="input pr-12 rounded-full"
                disabled={sending}
              />
              <button 
                type="submit" 
                disabled={sending || !inputMsg.trim()}
                className="absolute right-2 top-1.5 p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
