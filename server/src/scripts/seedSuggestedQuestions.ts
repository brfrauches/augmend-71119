
import mongoose from 'mongoose';
import SuggestedQuestion from '../models/SuggestedQuestion';
import { config } from '../config/config';

const suggestedQuestions = [
  {
    category: 'general',
    text: 'How can I improve my sleep quality?',
    displayOrder: 1,
    isActive: true,
  },
  {
    category: 'nutrition',
    text: 'What are good foods for heart health?',
    displayOrder: 2,
    isActive: true,
  },
  {
    category: 'exercise',
    text: 'How much exercise is recommended weekly?',
    displayOrder: 3,
    isActive: true,
  },
  {
    category: 'mental',
    text: 'What can help with stress reduction?',
    displayOrder: 4,
    isActive: true,
  },
  {
    category: 'nutrition',
    text: 'How can I stay hydrated throughout the day?',
    displayOrder: 5,
    isActive: true,
  },
  {
    category: 'nutrition',
    text: 'What's a balanced breakfast?',
    displayOrder: 6,
    isActive: true,
  },
  {
    category: 'exercise',
    text: 'How can I start a safe exercise routine?',
    displayOrder: 7,
    isActive: true,
  },
  {
    category: 'mental',
    text: 'What are good mindfulness practices?',
    displayOrder: 8,
    isActive: true,
  },
  {
    category: 'general',
    text: 'How can I improve my posture?',
    displayOrder: 9,
    isActive: true,
  },
  {
    category: 'general',
    text: 'Tips for reducing screen time?',
    displayOrder: 10,
    isActive: true,
  },
];

async function seedSuggestedQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongo.url);
    console.log('Connected to MongoDB');

    // Delete existing data
    await SuggestedQuestion.deleteMany({});
    console.log('Cleared existing suggested questions');

    // Insert new data
    await SuggestedQuestion.insertMany(suggestedQuestions);
    console.log('Successfully seeded suggested questions');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding suggested questions:', error);
    process.exit(1);
  }
}

seedSuggestedQuestions();
