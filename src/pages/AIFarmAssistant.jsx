import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Bot, User, Globe, MoreVertical, ImagePlus } from 'lucide-react';
import api from '../services/api';

export default function AIFarmAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! I am your KisaanSetu AI Assistant. How can I help you today with your farming?", sender: 'ai', time: '10:00 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newUserMsg = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    const messageToSend = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', { message: messageToSend });
      
      const newAiMsg = {
        id: messages.length + 2,
        text: data.reply,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMsg = {
        id: messages.length + 2,
        text: "Sorry, I am having trouble connecting to the server right now. Please try again later.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50 max-w-4xl mx-auto border-x border-gray-200 shadow-sm">
      
      {/* Chat Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20 relative">
            <Bot className="w-6 h-6 text-brand-green" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">AI Agri-Expert</h2>
            <p className="text-xs text-green-600 font-medium">Online & Ready to Help</p>
          </div>
        </div>
        <div className="flex gap-4 text-gray-500">
          <button className="hover:text-brand-green transition-colors flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg font-medium">
            <Globe className="w-4 h-4" /> English
          </button>
          <button className="hover:text-gray-900 transition-colors p-1.5">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#E5DDD5] bg-opacity-40">
        <div className="text-center rounded-lg bg-yellow-100/80 text-yellow-800 text-xs py-2 px-4 mx-auto w-max mb-6 font-medium border border-yellow-200">
          AI messages are generated and should be verified for complex issues.
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-gray-200' : 'bg-brand-green text-white'}`}>
                  {msg.sender === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`relative px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'bg-brand-green text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'}`}>
                  <p className="text-[15px] leading-relaxed font-sans">{msg.text}</p>
                  <span className={`text-[10px] mt-2 block text-right font-medium ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-4"
            >
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-4 flex gap-1 shadow-sm items-center">
                  <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <button type="button" className="p-3 text-gray-400 hover:text-brand-green transition-colors absolute left-1 top-1/2 -translate-y-1/2 z-10">
            <ImagePlus className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about crop diseases, fertilizers, or mandi prices..."
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-full pl-12 pr-12 py-4 shadow-inner transition-colors"
          />
          {inputText ? (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-green text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-brand-green hover:bg-gray-100 rounded-full transition-colors">
              <Mic className="w-6 h-6" />
            </button>
          )}
        </form>
      </div>

    </div>
  );
}
