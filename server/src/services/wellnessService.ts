
import WellnessData, { IWellnessData, IBreathingSession, IMoodEntry } from '../models/WellnessData';
import { v4 as uuidv4 } from 'uuid';

// Temporary function until proper auth is implemented
const getOrCreateUserWellnessData = async (userId: string = 'anonymous'): Promise<IWellnessData> => {
  try {
    let wellnessData = await WellnessData.findOne({ userId });
    
    if (!wellnessData) {
      wellnessData = new WellnessData({
        userId,
        moodEntries: [],
        breathingSessions: []
      });
      await wellnessData.save();
    }
    
    return wellnessData;
  } catch (error) {
    throw new Error(`Error getting wellness data: ${error}`);
  }
};

export const recordMood = async (mood: string, userId: string = 'anonymous'): Promise<IWellnessData> => {
  try {
    const wellnessData = await getOrCreateUserWellnessData(userId);
    
    const moodEntry: IMoodEntry = {
      mood,
      timestamp: new Date()
    } as IMoodEntry;
    
    wellnessData.moodEntries.push(moodEntry);
    await wellnessData.save();
    
    return wellnessData;
  } catch (error) {
    throw new Error(`Error recording mood: ${error}`);
  }
};

export const recordBreathingSession = async (
  duration: number, 
  completedBreaths: number, 
  userId: string = 'anonymous'
): Promise<IWellnessData> => {
  try {
    const wellnessData = await getOrCreateUserWellnessData(userId);
    
    const breathingSession: IBreathingSession = {
      duration,
      completedBreaths,
      timestamp: new Date()
    } as IBreathingSession;
    
    wellnessData.breathingSessions.push(breathingSession);
    await wellnessData.save();
    
    return wellnessData;
  } catch (error) {
    throw new Error(`Error recording breathing session: ${error}`);
  }
};

export const getRecentMoods = async (limit: number = 5, userId: string = 'anonymous'): Promise<IMoodEntry[]> => {
  try {
    const wellnessData = await getOrCreateUserWellnessData(userId);
    return wellnessData.moodEntries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  } catch (error) {
    throw new Error(`Error getting recent moods: ${error}`);
  }
};

export const getBreathingStats = async (userId: string = 'anonymous'): Promise<any> => {
  try {
    const wellnessData = await getOrCreateUserWellnessData(userId);
    
    const totalSessions = wellnessData.breathingSessions.length;
    const totalMinutes = wellnessData.breathingSessions.reduce(
      (acc, session) => acc + session.duration / 60, 0
    );
    const totalBreaths = wellnessData.breathingSessions.reduce(
      (acc, session) => acc + session.completedBreaths, 0
    );
    
    return {
      totalSessions,
      totalMinutes,
      totalBreaths
    };
  } catch (error) {
    throw new Error(`Error getting breathing stats: ${error}`);
  }
};
