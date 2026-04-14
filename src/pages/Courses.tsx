import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Play, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Courses() {
  const courses = useStore((state) => state.courses);
  const [activeLang, setActiveLang] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const languages = [
    { id: 'all', name: '全部语言' },
    { id: 'en', name: '英语 (English)' },
    { id: 'ja', name: '日语 (日本語)' },
    { id: 'ko', name: '韩语 (한국어)' },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchLang = activeLang === 'all' || course.language === activeLang;
    const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLang && matchSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">课程体系</h1>
          <p className="text-slate-500">选择适合你的难度，开启语言进阶之旅</p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索课程..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
            <Filter className="w-5 h-5" />
            筛选
          </button>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {languages.map((lang) => (
          <button
            key={lang.id}
            onClick={() => setActiveLang(lang.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
              activeLang === lang.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase">
                  {course.language}
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">
                  {course.level}
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">{course.title}</h3>
            <p className="text-slate-600 text-sm mb-6 flex-1">{course.description}</p>
            
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-full bg-slate-100 rounded-full h-2 min-w-[80px]">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${course.totalProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-slate-500">{course.totalProgress}%</span>
              </div>
              
              <Link
                to={`/courses/${course.id}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 学习
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>没有找到匹配的课程</p>
        </div>
      )}
    </div>
  );
}
