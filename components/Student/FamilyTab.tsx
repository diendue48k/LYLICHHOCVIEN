
import React from 'react';
import { EDUCATION_LEVELS } from '../../constants';
import { SystemConfig } from '../../types';
import { User, Phone, Briefcase, MapPin, GraduationCap, Calendar } from 'lucide-react';

interface FamilyTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  // Added config and errors properties to match StudentForm usage
  config: SystemConfig;
  errors: string[];
}

// Destructured config and errors to satisfy prop checking
const FamilyTab: React.FC<FamilyTabProps> = ({ data, onChange, isReadOnly, config, errors }) => {
  const handleMemberUpdate = (member: 'father' | 'mother' | 'spouse', field: string, value: any) => {
    const current = data[member] || {};
    onChange(member, { ...current, [field]: value });
  };

  const renderMemberForm = (title: string, member: 'father' | 'mother' | 'spouse', iconColor: string) => {
    const info = data[member] || {};
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full ${iconColor}`}></div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${iconColor}`}>
            <User size={16} />
          </div>
          <div>
            <h4 className="font-bold text-slate-700 uppercase text-xs">Thông tin {title}</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-5">
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-slate-400" /> Họ và tên
            </label>
            <input 
              type="text" 
              placeholder="Nhập họ và tên viết hoa..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700 uppercase" 
              value={info.fullName || ''} 
              onChange={(e) => handleMemberUpdate(member, 'fullName', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-400" /> Năm sinh
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700" 
              placeholder="Ví dụ: 1970" 
              value={info.birthDate || ''} 
              onChange={(e) => handleMemberUpdate(member, 'birthDate', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={12} className="text-slate-400" /> Số điện thoại
            </label>
            <input 
              type="tel" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700" 
              value={info.phone || ''} 
              onChange={(e) => handleMemberUpdate(member, 'phone', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase size={12} className="text-slate-400" /> Nghề nghiệp
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700" 
              value={info.job || ''} 
              onChange={(e) => handleMemberUpdate(member, 'job', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>

          <div className="space-y-1 col-span-full">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" /> Địa chỉ thường trú
            </label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700" 
              value={info.address || ''} 
              onChange={(e) => handleMemberUpdate(member, 'address', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>

          <div className="space-y-2 col-span-full pt-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap size={12} className="text-slate-400" /> Trình độ học vấn
            </label>
            <div className="flex flex-wrap gap-2">
              {EDUCATION_LEVELS.map(level => (
                <label 
                  key={level} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                    info.educationLevel === level 
                      ? 'bg-due-blue/10 border-due-blue text-due-blue font-semibold' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`${member}_edu`} 
                    value={level} 
                    checked={info.educationLevel === level} 
                    onChange={(e) => handleMemberUpdate(member, 'educationLevel', e.target.value)}
                    disabled={isReadOnly}
                    className="hidden"
                  />
                  <span className="text-[11px] font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
           <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">VIII. Khen thưởng, Kỷ luật</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Khen thưởng (Thành tích cao nhất)</label>
            <textarea 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none transition-all text-sm font-medium text-slate-700 resize-none" 
              placeholder="Nhập các khen thưởng đã đạt được..."
              value={data.rewards || ''} 
              onChange={(e) => onChange('rewards', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-due-red uppercase tracking-wider">Kỷ luật (Khai rõ nếu có)</label>
            <textarea 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all text-sm font-medium text-slate-700 resize-none" 
              placeholder="Nếu không có hãy ghi 'Không'..."
              value={data.discipline || ''} 
              onChange={(e) => onChange('discipline', e.target.value)} 
              disabled={isReadOnly} 
            />
          </div>
        </div>
      </div>

      {/* Thành phần gia đình */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
           <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">IX. Thành phần gia đình</h4>
        </div>
        <div className="space-y-4">
          {renderMemberForm('CHA', 'father', 'bg-due-blue')}
          {renderMemberForm('MẸ', 'mother', 'bg-pink-500')}
          {renderMemberForm('VỢ / CHỒNG', 'spouse', 'bg-emerald-500')}
        </div>
      </div>

      {/* Lời cam đoan */}
      <div className="relative pt-10">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-100 px-6 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Xác nhận & Cam đoan</span>
        </div>
      </div>

      <label className={`group block p-5 rounded-xl border transition-all cursor-pointer ${
        data.isCommitted ? 'bg-due-blue/5 border-due-blue' : 'bg-slate-50 border-slate-200 hover:border-due-blue/30'
      }`}>
        <div className="flex gap-4 items-start">
          <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            data.isCommitted ? 'bg-due-blue border-due-blue' : 'bg-white border-slate-300'
          }`}>
            {data.isCommitted && <div className="w-2 h-2 bg-white rounded-sm"></div>}
          </div>
          <div className="space-y-1">
            <p className={`text-sm font-bold uppercase tracking-wide ${data.isCommitted ? 'text-due-blue' : 'text-slate-700'}`}>
              Tôi xin cam đoan
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              "Tôi xin cam đoan những lời khai trên là hoàn toàn đúng sự thật. Tôi xin chịu mọi trách nhiệm trước Pháp luật và Nhà trường nếu kê khai không trung thực, chính xác."
            </p>
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={data.isCommitted} 
            onChange={(e) => onChange('isCommitted', e.target.checked)} 
            disabled={isReadOnly} 
          />
        </div>
      </label>
    </div>
  );
};

export default FamilyTab;
