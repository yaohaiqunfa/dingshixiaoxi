import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Course, Post, Achievement } from '../types';

interface AppState {
  user: User | null;
  courses: Course[];
  posts: Post[];
  achievements: Achievement[];
  login: (user: User) => void;
  logout: () => void;
  completeModule: (courseId: string, moduleId: string, score: number) => void;
  likePost: (postId: string) => void;
}

const mockCourses: Course[] = [
  {
    id: 'c1',
    language: 'en',
    level: 'A1',
    title: '基础英语：日常生活',
    description: '掌握英语基础词汇和问候语，开始你的英语之旅。',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1600',
    totalProgress: 25,
    modules: [
      { id: 'm1', type: 'vocabulary', title: '日常问候与自我介绍', isCompleted: true, score: 95 },
      { id: 'm2', type: 'listening', title: '听力：餐厅点餐', isCompleted: false },
      { id: 'm3', type: 'speaking', title: '口语跟读：机场问路', isCompleted: false },
      { id: 'm4', type: 'grammar', title: '基础时态：一般现在时', isCompleted: false },
    ],
  },
  {
    id: 'c2',
    language: 'ja',
    level: 'A2',
    title: '进阶日语：职场沟通',
    description: '学习日本职场礼仪及常用商务敬语。',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1600',
    totalProgress: 0,
    modules: [
      { id: 'm5', type: 'vocabulary', title: '商务词汇基础', isCompleted: false },
      { id: 'm6', type: 'speaking', title: '口语：交换名片', isCompleted: false },
    ],
  },
  {
    id: 'c3',
    language: 'ko',
    level: 'B1',
    title: '韩语中级：流行文化',
    description: '通过韩剧和K-pop歌词学习地道韩语表达。',
    thumbnail: 'https://images.unsplash.com/photo-1580226065538-4e12271ec0fb?auto=format&fit=crop&q=80&w=1600',
    totalProgress: 50,
    modules: [
      { id: 'm7', type: 'listening', title: '听懂无字幕韩剧片段', isCompleted: true, score: 88 },
      { id: 'm8', type: 'grammar', title: '高级敬语与口语缩略', isCompleted: false },
    ],
  },
];

const mockPosts: Post[] = [
  {
    id: 'p1',
    authorName: 'Alex',
    authorAvatar: 'https://i.pravatar.cc/150?u=alex',
    languageTag: 'English',
    content: '今天终于搞懂了虚拟语气的用法！如果我早点知道就好了(If I had known earlier...) 😄',
    likes: 24,
    comments: 5,
    createdAt: '2小时前',
  },
  {
    id: 'p2',
    authorName: 'Yuki',
    authorAvatar: 'https://i.pravatar.cc/150?u=yuki',
    languageTag: 'Japanese',
    content: '商务敬语真的好难啊，有没有大佬分享一下记忆技巧？',
    likes: 12,
    comments: 8,
    createdAt: '5小时前',
  },
];

const mockAchievements: Achievement[] = [
  { id: 'a1', title: '初来乍到', description: '完成第一节课程', icon: '🌟', isUnlocked: true },
  { id: 'a2', title: '连击达人', description: '连续学习7天', icon: '🔥', isUnlocked: false },
  { id: 'a3', title: '词汇大师', description: '掌握1000个新词', icon: '📚', isUnlocked: false },
  { id: 'a4', title: '金嗓子', description: '口语模块获得5次满分', icon: '🎤', isUnlocked: false },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: {
        id: 'u1',
        name: '学习者_01',
        avatar: 'https://i.pravatar.cc/150?u=u1',
        targetLanguage: 'en',
        level: 'A2',
        learningStreak: 3,
      },
      courses: mockCourses,
      posts: mockPosts,
      achievements: mockAchievements,
      
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      
      completeModule: (courseId, moduleId, score) =>
        set((state) => {
          const updatedCourses = state.courses.map((course) => {
            if (course.id === courseId) {
              const updatedModules = course.modules.map((m) =>
                m.id === moduleId ? { ...m, isCompleted: true, score } : m
              );
              const completedCount = updatedModules.filter((m) => m.isCompleted).length;
              const totalProgress = Math.round((completedCount / updatedModules.length) * 100);
              return { ...course, modules: updatedModules, totalProgress };
            }
            return course;
          });
          return { courses: updatedCourses };
        }),
        
      likePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          ),
        })),
    }),
    {
      name: 'lingo-storage',
    }
  )
);
