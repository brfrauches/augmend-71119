
import api from './api';
import { Message, MessageType } from '@/components/health-assistant/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const RESOURCE_URL = '/health-assistant';

// Function to get a response from the Health Assistant
export const getAssistantResponse = async (message: string): Promise<Message> => {
  try {
    const response = await api.post(`${RESOURCE_URL}/chat`, { message });
    
    return {
      id: uuidv4(),
      type: 'assistant' as MessageType,
      content: response.data.response,
      timestamp: response.data.timestamp || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting assistant response:', error);
    
    // Fallback logic for when API is unavailable
    return generateFallbackResponse(message);
  }
};

// Function to get suggested questions from the Health Assistant
export const getSuggestedQuestions = async (): Promise<string[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/suggested-questions`);
    return response.data.questions;
  } catch (error) {
    console.error('Error getting suggested questions:', error);
    
    // Default questions as fallback
    return [
      'How can I improve my sleep quality?',
      'What are good foods for heart health?',
      'How much exercise is recommended weekly?',
      'What can help with stress reduction?',
      'How can I stay hydrated throughout the day?'
    ];
  }
};

// Helper function to generate a fallback response when API is unavailable
const generateFallbackResponse = (input: string): Message => {
  const lowercaseInput = input.toLowerCase();
  let responseContent = '';
  
  if (lowercaseInput.includes('emergency') || 
      lowercaseInput.includes('heart attack') || 
      lowercaseInput.includes('suicide')) {
    responseContent = 'This appears to be an emergency situation. I am not capable of providing emergency assistance. Please call your local emergency number (like 911) immediately.';
  } else {
    responseContent = 'I apologize, but I\'m currently unable to connect to the server. Please try again later or check your internet connection.\n\nFor emergency assistance, please contact emergency services.';
  }
  
  return {
    id: uuidv4(),
    type: 'assistant' as MessageType,
    content: responseContent,
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
  };
};

// Function to save messages to local storage as a backup
export const saveMessageToLocalStorage = (message: Message): void => {
  try {
    const storedMessages = localStorage.getItem('healthAssistantMessages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    messages.push(message);
    localStorage.setItem('healthAssistantMessages', JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving message to local storage:', error);
  }
};

// Function to get messages from local storage
export const getMessagesFromLocalStorage = (): Message[] => {
  try {
    const storedMessages = localStorage.getItem('healthAssistantMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
  } catch (error) {
    console.error('Error getting messages from local storage:', error);
    return [];
  }
};
