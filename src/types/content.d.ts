
export interface Content {
  _id: string;
  id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'exercise' | 'audio';
  category: string[];
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  thumbnailUrl?: string;
  contentUrl?: string;
  contentBody?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserContent {
  _id: string;
  userId: string;
  contentId: Content;
  progress: number;
  isBookmarked: boolean;
  lastAccessed: string;
  completedAt?: string;
  notes?: string;
}

export interface ContentFilters {
  type?: string;
  category?: string;
  difficulty?: string;
  search?: string;
}
