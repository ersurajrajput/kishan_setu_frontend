import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Bot, User, Globe, MoreVertical, ImagePlus, History, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';
import AlertBox from '../components/AlertBox';
import { getHumanReadableError, getContextualError } from '../utils/errorHandler';

export default function AIFarmAssistant() {
  const { user } = useAuth();
  const userId = user?.id;

  const [messages, setMessages] = useState([
    { id: 1, text: "Namaste! I am your KisaanSetu AI Assistant. How can I help you today with your farming?", sender: 'ai', time: '10:00 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChatTitle, setCurrentChatTitle] = useState('New Chat');
  const [firstQuestionAsked, setFirstQuestionAsked] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestionQuestions = [
    "How do I identify and treat rice leaf blast disease?",
    "What are the best fertilizers for wheat cultivation?",
    "How to manage pest infestation in cotton crops?",
    "What are current mandi prices for tomatoes?",
    "Best practices for organic vegetable farming",
    "How to prepare soil for potato planting?",
    "What is the ideal irrigation schedule for sugarcane?",
    "How to increase crop yield during monsoon season?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-save chat to history whenever messages change
  useEffect(() => {
    if (currentChatId && messages.length > 1) {
      saveCurrentChat();
    }
  }, [messages, currentChatTitle]);

  // Fetch chat history on component mount
  useEffect(() => {
    // Chat history endpoints not yet implemented in backend
    // fetchChatHistory();
    if (userId) {
      loadChatHistoryFromStorage();
    }
  }, [userId]);

  const loadChatHistoryFromStorage = () => {
    try {
      if (!userId) return;
      const storageKey = `kisaan_chat_history_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setChatHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const saveChatHistoryToStorage = (history) => {
    try {
      if (!userId) {
        console.warn('User ID not available, chat history not saved');
        return;
      }
      const storageKey = `kisaan_chat_history_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const createNewChat = () => {
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setCurrentChatTitle('New Chat');
    setMessages([
      { id: 1, text: "Namaste! I am your KisaanSetu AI Assistant. How can I help you today with your farming?", sender: 'ai', time: '10:00 AM' },
    ]);
    setFirstQuestionAsked(false);
    return newChatId;
  };

  const updateChatTitle = (chatId, question) => {
    // Generate title from first 50 characters of question
    const title = question.length > 50 ? question.substring(0, 50) + '...' : question;
    setCurrentChatTitle(title);
    
    if (chatId) {
      // Update in history
      setChatHistory(prev => {
        const updated = prev.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        );
        saveChatHistoryToStorage(updated);
        return updated;
      });
    }
  };

  const saveCurrentChat = () => {
    if (!currentChatId || !userId || messages.length <= 1) return;

    const userMessage = messages.find(m => m.sender === 'user');
    const chatToSave = {
      id: currentChatId,
      title: currentChatTitle,
      messages: messages,
      timestamp: new Date().toLocaleString(),
      firstQuestion: userMessage?.text || 'Chat',
      userId: userId
    };

    setChatHistory(prev => {
      const exists = prev.some(c => c.id === currentChatId);
      const updated = exists 
        ? prev.map(c => c.id === currentChatId ? chatToSave : c)
        : [chatToSave, ...prev];
      saveChatHistoryToStorage(updated);
      return updated;
    });
  };

  const fetchChatHistory = async () => {
    try {
      if (!userId) return;

      setLoadingHistory(true);
      const { data } = await api.get(`/chat/user/${userId}`);
      
      if (data && Array.isArray(data)) {
        // Save fetched history to localStorage for offline access
        const historyWithUserId = data.map(chat => ({ ...chat, userId }));
        setChatHistory(historyWithUserId);
        saveChatHistoryToStorage(historyWithUserId);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      // Fall back to local storage if API fails
      loadChatHistoryFromStorage();
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadChat = (chatId) => {
    try {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setCurrentChatTitle(chat.title);
        setMessages(chat.messages || []);
        setFirstQuestionAsked(true);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      setChatHistory(prev => {
        const updated = prev.filter(chat => chat.id !== chatId);
        saveChatHistoryToStorage(updated);
        return updated;
      });
      if (currentChatId === chatId) {
        createNewChat();
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion);
    // Optionally auto-submit
    // You can trigger handleSend here if desired
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let chatId = currentChatId;
    
    // If no current chat, create one
    if (!chatId) {
      chatId = createNewChat();
      setCurrentChatId(chatId);
    }

    const newUserMsg = {
      id: Date.now() + Math.random(),
      text: inputText,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMsg]);
    
    // Update title on first user question
    if (!firstQuestionAsked) {
      updateChatTitle(chatId, inputText);
      setFirstQuestionAsked(true);
    }

    const messageToSend = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Get user ID from localStorage
      const userInfo = localStorage.getItem('userInfo');
      const userId = userInfo ? JSON.parse(userInfo).id : null;

      if (!userId) {
        setError('You must be logged in to use the AI assistant. Please log in first.');
        const errorMsg = {
          id: Date.now() + Math.random(),
          text: "I need you to be logged in to help you. Please log in first.",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      // Call the Gemini API endpoint with POST request
      const { data } = await api.post('/gemini', { 
        id: userId,
        chat: messageToSend
      });
      
      // Extract the AI response from the API response
      let aiResponse = data || "Sorry, I couldn't process your request. Please try again.";
      
      const newAiMsg = {
        id: Date.now() + Math.random(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMessage = getHumanReadableError(error);
      setError(errorMessage);
      const errorMsg = {
        id: Date.now() + Math.random(),
        text: errorMessage || "Sorry, I am having trouble connecting. Please try again later.",
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      
      {/* Sidebar - Chat History */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm overflow-hidden">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-brand-green" />
            <h3 className="font-bold text-gray-900">Chat History</h3>
          </div>
          <button 
            onClick={createNewChat}
            className="w-full bg-brand-green text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No chat history yet</div>
          ) : (
            <div className="p-2 space-y-2">
              {chatHistory.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group"
                >
                  <button
                    onClick={() => loadChat(chat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate flex items-center justify-between ${
                      currentChatId === chat.id 
                        ? 'bg-brand-green text-white' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="truncate flex-1" title={chat.title}>{chat.title}</span>
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className={`opacity-0 group-hover:opacity-100 p-1 transition-all ${
                        currentChatId === chat.id ? 'hover:text-red-200' : 'hover:text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 border-x border-gray-200 shadow-sm">
      
      {/* Error Alert */}
      {error && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <AlertBox
            message={error}
            type="error"
            onDismiss={() => setError(null)}
          />
        </div>
      )}

      {/* Chat Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/20 relative">
            <Bot className="w-6 h-6 text-brand-green" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{currentChatTitle}</h2>
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
                  {msg.sender === 'ai' ? (
                    <div className="text-[15px] leading-relaxed font-sans">
                      <MarkdownRenderer text={msg.text} />
                    </div>
                  ) : (
                    <p className="text-[15px] leading-relaxed font-sans">{msg.text}</p>
                  )}
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
        {/* Show suggestions above input when chat is fresh */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-3 px-2">Try asking:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {suggestionQuestions.slice(0, 4).map((question, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  type="button"
                  onClick={() => handleSuggestionClick(question)}
                  className="text-left text-xs px-3 py-2 bg-green-50 border border-green-200 text-gray-700 rounded-lg hover:bg-brand-green hover:text-white hover:border-brand-green transition-all duration-200 font-medium truncate"
                >
                  {question}
                </motion.button>
              ))}
            </div>
          </div>
        )}
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
    </div>
  );
}
