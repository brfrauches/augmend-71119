
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Content from '../models/Content';
import logger from '../config/logger';
import { connectDatabase } from '../config/database';

dotenv.config();

const contentData = [
  {
    title: "Understanding Anxiety",
    description: "Learn about the root causes of anxiety and effective coping mechanisms.",
    type: "article",
    category: ["Mental Health", "Anxiety"],
    tags: ["anxiety", "mental health", "coping mechanisms"],
    difficulty: "Beginner",
    duration: 10,
    contentBody: "Anxiety is a natural response to stress, but when it becomes overwhelming...",
    isPublished: true
  },
  {
    title: "Guided Meditation for Beginners",
    description: "A calming meditation session for stress relief.",
    type: "audio",
    category: ["Meditation", "Stress Management"],
    tags: ["meditation", "stress relief", "relaxation"],
    difficulty: "Beginner",
    duration: 15,
    contentUrl: "https://example.com/guided-meditation.mp3",
    isPublished: true
  },
  {
    title: "Cognitive Behavioral Exercises",
    description: "Interactive exercises to challenge negative thought patterns.",
    type: "exercise",
    category: ["CBT", "Mental Health"],
    tags: ["CBT", "thought patterns", "mental health"],
    difficulty: "Intermediate",
    duration: 20,
    contentBody: "Step 1: Identify negative thoughts. Step 2: Challenge these thoughts...",
    isPublished: true
  },
  {
    title: "Stress Management Techniques",
    description: "Video demonstration of effective stress management techniques.",
    type: "video",
    category: ["Stress Management", "Wellness"],
    tags: ["stress management", "wellness", "techniques"],
    difficulty: "Beginner",
    duration: 12,
    contentUrl: "https://example.com/stress-management.mp4",
    isPublished: true
  },
  {
    title: "Deep Breathing Exercises",
    description: "Learn proper deep breathing techniques for instant stress relief.",
    type: "exercise",
    category: ["Stress Management", "Breathing"],
    tags: ["breathing", "stress relief", "relaxation"],
    difficulty: "Beginner",
    duration: 8,
    contentBody: "Box breathing involves inhaling for 4 counts, holding for 4...",
    isPublished: true
  },
  {
    title: "Understanding Depression",
    description: "An in-depth look at depression causes, symptoms, and treatments.",
    type: "article",
    category: ["Mental Health", "Depression"],
    tags: ["depression", "mental health", "treatment"],
    difficulty: "Intermediate",
    duration: 15,
    contentBody: "Depression is more than just feeling sad. It involves persistent feelings...",
    isPublished: true
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Audio guide for progressive muscle relaxation technique.",
    type: "audio",
    category: ["Relaxation", "Stress Management"],
    tags: ["relaxation", "muscle tension", "stress relief"],
    difficulty: "Beginner",
    duration: 20,
    contentUrl: "https://example.com/progressive-muscle-relaxation.mp3",
    isPublished: true
  },
  {
    title: "Mindful Walking Practice",
    description: "Video guide showing how to practice mindfulness while walking.",
    type: "video",
    category: ["Mindfulness", "Movement"],
    tags: ["mindfulness", "walking", "meditation"],
    difficulty: "Beginner",
    duration: 18,
    contentUrl: "https://example.com/mindful-walking.mp4",
    isPublished: true
  }
];

const seedContent = async () => {
  try {
    await connectDatabase();
    
    // Clear existing data
    await Content.deleteMany({});
    logger.info('Cleared existing content data');
    
    // Insert new data
    await Content.insertMany(contentData);
    logger.info(`Successfully seeded ${contentData.length} content items`);
    
    mongoose.disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error seeding content data:', error);
    process.exit(1);
  }
};

seedContent();
