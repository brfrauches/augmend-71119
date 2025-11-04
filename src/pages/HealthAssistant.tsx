import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Heart,
  Send,
  ChevronLeft,
  Bot,
  AlertCircle,
  Info,
  Trash2,
  X,
} from "lucide-react";
import {
  ChatMessage,
  Message,
  MessageType,
} from "@/components/health-assistant/ChatMessage";
import { SuggestedQuestions } from "@/components/health-assistant/SuggestedQuestions";
import { useToast } from "@/hooks/use-toast";
import { getAssistantResponse, getSuggestedQuestions } from "@/services/healthAssistantService";

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    type: "assistant",
    content:
      "Hello! I'm your AI Health Assistant. I can help answer questions about general health topics, wellness, and lifestyle. How can I help you today?",
    timestamp: new Date().toISOString(),
  },
];

const HealthAssistant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      try {
        const questions = await getSuggestedQuestions();
        setSuggestedQuestions(questions);
      } catch (error) {
        console.error("Error fetching suggested questions:", error);
      }
    };

    fetchSuggestedQuestions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await getAssistantResponse(userMessage.content);
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error getting assistant response:", error);
      
      const errorMessage: Message = {
        id: uuidv4(),
        type: "assistant",
        content: "I apologize, but I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the entire chat history?")) {
      setMessages(INITIAL_MESSAGES);
      toast({
        title: "Chat cleared",
        description: "Your conversation history has been cleared."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex flex-col">
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-full frosted-glass"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-foreground/70" />
              </button>
              <h1 className="text-xl font-semibold text-gradient flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                Health Assistant
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-full frosted-glass"
                aria-label="Information"
              >
                <Info className="w-5 h-5 text-foreground/70" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-2 rounded-full frosted-glass"
                aria-label="Clear chat"
              >
                <Trash2 className="w-5 h-5 text-foreground/70" />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex-1 flex pt-16 pb-20 relative">
        <div className="flex-1 overflow-hidden relative">
          <div className="px-4 py-6 h-full overflow-y-auto">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && (
                <ChatMessage
                  message={{
                    id: "typing",
                    type: "assistant",
                    content: "",
                    timestamp: new Date().toISOString(),
                  }}
                  isTyping
                />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {showInfo && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-0 top-16 bottom-0 w-full sm:w-96 bg-background/95 backdrop-blur-sm border-l border-border shadow-lg z-30 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">About Health Assistant</h3>
                <button 
                  onClick={() => setShowInfo(false)}
                  className="p-1.5 rounded-full hover:bg-secondary/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-secondary/40 rounded-lg border border-border">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-caution mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium mb-1">Medical Disclaimer</h4>
                      <p className="text-sm">
                        This AI assistant provides general information only, not personalized medical advice. Always consult qualified healthcare professionals for specific health concerns.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">What I can help with:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-primary mr-2 mt-0.5" />
                      General wellness information
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-primary mr-2 mt-0.5" />
                      Healthy lifestyle suggestions
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-primary mr-2 mt-0.5" />
                      Nutrition and exercise guidance
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-primary mr-2 mt-0.5" />
                      Stress management techniques
                    </li>
                    <li className="flex items-start">
                      <Heart className="w-4 h-4 text-primary mr-2 mt-0.5" />
                      Sleep improvement tips
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">What I cannot help with:</h4>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start">
                      <X className="w-4 h-4 text-destructive mr-2 mt-0.5" />
                      Medical diagnoses
                    </li>
                    <li className="flex items-start">
                      <X className="w-4 h-4 text-destructive mr-2 mt-0.5" />
                      Treatment recommendations
                    </li>
                    <li className="flex items-start">
                      <X className="w-4 h-4 text-destructive mr-2 mt-0.5" />
                      Emergency medical advice
                    </li>
                    <li className="flex items-start">
                      <X className="w-4 h-4 text-destructive mr-2 mt-0.5" />
                      Prescription medication guidance
                    </li>
                    <li className="flex items-start">
                      <X className="w-4 h-4 text-destructive mr-2 mt-0.5" />
                      Personal health record access
                    </li>
                  </ul>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  In case of emergency, please contact your local emergency services immediately.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelectQuestion={(question) => setInputValue(question)}
          />
          
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question..."
              className="input-minimal w-full pr-12 min-h-[50px] max-h-32 resize-none"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full ${
                !inputValue.trim() || isTyping
                  ? "text-muted-foreground bg-secondary/50"
                  : "text-primary-foreground bg-primary hover:bg-primary/90"
              } transition-colors`}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            For medical emergencies, please call your local emergency number or visit the nearest emergency room.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthAssistant;
