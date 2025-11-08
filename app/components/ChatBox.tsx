'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ALL_SUGGESTED_QUESTIONS = [
  "What is the total population of Pakistan?",
  "What is the literacy rate in Pakistan?",
  "Compare urban and rural populations",
  "What percentage of households are pakka?",
  "What is the sex ratio in Punjab?",
  "How many people have disabilities?",
  "What is the growth rate from 2017 to 2023?",
  "Which province has the highest population density?",
  "What is the average household size?",
  "How many children are out of school?",
  "What is the population of Sindh?",
  "Compare literacy rates across provinces",
  "How many pakka houses are in Punjab?",
  "What is the disability rate in Khyber Pakhtunkhwa?",
  "Which province has the most urban population?",
  "What is the sex ratio in Balochistan?",
  "How many structures are under construction?",
  "What is the enrollment rate in primary schools?",
  "Compare household sizes in urban vs rural areas",
  "What percentage of people live in rural areas?",
  "Which province has the lowest literacy rate?",
  "How many high-rise buildings are there?",
  "What is the population density in Islamabad?",
  "Compare disability types across regions",
  "What is the growth rate in Sindh?",
  "How many people completed primary education?",
  "What percentage of structures are residential?",
  "Compare education enrollment by province"
];

// Function to get random questions
const getRandomQuestions = (count: number = 4): string[] => {
  const shuffled = [...ALL_SUGGESTED_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for Pakistan's 2023 Census data. I can help you explore population statistics, demographics, education, housing, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(getRandomQuestions(4));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: conversationHistory
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to get response');
      }

      if (!data.message) {
        throw new Error('No message in response');
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggested questions after each response
      setSuggestedQuestions(getRandomQuestions(4));
    } catch (error: any) {
      console.error('Error sending message:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message) {
        if (error.message.includes('API key') || error.message.includes('GEMINI_API_KEY')) {
          errorText = '⚠️ Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.';
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          errorText = '⚠️ API rate limit exceeded. Please try again in a few moments.';
        } else if (error.message.includes('population data')) {
          errorText = '⚠️ Failed to load population data. Please check that population_2023.json exists.';
        } else {
          errorText = `⚠️ Error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorText
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[800px] bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 sm:p-4 border-b-2 border-blue-700">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">Census Data Assistant</h2>
            <p className="text-xs sm:text-sm text-blue-100">Ask me anything about Pakistan's 2023 Census</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-2 sm:gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                  : 'bg-white text-gray-800 border-2 border-gray-200 shadow-sm'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm sm:prose-base max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-sm sm:text-base">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-sm sm:text-base">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-sm sm:text-base">{children}</ol>,
                      li: ({ children }) => <li className="text-sm sm:text-base">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children }) => (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs sm:text-sm mb-2">
                          {children}
                        </pre>
                      ),
                      h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base sm:text-lg font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm sm:text-base font-semibold mb-1">{children}</h3>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-3 italic my-2 text-sm sm:text-base">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
            {message.role === 'user' && (
              <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 sm:gap-3 justify-start">
            <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - Show after every message */}
      {!isLoading && suggestedQuestions.length > 0 && (
        <div className="p-3 sm:p-4 bg-white border-t-2 border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">💡 Suggested Questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white border-t-2 border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about population, demographics, education, housing..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm sm:text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-1.5 sm:gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

