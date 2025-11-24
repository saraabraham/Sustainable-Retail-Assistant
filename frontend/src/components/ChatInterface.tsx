import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, Recommendation } from '@/types';
import recommendationService from '@/services/recommendationService';

interface ChatInterfaceProps {
  onRecommendationsReceived?: (recommendations: Recommendation[]) => void;
}

export default function ChatInterface({ onRecommendationsReceived }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your sustainable shopping assistant. Tell me what you're looking for, and I'll help you find products that match your needs and values. 🌱",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process query with NLP
      const nlpResult = await recommendationService.processNaturalLanguageQuery(input);
      
      // Get recommendations
      const result = await recommendationService.getRecommendations(input);

      if (result.success && result.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateResponseMessage(result.data, nlpResult.data),
          timestamp: new Date(),
          recommendations: result.data,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        
        if (onRecommendationsReceived) {
          onRecommendationsReceived(result.data);
        }

        // Track interaction
        await recommendationService.trackInteraction({
          action: 'search',
          query: input,
          metadata: { recommendationCount: result.data.length },
        });
      } else {
        throw new Error('Failed to get recommendations');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponseMessage = (
    recommendations: Recommendation[],
    nlpData?: any
  ): string => {
    if (recommendations.length === 0) {
      return "I couldn't find products matching your criteria. Could you provide more details or try a different search?";
    }

    const topProduct = recommendations[0].product;
    const sustainabilityMention = topProduct.sustainabilityScore >= 80
      ? ' These products have excellent sustainability ratings! ♻️'
      : '';

    return `I found ${recommendations.length} product${recommendations.length > 1 ? 's' : ''} that match your needs.${sustainabilityMention} Take a look at the recommendations below.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-sustainable-600 to-sustainable-500 text-white p-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Sustainable Shopping Assistant</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-sustainable-600 text-white'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block" suppressHydrationWarning>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-sustainable-600" />
              <span className="text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about sustainable products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sustainable-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-sustainable-600 text-white rounded-lg hover:bg-sustainable-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Try: "Show me sustainable furniture" or "I need eco-friendly kitchen items under $200"
        </p>
      </div>
    </div>
  );
}
