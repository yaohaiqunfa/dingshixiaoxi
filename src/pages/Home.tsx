import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Globe2, Sparkles, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

const MotionLink = motion.create(Link);

export default function Home() {
  const courses = useStore((state) => state.courses);
  const featuredCourses = courses.slice(0, 3);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium tracking-wide">全新沉浸式语言学习体验</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              掌握世界语言，<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">连接无限可能</span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              支持英语、日语、韩语等主流语言。通过智能分级课程、真实场景互动和个性化追踪，让学习如游戏般轻松上瘾。
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all"
              >
                开始学习 <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
                免费语言测试
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Globe2, title: '多语种覆盖', desc: '英语、日语、韩语，随时随地切换学习目标', color: 'bg-emerald-100 text-emerald-600' },
          { icon: TrendingUp, title: '科学分级体系', desc: '从A1到C2，为你量身定制的最佳学习路径', color: 'bg-blue-100 text-blue-600' },
          { icon: BookOpen, title: '沉浸式互动', desc: '听说读写全方位练习，智能语音评分', color: 'bg-orange-100 text-orange-600' },
        ].map((feat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-xl transition-shadow"
          >
            <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center mb-6`}>
              <feat.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h3>
            <p className="text-slate-600 leading-relaxed">{feat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Popular Courses */}
      <section>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">精选课程</h2>
            <p className="text-slate-500">开启你的第一堂语言课</p>
          </div>
          <Link to="/courses" className="hidden sm:flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700">
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course, idx) => (
            <MotionLink
              key={course.id}
              to={`/courses/${course.id}`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group block bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-sm uppercase">
                    {course.language}
                  </span>
                  <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm">
                    {course.level}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    {course.modules.length} 个模块
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </MotionLink>
          ))}
        </div>
      </section>
    </div>
  );
}
