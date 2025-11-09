'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ReactECharts from 'echarts-for-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  graphOption?: any; // ECharts option object
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
  "Compare education enrollment by province",
  "How many people have seeing disabilities?",
  "What is the hearing disability rate?",
  "Compare male and female populations by province",
  "How many people have walking or climbing disabilities?",
  "What percentage of households are semi-pakka?",
  "Compare urban and rural literacy rates",
  "How many people have communication disabilities?",
  "What is the enrollment rate in middle schools?",
  "Compare population growth rates across provinces",
  "How many people have memorization or focus disabilities?",
  "What percentage of structures are economic?",
  "Compare transgender population across regions",
  "How many people have self-care disabilities?",
  "What is the enrollment rate in matric schools?",
  "Compare pakka and kacha houses by province",
  "How many people never attended school?",
  "What is the enrollment rate in intermediate schools?",
  "Compare functional limitations across provinces",
  "How many people dropped out of school?",
  "What percentage of structures are high-rise?",
  "Compare rural and urban household sizes",
  "How many people completed graduation or above?",
  "What is the enrollment rate in graduation and above?",
  "Compare disability rates in urban vs rural areas",
  "How many residential structures are there?",
  "What percentage of people live in urban areas?",
  "Compare sex ratios across all provinces",
  "How many people have ever attended school?",
  "What is the population of Khyber Pakhtunkhwa?",
  "Compare population density across provinces",
  "How many economic structures are there?",
  "What is the population of Balochistan?",
  "Compare literacy rates in urban vs rural areas",
  "How many structures are residential and economic?",
  "What is the average household size in Punjab?",
  "Compare disability types: seeing vs hearing",
  "How many people are enrolled in primary education?",
  "What percentage of households are kacha?",
  "Compare population growth from 2017 to 2023",
  "How many normal structures are there?",
  "What is the transgender population in Pakistan?",
  "Compare enrollment rates across education levels",
  "How many people are out of school (5-16 years)?",
  "What is the population of Islamabad?",
  "Compare urban and rural growth rates",
  "How many people have never been to school (5-16)?",
  "What percentage of structures are under construction?",
  "Compare male to female ratios across provinces",
  "How many people completed middle education?",
  "What is the functional limitation rate?",
  "Compare pakka, semi-pakka, and kacha houses",
  "How many people are enrolled in matric?",
  "What is the population density in Punjab?",
  "Compare disability rates across provinces",
  "How many people are enrolled in intermediate?",
  "What percentage of structures are other types?",
  "Compare literacy rates by gender",
  "How many jughi, jhompri, tent, or cave structures exist?",
  "What is the population density in Sindh?",
  "Compare education completion rates",
  "How many people are enrolled in graduation and above?",
  "What is the population density in Khyber Pakhtunkhwa?",
  "Compare urban and rural disability rates",
  "How many residential and economic combined structures?",
  "What is the population density in Balochistan?"
];

const PREDICTION_QUESTIONS = [
  "Predict Pakistan's population in 2030",
  "What will be the literacy rate in Punjab by 2035?",
  "Forecast urban population growth for the next 10 years",
  "Predict population growth in Sindh for 2025-2030",
  "What will be the sex ratio in Balochistan in 2030?",
  "Forecast literacy rate improvement across provinces",
  "Predict household growth in urban areas",
  "What will be the population density in Islamabad by 2035?",
  "Forecast rural to urban migration trends",
  "Predict education enrollment rates for next 5 years",
  "What will be the total population growth by 2040?",
  "Forecast disability rates for next decade",
  "Predict housing structure trends (pakka vs kacha)",
  "What will be the growth rate in Khyber Pakhtunkhwa?",
  "Forecast population by gender for 2030",
  "Predict urbanization trends for all provinces",
  "What will be the average household size in 2030?",
  "Forecast literacy improvement in rural areas",
  "Predict population distribution across provinces in 2035",
  "What will be the growth rate comparison by 2030?"
];

// Function to get random questions
const getRandomQuestions = (count: number = 4, isPrediction: boolean = false): string[] => {
  const questions = isPrediction ? PREDICTION_QUESTIONS : ALL_SUGGESTED_QUESTIONS;
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to detect if a question is about predictions
function isPredictionQuestion(message: string): boolean {
  const predictionKeywords = [
    'predict', 'forecast', 'future', 'will be', 'by 2030', 'by 2035', 'by 2040',
    'next 5 years', 'next 10 years', 'next decade', 'projection', 'trend',
    'growth forecast', 'estimate future', 'upcoming', 'coming years'
  ];
  const lowerMessage = message.toLowerCase();
  return predictionKeywords.some(keyword => lowerMessage.includes(keyword));
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant for Pakistan's 2023 Census data. I can help you explore population statistics, demographics, education, housing, and more. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [predictionMode, setPredictionMode] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize suggested questions on client side only to avoid hydration mismatch
  useEffect(() => {
    setSuggestedQuestions(getRandomQuestions(4, predictionMode));
  }, [predictionMode]);

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

      // For prediction questions, fetch prediction graph separately
      let graphOption = null;
      if (isPredictionQuestion(textToSend)) {
        try {
          const predictionResponse = await fetch('/api/predictions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: textToSend
            }),
          });
          
          if (predictionResponse.ok) {
            const predictionData = await predictionResponse.json();
            graphOption = predictionData.graphOption || null;
          }
        } catch (error) {
          console.error('Error fetching prediction graph:', error);
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: conversationHistory,
          predictionMode: predictionMode
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
        content: data.message,
        graphOption: graphOption || data.graphOption || undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update suggested questions after each response (client-side only)
      setTimeout(() => {
        setSuggestedQuestions(getRandomQuestions(4, predictionMode));
      }, 0);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Census Data Assistant</h2>
              <p className="text-xs sm:text-sm text-blue-100">
                {predictionMode ? '🔮 Prediction Mode: Ask about future trends' : 'Ask me anything about Pakistan\'s 2023 Census'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const newMode = !predictionMode;
              setPredictionMode(newMode);
              // Update questions will happen in useEffect
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              predictionMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={predictionMode ? 'Turn off Prediction Mode' : 'Turn on Prediction Mode'}
          >
            {predictionMode ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">
              {predictionMode ? 'Prediction ON' : 'Prediction OFF'}
            </span>
          </button>
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
                  
                  {/* Render graph if available */}
                  {message.graphOption && (
                    <div className="mt-4 w-full bg-white rounded-lg border-2 border-gray-200 p-4" style={{ minHeight: '350px' }}>
                      <div className="h-[350px] w-full">
                        <ReactECharts 
                          option={message.graphOption} 
                          style={{ height: '100%', width: '100%' }}
                          opts={{ renderer: 'svg' }}
                        />
                      </div>
                    </div>
                  )}
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
          <p className="text-xs font-semibold text-gray-600 mb-2">
            {predictionMode ? '🔮 Prediction Questions:' : '💡 Suggested Questions:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className={`text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border transition-all duration-200 hover:shadow-sm active:scale-95 ${
                  predictionMode
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border-purple-200 hover:border-purple-300'
                    : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200 hover:border-blue-300'
                }`}
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

