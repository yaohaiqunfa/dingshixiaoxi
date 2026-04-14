import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, PlayCircle, Lock, BookOpen, Headphones, Mic, Pencil } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = useStore((state) => state.courses.find((c) => c.id === courseId));

  if (!course) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-bold text-slate-700">未找到课程</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">返回</button>
      </div>
    );
  }

  const moduleIcons = {
    vocabulary: BookOpen,
    grammar: Pencil,
    speaking: Mic,
    listening: Headphones,
  };

  const moduleColors = {
    vocabulary: 'text-orange-500 bg-orange-50',
    grammar: 'text-purple-500 bg-purple-50',
    speaking: 'text-blue-500 bg-blue-50',
    listening: 'text-emerald-500 bg-emerald-50',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <button 
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> 返回课程列表
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-center">
        <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden relative shadow-lg">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm uppercase">
              {course.language}
            </span>
            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm">
              {course.level}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
            {course.title}
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            {course.description}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold text-slate-700">
              <span>总体学习进度</span>
              <span>{course.totalProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${course.totalProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-green-500 h-3 rounded-full shadow-inner"
              ></motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-6">学习大纲</h2>
        <div className="space-y-4">
          {course.modules.map((mod, index) => {
            const Icon = moduleIcons[mod.type];
            const colorClass = moduleColors[mod.type];
            const isLocked = index > 0 && !course.modules[index - 1].isCompleted; // Simple mock logic for locked modules
            
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-2xl border ${
                  isLocked ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-100 hover:shadow-md hover:border-blue-100 transition-all'
                } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    isLocked ? 'bg-slate-200 text-slate-400' : colorClass
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isLocked ? 'text-slate-500' : 'text-slate-900'} mb-1`}>
                      {index + 1}. {mod.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
                        {mod.type}
                      </span>
                      {mod.isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> 得分: {mod.score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {isLocked ? (
                    <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 text-slate-400 font-bold cursor-not-allowed">
                      <Lock className="w-4 h-4" /> 待解锁
                    </button>
                  ) : mod.isCompleted ? (
                    <Link
                      to={`/learn/${course.id}/${mod.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" /> 再次练习
                    </Link>
                  ) : (
                    <Link
                      to={`/learn/${course.id}/${mod.id}`}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <PlayCircle className="w-4 h-4" /> 开始学习
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
