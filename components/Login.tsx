
import React, { useState } from 'react';
import { UserRole } from '../types';
import { LOGO_URL } from '../constants';
import { User as UserIcon, ArrowRight, ShieldCheck, Sparkles, GraduationCap, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (id: string, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;
    onLogin(id, isAdmin ? UserRole.ADMIN : UserRole.STUDENT);
  };

  return (
    <div className="min-h-screen flex items-center justify-start relative overflow-hidden font-sans">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}bg-due.jpg)` }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[400px] ml-4 md:ml-[10%] px-4">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden animate-in fade-in zoom-in duration-500">
            
            {/* 3 Color Lines - Top Border (Matches D-U-E Colors: Orange - Green - Blue) */}
            <div className="flex h-2 w-full absolute top-0 left-0 z-20">
                <div className="flex-1 bg-due-orange"></div>
                <div className="flex-1 bg-due-green"></div>
                <div className="flex-1 bg-due-blue"></div>
            </div>

            <div className="p-6 md:p-8">
                {/* Header Section */}
                <div className="text-center mb-6">
                    {/* Significantly Enlarged Logo */}
                    <div className="flex justify-center mb-4">
                        <img 
                            src={LOGO_URL} 
                            alt="DUE Logo" 
                            className="h-24 md:h-28 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500" 
                        />
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-due-blue text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-100">
                        <Sparkles size={12} />
                        <span>Cổng Thông Tin SĐH</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        Quản Lý Lý Lịch
                    </h2>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Học viên Cao học & Nghiên cứu sinh</p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Role Switcher */}
                    <div className="p-1.5 bg-slate-100 rounded-2xl flex relative">
                        <div 
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out border border-slate-200 ${isAdmin ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}
                        ></div>
                        
                        <button
                            type="button"
                            onClick={() => setIsAdmin(false)}
                            className={`flex-1 relative z-10 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 rounded-xl ${!isAdmin ? 'text-due-blue' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <GraduationCap size={16} className="mb-0.5" /> Học viên
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsAdmin(true)}
                            className={`flex-1 relative z-10 py-2.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 rounded-xl ${isAdmin ? 'text-due-orange' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <ShieldCheck size={16} className="mb-0.5" /> Quản trị
                        </button>
                    </div>

                    {/* Input Field */}
                    <div className="space-y-2">
                        <div className={`relative transition-all duration-300 group ${isFocused ? 'scale-[1.02]' : ''}`}>
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <UserIcon className={`transition-colors duration-300 ${isFocused ? 'text-due-blue' : 'text-slate-300'}`} size={20} />
                            </div>
                            <input
                                type="text"
                                value={id}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                onChange={(e) => setId(e.target.value)}
                                className={`block w-full pl-12 pr-5 py-3.5 bg-slate-100/80 border-2 rounded-2xl outline-none font-bold text-slate-800 placeholder:text-slate-500 placeholder:font-medium transition-all text-sm ${isFocused ? 'border-due-blue bg-white shadow-lg shadow-due-blue/10' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100'}`}
                                placeholder={isAdmin ? "Nhập mã quản trị..." : "Nhập Mã HV hoặc CCCD..."}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-due-blue to-[#003d7a] hover:from-due-orange hover:to-[#d9400b] text-white font-black py-4 rounded-2xl shadow-xl shadow-due-blue/20 hover:shadow-due-orange/30 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] group"
                    >
                        Truy cập hệ thống
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                {/* Footer Text */}
                <div className="mt-6 pt-5 border-t border-slate-200/50 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                        <Building2 size={10} />
                        <span>Trường Đại học Kinh tế - ĐHĐN</span>
                    </div>
                    <p className="text-[9px] text-slate-400">Hỗ trợ kỹ thuật: (0236) 3950110</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
