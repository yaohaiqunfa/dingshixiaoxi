import { useState } from 'react';
import { MessageSquare, Heart, Share2, Send, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

export default function Community() {
  const { posts, likePost, user } = useStore();
  const [newPost, setNewPost] = useState('');
  const [activeLang, setActiveLang] = useState('all');

  const languages = ['all', 'English', 'Japanese', 'Korean'];

  const filteredPosts = activeLang === 'all' 
    ? posts 
    : posts.filter(p => p.languageTag === activeLang);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    // In a real app, this would dispatch to store
    alert('发帖功能正在开发中！');
    setNewPost('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">语言交流角</h1>
          <p className="text-indigo-100 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
            与全球学习者分享你的学习心得、疑问和语言文化。在这里，每一次发声都值得被听见。
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Feed */}
        <div className="flex-1 space-y-6">
          {/* Post Composer */}
          {user && (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md focus-within:shadow-md focus-within:border-blue-200">
              <form onSubmit={handlePost}>
                <div className="flex gap-4">
                  <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="分享你的语言学习日常..."
                      className="w-full bg-slate-50 border-transparent rounded-2xl p-4 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all placeholder-slate-400 font-medium text-slate-700"
                      rows={3}
                    />
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button type="button" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <Globe className="w-5 h-5" />
                        </button>
                      </div>
                      <button 
                        type="submit"
                        disabled={!newPost.trim()}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        <Send className="w-4 h-4" /> 发布
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-12 h-12 rounded-full border-2 border-slate-50" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{post.authorName}</h3>
                      <p className="text-sm text-slate-500 font-medium">{post.createdAt}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                    {post.languageTag}
                  </span>
                </div>
                
                <p className="text-slate-700 mb-6 leading-relaxed text-lg font-medium">{post.content}</p>
                
                <div className="flex items-center gap-6 border-t border-slate-100 pt-4">
                  <button 
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-2 text-slate-500 hover:text-red-500 font-semibold transition-colors group"
                  >
                    <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                      <Heart className={`w-5 h-5 ${post.likes > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                    </div>
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors group">
                    <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    {post.comments}
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-green-600 font-semibold transition-colors group ml-auto">
                    <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:w-80 space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <h3 className="font-extrabold text-slate-900 mb-4 text-lg">热门语种圈</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all ${
                    activeLang === lang
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {lang === 'all' ? '全部动态' : `# ${lang}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-[2rem] p-6 text-white shadow-lg">
            <h3 className="font-extrabold mb-2 text-lg">🔥 本周挑战</h3>
            <p className="text-orange-50 font-medium mb-4 leading-relaxed">
              连续5天在社区使用目标语言发帖，即可解锁【社交达人】专属成就！
            </p>
            <button className="w-full py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-sm">
              立即参与
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
