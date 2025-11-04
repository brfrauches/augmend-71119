
import api, { handleApiError } from './api';
import { Reflection, ReflectionStreaks, MoodStatistic } from '@/types/reflection';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const RESOURCE_URL = '/reflections';

// Function to fetch all reflections with optional filters
export const fetchReflections = async (filters = {}): Promise<Reflection[]> => {
  try {
    const params = new URLSearchParams();
    
    // Add any filters to the query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`${RESOURCE_URL}${queryString}`);
    
    // Map the backend IDs to our frontend format
    return response.data.map((reflection: any) => ({
      id: reflection._id,
      text: reflection.text,
      mood: reflection.mood,
      date: reflection.date,
      tags: reflection.tags,
      createdAt: reflection.createdAt,
      updatedAt: reflection.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching reflections:', error);
    
    // Fallback to localStorage during transition
    const savedReflections = localStorage.getItem("reflections");
    return savedReflections ? JSON.parse(savedReflections) : [];
  }
};

// Function to fetch a reflection by ID
export const fetchReflectionById = async (id: string): Promise<Reflection | null> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    const reflection = response.data;
    
    return {
      id: reflection._id,
      text: reflection.text,
      mood: reflection.mood,
      date: reflection.date,
      tags: reflection.tags,
      createdAt: reflection.createdAt,
      updatedAt: reflection.updatedAt
    };
  } catch (error) {
    console.error(`Error fetching reflection ${id}:`, error);
    
    // Fallback to localStorage during transition
    const savedReflections = localStorage.getItem("reflections");
    if (savedReflections) {
      const reflections: Reflection[] = JSON.parse(savedReflections);
      return reflections.find(r => r.id === id) || null;
    }
    return null;
  }
};

// Function to create a new reflection
export const createReflection = async (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reflection> => {
  try {
    const response = await api.post(RESOURCE_URL, reflection);
    const newReflection = response.data;
    
    return {
      id: newReflection._id,
      text: newReflection.text,
      mood: newReflection.mood,
      date: newReflection.date,
      tags: newReflection.tags,
      createdAt: newReflection.createdAt,
      updatedAt: newReflection.updatedAt
    };
  } catch (error) {
    console.error('Error creating reflection:', error);
    
    // Fallback to localStorage during transition
    const tempReflection: Reflection = {
      id: uuidv4(),
      text: reflection.text,
      mood: reflection.mood,
      date: reflection.date,
      tags: reflection.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const savedReflections = localStorage.getItem("reflections");
    const reflections: Reflection[] = savedReflections ? JSON.parse(savedReflections) : [];
    reflections.push(tempReflection);
    localStorage.setItem("reflections", JSON.stringify(reflections));
    
    // Show toast notification
    const { toast } = useToast();
    toast({
      title: "Offline Mode",
      description: "Your reflection has been saved locally. It will sync when you reconnect.",
      variant: "default"
    });
    
    return tempReflection;
  }
};

// Function to update an existing reflection
export const updateReflection = async (id: string, reflection: Partial<Reflection>): Promise<Reflection | null> => {
  try {
    const response = await api.put(`${RESOURCE_URL}/${id}`, reflection);
    const updatedReflection = response.data;
    
    return {
      id: updatedReflection._id,
      text: updatedReflection.text,
      mood: updatedReflection.mood,
      date: updatedReflection.date,
      tags: updatedReflection.tags,
      createdAt: updatedReflection.createdAt,
      updatedAt: updatedReflection.updatedAt
    };
  } catch (error) {
    console.error(`Error updating reflection ${id}:`, error);
    
    // Fallback to localStorage during transition
    const savedReflections = localStorage.getItem("reflections");
    if (savedReflections) {
      const reflections: Reflection[] = JSON.parse(savedReflections);
      const index = reflections.findIndex(r => r.id === id);
      
      if (index >= 0) {
        reflections[index] = { 
          ...reflections[index], 
          ...reflection, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem("reflections", JSON.stringify(reflections));
        
        // Show toast notification
        const { toast } = useToast();
        toast({
          title: "Offline Mode",
          description: "Your changes have been saved locally. They will sync when you reconnect.",
          variant: "default"
        });
        
        return reflections[index];
      }
    }
    return null;
  }
};

// Function to delete a reflection
export const deleteReflection = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${RESOURCE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting reflection ${id}:`, error);
    
    // Fallback to localStorage during transition
    const savedReflections = localStorage.getItem("reflections");
    if (savedReflections) {
      const reflections: Reflection[] = JSON.parse(savedReflections);
      const filteredReflections = reflections.filter(r => r.id !== id);
      localStorage.setItem("reflections", JSON.stringify(filteredReflections));
      
      // Show toast notification
      const { toast } = useToast();
      toast({
        title: "Offline Mode",
        description: "The reflection has been deleted locally. This will sync when you reconnect.",
        variant: "default"
      });
      
      return true;
    }
    return false;
  }
};

// Function to get reflection streaks
export const getReflectionStreaks = async (): Promise<ReflectionStreaks> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/streaks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching reflection streaks:', error);
    
    // Calculate streaks from local storage as fallback
    const savedReflections = localStorage.getItem("reflections");
    if (savedReflections) {
      const reflections: Reflection[] = JSON.parse(savedReflections);
      
      // Sort by date
      reflections.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Get unique dates
      const uniqueDates = [...new Set(reflections.map(r => 
        new Date(r.date).toISOString().split('T')[0]
      ))].map(d => new Date(d));
      
      // Calculate streaks
      const streaks: any[] = [];
      let currentStreak: any = { start: null, end: null, length: 0 };
      
      uniqueDates.forEach((date, index) => {
        if (index === 0) {
          currentStreak.start = date.toISOString();
          currentStreak.end = date.toISOString();
          currentStreak.length = 1;
        } else {
          const prevDate = uniqueDates[index - 1];
          const diffDays = Math.round((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            // Continue the streak
            currentStreak.end = date.toISOString();
            currentStreak.length++;
          } else {
            // End the previous streak and start a new one
            streaks.push({ ...currentStreak });
            currentStreak = { 
              start: date.toISOString(), 
              end: date.toISOString(), 
              length: 1 
            };
          }
        }
        
        // Add the last streak if we're at the end
        if (index === uniqueDates.length - 1) {
          streaks.push({ ...currentStreak });
        }
      });
      
      return {
        currentStreak: streaks.length > 0 ? streaks[streaks.length - 1].length : 0,
        longestStreak: streaks.reduce((max, streak) => Math.max(max, streak.length), 0),
        streaks
      };
    }
    
    // Default empty streaks
    return {
      currentStreak: 0,
      longestStreak: 0,
      streaks: []
    };
  }
};

// Function to get mood statistics
export const getMoodStatistics = async (period?: string): Promise<MoodStatistic[]> => {
  try {
    const params = period ? `?period=${period}` : '';
    const response = await api.get(`${RESOURCE_URL}/mood-stats${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching mood statistics:', error);
    
    // Calculate mood stats from local storage as fallback
    const savedReflections = localStorage.getItem("reflections");
    if (savedReflections) {
      const reflections: Reflection[] = JSON.parse(savedReflections);
      
      // Filter by period if specified
      let filteredReflections = reflections;
      if (period) {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (period) {
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredReflections = reflections.filter(r => 
          new Date(r.date) >= cutoffDate
        );
      }
      
      // Count occurrences of each mood
      const moodCounts: Record<string, number> = {};
      filteredReflections.forEach(r => {
        moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
      });
      
      // Convert to array of mood statistics
      return Object.entries(moodCounts).map(([mood, count]) => ({
        mood,
        count
      })).sort((a, b) => b.count - a.count);
    }
    
    return [];
  }
};
