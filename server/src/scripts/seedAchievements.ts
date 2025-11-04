
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import AchievementService from '../services/AchievementService';
import { connectToDatabase } from '../config/database';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const initialAchievements = [
  {
    title: 'First Step',
    description: 'Completed your first exercise',
    icon: '🎯',
    criteria: {
      action: 'COMPLETE_EXERCISE',
      specialType: 'FIRST_ACTION'
    },
    pointsValue: 10,
    category: 'SPECIAL',
    isRepeatable: false
  },
  {
    title: 'Weekly Warrior',
    description: 'Completed 5 exercises in a week',
    icon: '⚡',
    criteria: {
      action: 'COMPLETE_EXERCISE',
      requiredCount: 5,
      timeframe: 'WEEK'
    },
    pointsValue: 25,
    category: 'COUNT',
    isRepeatable: true,
    cooldownPeriod: 7 // Can earn again after 7 days
  },
  {
    title: 'Mindfulness Master',
    description: 'Completed 10 meditation sessions',
    icon: '🧘',
    criteria: {
      action: 'COMPLETE_MEDITATION',
      requiredCount: 10,
      timeframe: 'MONTH'
    },
    pointsValue: 50,
    category: 'COUNT',
    isRepeatable: false
  },
  {
    title: 'Consistency Champion',
    description: 'Used the app for 30 consecutive days',
    icon: '🏆',
    criteria: {
      requiredStreakDays: 30
    },
    pointsValue: 100,
    category: 'STREAK',
    isRepeatable: false
  },
  {
    title: 'Reflection Guru',
    description: 'Created 20 journal entries',
    icon: '📝',
    criteria: {
      action: 'CREATE_REFLECTION',
      requiredTotal: 20
    },
    pointsValue: 30,
    category: 'MILESTONE',
    isRepeatable: false
  },
  {
    title: 'Emotional Explorer',
    description: 'Recorded 5 different moods in your reflections',
    icon: '😊',
    criteria: {
      action: 'RECORD_MOOD',
      requiredCount: 5,
      distinct: true
    },
    pointsValue: 15,
    category: 'COUNT',
    isRepeatable: false
  }
];

const seedAchievements = async (): Promise<void> => {
  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');

    // Check if achievements already exist
    const existingAchievements = await AchievementService.getAllAchievements();
    
    if (existingAchievements.length > 0) {
      console.log(`${existingAchievements.length} achievements already exist. Skipping seeding.`);
      return;
    }

    // Seed achievements
    console.log('Seeding achievements...');
    
    for (const achievement of initialAchievements) {
      await AchievementService.createAchievement(achievement);
      console.log(`Created achievement: ${achievement.title}`);
    }
    
    console.log('Achievement seeding complete!');
  } catch (error) {
    console.error('Error seeding achievements:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Run the seed function
seedAchievements();
