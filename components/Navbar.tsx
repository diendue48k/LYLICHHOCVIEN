
import React from 'react';
import { UserRole } from '../types';
import { LOGO_URL } from '../constants';
import { LogOut, User, Bell, Search, Menu } from 'lucide-react';

interface NavbarProps {
  user: { role: UserRole; id: string };
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[60] px-4 lg:px-0">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3 group">
              <div className="bg-white p-1 rounded-xl shadow-sm transition-transform group-hover:scale-105 border border-slate-100">
                <img src={LOGO_URL} alt="DUE Logo" className="h-10 lg:h-12 w-auto" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-due-blue font-black text-lg lg:text-xl leading-tight uppercase tracking-tight">
                  Hệ thống Lý lịch
                </h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Đại học Kinh tế - ĐHĐN</p>
              </div>
            </a>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:border-due-blue/30 focus-within:bg-white transition-all">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none focus:ring-0 text-xs font-medium w-48" />
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-100 mx-2"></div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button className="p-3 text-slate-400 hover:text-due-blue hover:bg-due-light rounded-2xl transition-all relative group">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-due-orange rounded-full border-2 border-white ring-2 ring-transparent group-hover:ring-due-light"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-slate-100">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-black text-slate-800 leading-none mb-1">
                    {user.role === UserRole.ADMIN ? 'QUẢN TRỊ VIÊN' : user.id}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-due-blue text-white shadow-sm">
                    {user.role}
                  </span >
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-due-blue to-due-dark flex items-center justify-center text-white font-black shadow-due group cursor-pointer hover:rotate-6 transition-transform">
                  {user.role === UserRole.ADMIN ? <User size={20} /> : user.id.slice(-2)}
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="p-3 text-slate-400 hover:text-due-red hover:bg-red-50 rounded-2xl transition-all"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
