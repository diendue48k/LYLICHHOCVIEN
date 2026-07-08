
import React from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { StudentType, SystemConfig } from '../../types';
import { LEARNING_TYPES } from '../../constants';

interface EducationTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  config: SystemConfig;
  errors: string[];
}

const EducationTab: React.FC<EducationTabProps> = ({ data, onChange, isReadOnly, config, errors }) => {
  const handleDegreeUpdate = (type: 'uniDegree' | 'masterDegree', field: string, value: any) => {
    const current = data[type] || {};
    onChange(type, { ...current, [field]: value });
  };

  const addHistoryRow = () => {
    const newHistory = [...(data.educationHistory || []), { id: Date.now().toString(), timeRange: '', schoolName: '', major: '', learningType: '', degree: '' }];
    onChange('educationHistory', newHistory);
  };

  const removeHistoryRow = (id: string) => {
    const newHistory = data.educationHistory.filter((h: any) => h.id !== id);
    onChange('educationHistory', newHistory);
  };

  const renderDegreeForm = (title: string, type: 'uniDegree' | 'masterDegree') => {
    const degree = data[type] || {};
    return (
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
        <h4 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} />
            {title}
          </div>
          {type === 'uniDegree' && (
            <label className="flex items-center gap-2 font-bold text-[10px] text-slate-400 cursor-pointer uppercase tracking-widest">
              <input 
                type="checkbox" 
                checked={degree.isTransfer} 
                onChange={(e) => handleDegreeUpdate(type, 'isTransfer', e.target.checked)}
                disabled={isReadOnly}
                className="w-4 h-4 rounded border-slate-300 text-due-blue focus:ring-due-blue"
              />
              Hệ Liên thông (Có/Không)
            </label>
          )}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trường cấp bằng</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.school || ''} onChange={(e) => handleDegreeUpdate(type, 'school', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hệ đào tạo</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.system || ''} onChange={(e) => handleDegreeUpdate(type, 'system', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số hiệu bằng</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.degreeNumber || ''} onChange={(e) => handleDegreeUpdate(type, 'degreeNumber', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số vào sổ cấp bằng</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.bookNumber || ''} onChange={(e) => handleDegreeUpdate(type, 'bookNumber', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngày ký bằng</label>
            <input type="date" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.signDate || ''} onChange={(e) => handleDegreeUpdate(type, 'signDate', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Năm tốt nghiệp</label>
            <input type="number" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.gradYear || ''} onChange={(e) => handleDegreeUpdate(type, 'gradYear', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ngành</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.major || ''} onChange={(e) => handleDegreeUpdate(type, 'major', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chuyên ngành</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.specialization || ''} onChange={(e) => handleDegreeUpdate(type, 'specialization', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="space-y-1.5 col-span-full">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Học hàm - Học vị / Họ tên người ký bằng</label>
            <input type="text" className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-due-blue focus:bg-white outline-none font-bold text-slate-700 transition-all shadow-sm" value={degree.signer || ''} onChange={(e) => handleDegreeUpdate(type, 'signer', e.target.value)} disabled={isReadOnly} placeholder="Vd: PGS.TS Nguyễn Văn A" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {renderDegreeForm(`III. Thông tin bằng tốt nghiệp ${data.studentType === StudentType.CAO_HOC ? '(Đại học)' : 'Đại học'}`, 'uniDegree')}
      
      {data.studentType === StudentType.NCS && renderDegreeForm('IV. Thông tin bằng tốt nghiệp Thạc sĩ', 'masterDegree')}

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 px-2">
          <div>
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">{data.studentType === StudentType.NCS ? 'V' : 'IV'}. Quá trình đào tạo (Từ hệ cao đẳng trở lên)</h4>
          </div>
          {!isReadOnly && (
            <button 
              type="button" 
              onClick={addHistoryRow}
              className="flex items-center gap-2 px-6 py-2.5 bg-due-blue text-white rounded-2xl font-black hover:bg-due-dark transition-all shadow-due text-[10px] uppercase tracking-widest active:scale-95"
            >
              <Plus size={16} /> Thêm dòng
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-r border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                <th className="border-b border-r border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên trường / CSĐT</th>
                <th className="border-b border-r border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngành học</th>
                <th className="border-b border-r border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hình thức ĐT</th>
                <th className="border-b border-r border-slate-100 p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Văn bằng / Chứng chỉ</th>
                {!isReadOnly && <th className="border-b border-slate-100 p-4"></th>}
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.educationHistory?.map((row: any, index: number) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="border-b border-r border-slate-50 p-2"><input className="w-full p-2 bg-transparent font-bold text-slate-700 outline-none focus:bg-white rounded-lg transition-all" placeholder="mm/yyyy - mm/yyyy" value={row.timeRange} onChange={(e) => {
                    const next = [...data.educationHistory]; next[index].timeRange = e.target.value; onChange('educationHistory', next);
                  }} disabled={isReadOnly} /></td>
                  <td className="border-b border-r border-slate-50 p-2"><input className="w-full p-2 bg-transparent font-bold text-slate-700 outline-none focus:bg-white rounded-lg transition-all" value={row.schoolName} onChange={(e) => {
                    const next = [...data.educationHistory]; next[index].schoolName = e.target.value; onChange('educationHistory', next);
                  }} disabled={isReadOnly} /></td>
                  <td className="border-b border-r border-slate-50 p-2"><input className="w-full p-2 bg-transparent font-bold text-slate-700 outline-none focus:bg-white rounded-lg transition-all" value={row.major} onChange={(e) => {
                    const next = [...data.educationHistory]; next[index].major = e.target.value; onChange('educationHistory', next);
                  }} disabled={isReadOnly} /></td>
                  <td className="border-b border-r border-slate-50 p-2">
                    <select className="w-full p-2 bg-transparent font-bold text-slate-700 outline-none focus:bg-white rounded-lg transition-all appearance-none cursor-pointer" value={row.learningType} onChange={(e) => {
                      const next = [...data.educationHistory]; next[index].learningType = e.target.value; onChange('educationHistory', next);
                    }} disabled={isReadOnly}>
                      <option value="">Chọn...</option>
                      {LEARNING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="border-b border-r border-slate-50 p-2"><input className="w-full p-2 bg-transparent font-bold text-slate-700 outline-none focus:bg-white rounded-lg transition-all" value={row.degree} onChange={(e) => {
                    const next = [...data.educationHistory]; next[index].degree = e.target.value; onChange('educationHistory', next);
                  }} disabled={isReadOnly} /></td>
                  {!isReadOnly && (
                    <td className="border-b border-slate-50 p-2 text-center">
                      <button type="button" onClick={() => removeHistoryRow(row.id)} className="p-2 text-slate-300 hover:text-due-red hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EducationTab;
