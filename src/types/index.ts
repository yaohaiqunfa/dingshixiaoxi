export interface User {
  id: string;
  name: string;
  avatar: string;
  targetLanguage: string;
  level: string;
  learningStreak: number;
}

export interface LearningModule {
  id: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  title: string;
  isCompleted: boolean;
  score?: number;
}

export interface Course {
  id: string;
  language: string;
  level: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: LearningModule[];
  totalProgress: number;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  languageTag: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}
