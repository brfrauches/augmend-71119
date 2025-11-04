
import api from './api';
import { ContentItem } from '@/components/content/ContentCard';
import { Content, UserContent, ContentFilters } from '@/types/content';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const RESOURCE_URL = '/content';

// Convert API content format to frontend ContentItem format
const mapContentToContentItem = (content: Content, userContent?: UserContent): ContentItem => {
  return {
    id: content._id || content.id || '',
    title: content.title,
    description: content.description,
    type: content.type,
    duration: `${content.duration} min`,
    difficulty: content.difficulty,
    progress: userContent?.progress || 0,
    isBookmarked: userContent?.isBookmarked || false
  };
};

// Function to get all content
export const fetchContent = async (filters?: ContentFilters): Promise<ContentItem[]> => {
  try {
    const response = await api.get(RESOURCE_URL, { params: filters });
    return response.data.map((content: Content) => mapContentToContentItem(content));
  } catch (error) {
    console.error('Error fetching content:', error);
    
    // Fallback data for when API is unavailable
    return [
      {
        id: "1",
        title: "Understanding Anxiety",
        description: "Learn about the root causes of anxiety and effective coping mechanisms.",
        type: "article",
        duration: "10 min read",
        difficulty: "Beginner",
        progress: 75,
        isBookmarked: false
      },
      {
        id: "2",
        title: "Guided Meditation",
        description: "A calming meditation session for stress relief.",
        type: "audio",
        duration: "15 min",
        difficulty: "Beginner",
        progress: 0,
        isBookmarked: true
      },
      {
        id: "3",
        title: "Cognitive Behavioral Exercises",
        description: "Interactive exercises to challenge negative thought patterns.",
        type: "exercise",
        duration: "20 min",
        difficulty: "Intermediate",
        progress: 30,
        isBookmarked: false
      },
      {
        id: "4",
        title: "Stress Management Techniques",
        description: "Video demonstration of effective stress management techniques.",
        type: "video",
        duration: "12 min",
        difficulty: "Beginner",
        progress: 0,
        isBookmarked: false
      }
    ];
  }
};

// Function to get content by category
export const fetchContentByCategory = async (category: string): Promise<ContentItem[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/category/${category}`);
    return response.data.map((content: Content) => mapContentToContentItem(content));
  } catch (error) {
    console.error(`Error fetching content for category ${category}:`, error);
    
    // Fall back to fetching all content and filtering client-side
    const allContent = await fetchContent();
    if (category.toLowerCase() === 'all') {
      return allContent;
    }
    return allContent.filter(item => item.type.toLowerCase() === category.toLowerCase());
  }
};

// Function to get content by type
export const fetchContentByType = async (type: string): Promise<ContentItem[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/type/${type}`);
    return response.data.map((content: Content) => mapContentToContentItem(content));
  } catch (error) {
    console.error(`Error fetching content for type ${type}:`, error);
    
    // Fall back to fetching all content and filtering client-side
    const allContent = await fetchContent();
    if (type.toLowerCase() === 'all') {
      return allContent;
    }
    return allContent.filter(item => item.type.toLowerCase() === type.toLowerCase());
  }
};

// Function to get content by ID
export const fetchContentById = async (id: string): Promise<ContentItem | null> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return mapContentToContentItem(response.data);
  } catch (error) {
    console.error(`Error fetching content for ID ${id}:`, error);
    return null;
  }
};

// Function to toggle bookmark status
export const toggleBookmark = async (id: string, userId: string = "currentUser"): Promise<ContentItem | null> => {
  try {
    const response = await api.post(`${RESOURCE_URL}/users/${userId}/content/${id}/bookmark`);
    const userContent = response.data;
    
    // Get the content details
    const contentResponse = await api.get(`${RESOURCE_URL}/${id}`);
    return mapContentToContentItem(contentResponse.data, userContent);
  } catch (error) {
    console.error(`Error toggling bookmark for content ${id}:`, error);
    
    // In offline mode, we'll simulate the toggle locally
    const allContent = await fetchContent();
    const contentItem = allContent.find(item => item.id === id);
    
    if (contentItem) {
      contentItem.isBookmarked = !contentItem.isBookmarked;
      return contentItem;
    }
    
    return null;
  }
};

// Function to update progress
export const updateProgress = async (id: string, progress: number, userId: string = "currentUser"): Promise<ContentItem | null> => {
  try {
    const response = await api.put(`${RESOURCE_URL}/users/${userId}/content/${id}/progress`, { progress });
    const userContent = response.data;
    
    // Get the content details
    const contentResponse = await api.get(`${RESOURCE_URL}/${id}`);
    return mapContentToContentItem(contentResponse.data, userContent);
  } catch (error) {
    console.error(`Error updating progress for content ${id}:`, error);
    
    // In offline mode, we'll simulate the update locally
    const allContent = await fetchContent();
    const contentItem = allContent.find(item => item.id === id);
    
    if (contentItem) {
      contentItem.progress = progress;
      
      // Store in localStorage for offline persistence
      try {
        const storedProgress = JSON.parse(localStorage.getItem('contentProgress') || '{}');
        storedProgress[id] = progress;
        localStorage.setItem('contentProgress', JSON.stringify(storedProgress));
      } catch (err) {
        console.error('Error storing progress in localStorage:', err);
      }
      
      return contentItem;
    }
    
    return null;
  }
};

// Function to get bookmarked content
export const fetchBookmarkedContent = async (userId: string = "currentUser"): Promise<ContentItem[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/users/${userId}/bookmarks`);
    return response.data.map((userContent: UserContent) => 
      mapContentToContentItem(userContent.contentId, userContent)
    );
  } catch (error) {
    console.error(`Error fetching bookmarked content for user ${userId}:`, error);
    
    // Fall back to fetching all content and filtering client-side
    const allContent = await fetchContent();
    return allContent.filter(item => item.isBookmarked);
  }
};

// Function to get recommended content
export const fetchRecommendedContent = async (userId: string = "currentUser"): Promise<ContentItem[]> => {
  try {
    const response = await api.get(`${RESOURCE_URL}/users/${userId}/recommendations`);
    return response.data.map((content: Content) => mapContentToContentItem(content));
  } catch (error) {
    console.error(`Error fetching recommended content for user ${userId}:`, error);
    
    // Return a subset of all content as recommendations
    const allContent = await fetchContent();
    return allContent.slice(0, 3);
  }
};

// Function to search content
export const searchContent = async (query: string): Promise<ContentItem[]> => {
  try {
    const response = await api.get(RESOURCE_URL, { params: { search: query } });
    return response.data.map((content: Content) => mapContentToContentItem(content));
  } catch (error) {
    console.error(`Error searching content with query "${query}":`, error);
    
    // Fall back to client-side search
    const allContent = await fetchContent();
    return allContent.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) || 
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }
};
