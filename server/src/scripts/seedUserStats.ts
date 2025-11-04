
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserStats from '../models/UserStats';
import { format, subDays } from 'date-fns';
import logger from '../config/logger';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/augmend-health')
  .then(() => {
    logger.info('Connected to MongoDB for seeding user stats');
    seedUserStats()
      .then(() => {
        logger.info('User stats seeding completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Error seeding user stats:', error);
        process.exit(1);
      });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

async function seedUserStats() {
  try {
    // Remove existing data
    await UserStats.deleteMany({});
    logger.info('Cleared existing user stats data');

    // Default user ID (this should match a user in your system)
    const defaultUserId = new mongoose.Types.ObjectId('645ac32d9587542223f82140');

    // Generate weekly breakdown data for the last 7 days
    const weeklyBreakdown: Record<string, any> = {};
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const day = subDays(today, i);
      const dateKey = format(day, 'yyyy-MM-dd');
      
      weeklyBreakdown[dateKey] = {
        activities: Math.floor(Math.random() * 5) + 1,
        duration: Math.floor(Math.random() * 60) + 15,
        wellnessScore: Math.floor(Math.random() * 15) + 75,
      };
    }

    // Create user stats document
    const userStats = new UserStats({
      userId: defaultUserId,
      weeklyProgress: 85,
      streak: 7,
      goalsCompleted: 12,
      totalGoals: 15,
      wellnessScore: 85,
      lastCalculated: new Date(),
      weeklyBreakdown,
      contentProgress: {
        article: 65,
        video: 40,
        exercise: 80,
        audio: 30,
      },
    });

    await userStats.save();
    logger.info(`Created user stats for user ID: ${defaultUserId}`);

    logger.info('User stats seeding successfully completed!');
  } catch (error) {
    logger.error('Error during user stats seeding:', error);
    throw error;
  }
}
