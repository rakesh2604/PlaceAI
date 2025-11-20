import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import Button from './Button';
import { chatApi } from '../../services/candidateApi';

const quickQuestions = [
  {
    question: 'How do AI interviews work?',
    answer: 'PlacedAI uses advanced AI to conduct realistic mock interviews. You\'ll answer questions just like in a real interview, and our AI will analyze your responses, body language, and communication skills to provide detailed feedback.',
  },
  {
    question: 'What is demo interview?',
    answer: 'A demo interview is a free trial interview that lets you experience PlacedAI without signing up. You can practice answering common interview questions and see how our AI feedback works before committing to a plan.',
  },
  {
    question: 'Is PlacedAI free for students?',
    answer: 'Yes! We offer a free plan with 3 AI interviews per month, basic resume analysis, and job recommendations. For unlimited interviews and advanced features, we have affordable premium plans starting at ₹499/month.',
  },
  {
    question: 'How accurate is the AI feedback?',
    answer: 'Our AI feedback is trained on thousands of real interview scenarios from Indian companies. 92% of students say our feedback matches what real recruiters expect. We provide detailed insights on communication, technical knowledge, and interview presence.',
  },
  {
    question: 'Can I use PlacedAI for Tier-2 college placements?',
    answer: 'Absolutely! PlacedAI is designed specifically for Indian students, including those from Tier-2 and Tier-3 colleges. We provide questions based on real Indian company interviews and help you compete effectively regardless of your college tier.',
  },
];

const defaultResponses = [
  'That\'s a great question! Let me help you with that.',
  'I understand your concern. Here\'s what you need to know...',
  'Thanks for asking! Here\'s the information you\'re looking for.',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hi! I\'m here to help you with PlacedAI. Ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleQuickQuestion = (questionObj) => {
    const botMessage = {
      id: messages.length + 1,
      type: 'user',
      text: questionObj.question,
      timestamp: new Date(),
    };
    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      text: questionObj.answer,
      timestamp: new Date(),
    };
    setMessages([...messages, botMessage, botResponse]);
  };

  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setSending(true);

    // Add loading message
    const loadingMessage = {
      id: messages.length + 2,
      type: 'bot',
      text: 'Thinking...',
      timestamp: new Date(),
      loading: true
    };
    setMessages(prev => [...prev, userMessage, loadingMessage]);

    try {
      // Call AI-powered chat API
      const response = await chatApi.ask(inputValue);
      const botResponseText = response.data?.response || response.data?.answer || 'I apologize, but I couldn\'t process that request. Please try rephrasing your question.';

      // Remove loading message and add real response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading);
        return [...filtered, {
          id: filtered.length + 1,
          type: 'bot',
          text: botResponseText,
          timestamp: new Date(),
        }];
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Remove loading message and add error response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.loading);
        return [...filtered, {
          id: filtered.length + 1,
          type: 'bot',
          text: 'I apologize, but I encountered an error. Please try again or contact support@placedai.com.',
          timestamp: new Date(),
        }];
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white hover:shadow-xl hover:shadow-cyan-500/60 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Chat panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] glassmorphism-strong rounded-2xl shadow-2xl border border-cyan-500/30 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-dark-200 dark:border-dark-700 bg-gradient-to-r from-cyan-500/10 to-blue-600/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-manrope font-bold text-dark-900 dark:text-dark-100">
                        PlacedAI Help
                      </h3>
                      <p className="text-xs text-dark-600 dark:text-dark-400">
                        Usually replies instantly
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-dark-600 dark:text-dark-400 mt-2">
                  Need help with PlacedAI? Ask common questions or explore quick tips.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                          : 'bg-dark-100 dark:bg-dark-800 text-dark-900 dark:text-dark-100'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-dark-200 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-dark-600 dark:text-dark-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Quick questions */}
              <div className="p-4 border-t border-dark-200 dark:border-dark-700 bg-dark-50/50 dark:bg-dark-900/50">
                <p className="text-xs font-semibold text-dark-600 dark:text-dark-400 mb-2">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickQuestions.slice(0, 3).map((q, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-colors"
                    >
                      {q.question}
                    </motion.button>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-dark-100 placeholder:text-dark-400 dark:placeholder:text-dark-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

