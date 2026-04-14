import { useState } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import { Target, Zap, Trophy, Clock, BookOpen, Flame } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const { user, courses, achievements } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements'>('overview');

  if (!user) return <div className="text-center py-20">请先登录</div>;

  const radarData = [
    { subject: '词汇量', A: 80, fullMark: 100 },
    { subject: '语法', A: 65, fullMark: 100 },
    { subject: '听力', A: 90, fullMark: 100 },
    { subject: '口语', A: 75, fullMark: 100 },
    { subject: '阅读', A: 85, fullMark: 100 },
  ];

  const lineData = [
    { name: '周一', time: 30 },
    { name: '周二', time: 45 },
    { name: '周三', time: 20 },
    { name: '周四', time: 60 },
    { name: '周五', time: 90 },
    { name: '周六', time: 120 },
    { name: '周日', time: 15 },
  ];

  const statCards = [
    { title: '连续学习', value: `${user.learningStreak}天`, icon: Flame, color: 'text-orange-500 bg-orange-50' },
    { title: '总学习时长', value: '42小时', icon: Clock, color: 'text-blue-500 bg-blue-50' },
    { title: '掌握词汇', value: '850个', icon: BookOpen, color: 'text-purple-500 bg-purple-50' },
    { title: '当前目标', value: user.level, icon: Target, color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

        <div className="relative">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl ring-4 ring-blue-100 z-10 relative"
          />
          <div className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md z-20">
            <span className="text-xl">🏆</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{user.name}</h1>
          <p className="text-lg text-slate-500 font-medium mb-6">目标语言: {user.targetLanguage.toUpperCase()} | 当前等级: {user.level}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors">
              继续学习
            </button>
            <button className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors border border-slate-200">
              编辑目标
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-px">
        {['overview', 'achievements'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={clsx(
              "px-6 py-3 text-lg font-bold border-b-2 transition-colors",
              activeTab === tab 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            )}
          >
            {tab === 'overview' ? '学习概览' : '成就勋章'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' ? (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statCards.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-[450px]">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" /> 能力雷达图
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 14, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="能力值" dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.2} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Line Chart */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm h-[450px]">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-blue-500" /> 学习时长 (分钟)
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          /* Achievements */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((ach) => (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.05 }}
                className={clsx(
                  "p-8 rounded-[2rem] border-2 text-center transition-all duration-300 relative overflow-hidden",
                  ach.isUnlocked 
                    ? "bg-white border-yellow-200 shadow-[0_10px_40px_-10px_rgba(250,204,21,0.3)]" 
                    : "bg-slate-50 border-slate-100 opacity-60 grayscale"
                )}
              >
                {ach.isUnlocked && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-100 rounded-full blur-xl opacity-50"></div>
                )}
                <div className="text-6xl mb-6 drop-shadow-md">{ach.icon}</div>
                <h4 className={clsx("font-extrabold text-lg mb-2", ach.isUnlocked ? "text-slate-900" : "text-slate-500")}>
                  {ach.title}
                </h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{ach.description}</p>
                
                {!ach.isUnlocked && (
                  <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm text-xs font-bold text-slate-500">
                      未解锁
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
