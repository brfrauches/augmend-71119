
import { ChatMessage, SuggestedQuestion } from '../models/HealthAssistant';

export const saveChat = async (userMessage: string, assistantResponse: string, userId?: string) => {
  try {
    const chatRecord = new ChatMessage({
      userId,
      userMessage,
      assistantResponse,
      createdAt: new Date()
    });
    
    await chatRecord.save();
    return chatRecord;
  } catch (error) {
    console.error('Error saving chat:', error);
    throw new Error('Failed to save chat history');
  }
};

export const generateResponse = async (message: string): Promise<string> => {
  // This is a simple template response generator
  // In a production environment, this would likely call an LLM API (like OpenAI)
  
  const lowercaseMessage = message.toLowerCase();
  
  // Emergency detection
  if (lowercaseMessage.includes('emergency') || 
      lowercaseMessage.includes('heart attack') || 
      lowercaseMessage.includes('suicide')) {
    return 'This appears to be an emergency situation. I am not capable of providing emergency assistance. Please call your local emergency number (like 911) immediately.';
  }
  
  // Diet related questions
  if (lowercaseMessage.includes('diet') || 
      lowercaseMessage.includes('food') || 
      lowercaseMessage.includes('eat')) {
    return 'A balanced diet is essential for good health. Focus on whole foods, plenty of fruits and vegetables, lean proteins, and whole grains. Limit processed foods, sugars, and unhealthy fats. Remember that individual dietary needs can vary, so it\'s best to consult with a healthcare professional for personalized advice.';
  }
  
  // Exercise related questions
  if (lowercaseMessage.includes('exercise') || 
      lowercaseMessage.includes('workout') || 
      lowercaseMessage.includes('fitness')) {
    return 'Regular physical activity is important for overall health. Adults should aim for at least 150 minutes of moderate-intensity exercise per week, along with muscle-strengthening activities twice a week. Always start gradually and listen to your body. Finding activities you enjoy will help you maintain consistency.';
  }
  
  // Sleep related questions
  if (lowercaseMessage.includes('sleep') || 
      lowercaseMessage.includes('insomnia') || 
      lowercaseMessage.includes('tired')) {
    return 'Good sleep is crucial for health. Aim for 7-9 hours of quality sleep per night. Establish a regular sleep schedule, create a restful environment, limit screen time before bed, and avoid caffeine and large meals close to bedtime. If you have persistent sleep issues, consider consulting a healthcare provider.';
  }
  
  // Default response
  return 'I\'m here to provide general health information. Please note that I\'m not a replacement for professional medical advice. For specific health concerns, it\'s best to consult with a qualified healthcare provider.';
};

export const getSuggestedQuestions = async (): Promise<string[]> => {
  try {
    // Try to get questions from the database
    const dbQuestions = await SuggestedQuestion.find({ isActive: true })
      .sort({ priority: -1 })
      .limit(5);
    
    if (dbQuestions.length > 0) {
      return dbQuestions.map(q => q.question);
    }
    
    // If no questions in database, return defaults
    return [
      'How can I improve my sleep quality?',
      'What are good foods for heart health?',
      'How much exercise is recommended weekly?',
      'What can help with stress reduction?',
      'How can I stay hydrated throughout the day?'
    ];
  } catch (error) {
    console.error('Error fetching suggested questions:', error);
    // Return default questions on error
    return [
      'How can I improve my sleep quality?',
      'What are good foods for heart health?',
      'How much exercise is recommended weekly?',
      'What can help with stress reduction?',
      'How can I stay hydrated throughout the day?'
    ];
  }
};

export const addSuggestedQuestion = async (question: string, category: string = 'general', priority: number = 0): Promise<void> => {
  try {
    const newQuestion = new SuggestedQuestion({
      question,
      category,
      priority,
      isActive: true
    });
    
    await newQuestion.save();
  } catch (error) {
    console.error('Error adding suggested question:', error);
    throw new Error('Failed to add suggested question');
  }
};
