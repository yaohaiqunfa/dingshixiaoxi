import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Compass, LayoutDashboard, MessageSquare, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Layout() {
  const location = useLocation();
  const user = useStore((state) => state.user);

  const navigation = [
    { name: '首页', href: '/', icon: Compass },
    { name: '课程体系', href: '/courses', icon: BookOpen },
    { name: '学习看板', href: '/dashboard', icon: LayoutDashboard },
    { name: '交流社区', href: '/community', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
                <Globe className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                LingoFlow
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="flex items-center gap-3 group">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                    <div className="text-xs text-orange-500 font-medium">🔥 {user.learningStreak}天连击</div>
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm group-hover:shadow-md transition-all ring-2 ring-blue-100"
                  />
                </Link>
              ) : (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-colors">
                  登录 / 注册
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Globe className="w-5 h-5" />
            <span className="font-semibold">LingoFlow</span>
            <span className="text-sm">© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">关于我们</a>
            <a href="#" className="hover:text-blue-600 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-blue-600 transition-colors">服务条款</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
