
import { format } from 'date-fns';
import ConversationRepository from '../repositories/ConversationRepository';
import MessageRepository from '../repositories/MessageRepository';
import SuggestedQuestionRepository from '../repositories/SuggestedQuestionRepository';

interface HealthAssistantResponse {
  response: string;
  timestamp: string;
}

export class HealthAssistantService {
  async getSuggestedQuestions(): Promise<string[]> {
    try {
      const questions = await SuggestedQuestionRepository.getActiveSuggestedQuestions();
      return questions.map(q => q.text);
    } catch (error) {
      console.error('Error fetching suggested questions:', error);
      return this.getDefaultSuggestedQuestions();
    }
  }

  getDefaultSuggestedQuestions(): string[] {
    return [
      'How can I improve my sleep quality?',
      'What are good foods for heart health?',
      'How much exercise is recommended weekly?',
      'What can help with stress reduction?',
      'How can I stay hydrated throughout the day?'
    ];
  }

  async processUserMessage(userId: string, messageContent: string): Promise<HealthAssistantResponse> {
    try {
      // Create conversation if it doesn't exist (simplified approach for now)
      const conversations = await ConversationRepository.getUserConversations(userId);
      let conversationId;
      
      if (conversations.length === 0) {
        const newConversation = await ConversationRepository.createConversation(userId);
        conversationId = newConversation._id;
      } else {
        conversationId = conversations[0]._id;
      }
      
      // Save user message
      await MessageRepository.addMessage(conversationId.toString(), {
        content: messageContent,
        sender: 'user',
        timestamp: new Date()
      });
      
      // Generate assistant response
      const aiResponse = await this.generateAIResponse(messageContent);
      
      // Save assistant message
      await MessageRepository.addMessage(conversationId.toString(), {
        content: aiResponse,
        sender: 'assistant',
        timestamp: new Date()
      });
      
      return {
        response: aiResponse,
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      };
    } catch (error) {
      console.error('Error processing user message:', error);
      return {
        response: 'I apologize, but I encountered an error processing your request. Please try again later.',
        timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      };
    }
  }

  private async generateAIResponse(userMessage: string): Promise<string> {
    // This is a simple rule-based response system
    // In production, you'd integrate with a proper NLP service
    
    const lowercaseMessage = userMessage.toLowerCase();
    
    // Emergency check
    if (
      lowercaseMessage.includes('emergency') ||
      lowercaseMessage.includes('heart attack') ||
      lowercaseMessage.includes('suicide') ||
      lowercaseMessage.includes('urgent care') ||
      lowercaseMessage.includes('911')
    ) {
      return "This appears to be an emergency situation. I'm not capable of providing emergency assistance. Please call your local emergency number (like 911) immediately.";
    }
    
    // Sleep-related queries
    if (
      lowercaseMessage.includes('sleep') ||
      lowercaseMessage.includes('insomnia') ||
      lowercaseMessage.includes('can\'t sleep')
    ) {
      return "Good sleep hygiene is essential for health. Here are some tips:\n\n- Maintain a consistent sleep schedule\n- Create a relaxing bedtime routine\n- Keep your bedroom cool, dark, and quiet\n- Avoid screens at least 1 hour before bed\n- Limit caffeine after noon\n- Exercise regularly, but not too close to bedtime\n\nIf you're consistently having trouble sleeping, consider speaking with a healthcare provider.";
    }
    
    // Nutrition-related queries
    if (
      lowercaseMessage.includes('food') ||
      lowercaseMessage.includes('diet') ||
      lowercaseMessage.includes('nutrition') ||
      lowercaseMessage.includes('eat')
    ) {
      return "A balanced diet is key to good health. Generally, focus on:\n\n- Plenty of fruits and vegetables\n- Whole grains\n- Lean proteins\n- Healthy fats like olive oil and avocados\n- Limited processed foods and added sugars\n\nThe specific diet that works best varies by individual. Consider consulting with a registered dietitian for personalized advice.";
    }
    
    // Exercise-related queries
    if (
      lowercaseMessage.includes('exercise') ||
      lowercaseMessage.includes('workout') ||
      lowercaseMessage.includes('fitness') ||
      lowercaseMessage.includes('physical activity')
    ) {
      return "Regular physical activity is important for both physical and mental health. The general recommendation is:\n\n- At least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly\n- Muscle-strengthening activities twice a week\n\nFind activities you enjoy to make exercise sustainable. Start slowly if you're new to exercise, and consider consulting with a healthcare provider before beginning a new exercise program.";
    }
    
    // Stress-related queries
    if (
      lowercaseMessage.includes('stress') ||
      lowercaseMessage.includes('anxiety') ||
      lowercaseMessage.includes('worried') ||
      lowercaseMessage.includes('overwhelmed')
    ) {
      return "Managing stress is important for overall wellbeing. Some effective strategies include:\n\n- Regular mindfulness or meditation practice\n- Deep breathing exercises\n- Regular physical activity\n- Adequate sleep\n- Setting boundaries\n- Connecting with supportive people\n- Limiting news and social media when feeling overwhelmed\n\nIf stress is significantly impacting your life, consider speaking with a mental health professional.";
    }
    
    // Default response for other queries
    return "Thank you for your question. As a health assistant, I can provide general information on topics like nutrition, exercise, sleep, and stress management. For personalized medical advice, please consult with a qualified healthcare provider. Is there a specific health topic I can provide general information about?";
  }
}

export default new HealthAssistantService();
