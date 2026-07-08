
import React, { useState } from 'react';
import { SystemConfig, FieldConfig } from '../../types';
import { Calendar, ToggleLeft, ToggleRight, Info, Layout, Printer, Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronUp, MapPin, Radio, Wifi, FileCog } from 'lucide-react';
import { api } from '../../services/googleSheets';

interface SystemSettingsProps {
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ config, setConfig }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('personal');
  const [configTypeFilter, setConfigTypeFilter] = useState<'BOTH' | 'CAO_HOC' | 'NCS'>('BOTH');
  const [isTesting, setIsTesting] = useState(false);

  const handleToggleSystem = () => setConfig({ ...config, isOpen: !config.isOpen });

  const updateField = (fieldId: string, updates: Partial<FieldConfig>) => {
    const newConfigs = config.fieldConfigs.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    setConfig({ ...config, fieldConfigs: newConfigs });
  };

  const updatePrintSetting = (key: string, value: string) => {
    setConfig({
      ...config,
      printSettings: { ...config.printSettings, [key]: value }
    });
  };

  const updateExportSetting = (key: string, value: any) => {
    setConfig({
      ...config,
      exportSettings: { ...config.exportSettings, [key]: value }
    });
  };
  
  const handleTestConnection = async () => {
      setIsTesting(true);
      try {
          const res = await api.checkConnection();
          if (res.success) {
              alert("✅ KẾT NỐI THÀNH CÔNG!\n\nScript đang hoạt động bình thường.");
          } else {
              alert(`❌ KẾT NỐI THẤT BẠI\n\nLỗi: ${res.message || 'Không thể kết nối'}\n\nKiểm tra:\n1. URL có đuôi /exec không?\n2. Script đã Deploy quyền 'Anyone' chưa?`);
          }
      } catch (e) {
          alert("❌ Lỗi mạng hoặc URL không hợp lệ.");
      } finally {
          setIsTesting(false);
      }
  };

  const sections = [
    { id: 'personal', label: 'I. Thông tin cá nhân' },
    { id: 'contact', label: 'II. Địa chỉ & Liên hệ' },
    { id: 'education', label: 'III-IV. Bằng cấp trúng tuyển' },
    { id: 'work', label: 'V-VII. Công tác & Nghiên cứu' },
    { id: 'family', label: 'VIII-IX. Gia đình & Cam đoan' },
    { id: 'attachments', label: 'Tệp đính kèm' },
  ];

  return (
    <div className="max-w-5xl space-y-10">
      {/* 1. Hệ thống & Thời gian */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-due-blue" size={24} />
            <h4 className="font-black text-slate-800 uppercase tracking-tight">1. Trạng thái & Thời hạn</h4>
          </div>
          <button 
            onClick={handleToggleSystem}
            className={`flex items-center gap-2 transition-all ${config.isOpen ? 'text-due-blue' : 'text-slate-400'}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest">{config.isOpen ? 'Đang mở' : 'Đang đóng'}</span>
            {config.isOpen ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
          </button>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Thời gian mở cổng</label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  className="p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-slate-700"
                  value={config.openDate}
                  onChange={(e) => setConfig({...config, openDate: e.target.value})}
                />
                <input 
                  type="date" 
                  className="p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-slate-700"
                  value={config.closeDate}
                  onChange={(e) => setConfig({...config, closeDate: e.target.value})}
                />
              </div>
              <button 
                  onClick={handleTestConnection} 
                  disabled={isTesting}
                  className="mt-2 flex items-center gap-2 text-xs font-bold text-due-blue hover:underline disabled:opacity-50"
              >
                  <Wifi size={14} /> {isTesting ? 'Đang kiểm tra...' : 'Kiểm tra kết nối Server'}
              </button>
           </div>
           <div className="bg-blue-50 p-6 rounded-2xl flex gap-4 border border-blue-100">
             <Info className="text-due-blue shrink-0" size={24} />
             <p className="text-xs text-blue-800 leading-relaxed font-medium">
               Khi cổng đóng, Học viên chỉ có thể <strong>xem và in phiếu</strong>. 
             </p>
           </div>
        </div>
      </section>

      {/* 2. Cấu hình Địa chỉ */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
            <MapPin className="text-due-blue" size={24} />
            <h4 className="font-black text-slate-800 uppercase tracking-tight">2. Cấu hình Nhập liệu Địa chỉ</h4>
         </div>
         <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Chế độ hiển thị cho Học viên</label>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setConfig({ ...config, addressMode: '3_LEVELS' })}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${config.addressMode === '3_LEVELS' ? 'border-due-blue bg-blue-50 ring-1 ring-due-blue' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                            <div className="flex-grow">
                                <span className={`block font-bold text-sm ${config.addressMode === '3_LEVELS' ? 'text-due-blue' : 'text-slate-700'}`}>Chỉ dùng Hệ thống 3 Cấp (Cũ)</span>
                                <span className="text-[10px] text-slate-500">{"Tỉnh -> Huyện -> Xã. Sử dụng dữ liệu từ import danh sách cũ."}</span>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.addressMode === '3_LEVELS' ? 'border-due-blue' : 'border-slate-300'}`}>
                                {config.addressMode === '3_LEVELS' && <div className="w-2.5 h-2.5 bg-due-blue rounded-full" />}
                            </div>
                        </button>
                        
                        <button
                            onClick={() => setConfig({ ...config, addressMode: '2_LEVELS' })}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${config.addressMode === '2_LEVELS' ? 'border-due-blue bg-blue-50 ring-1 ring-due-blue' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                            <div className="flex-grow">
                                <span className={`block font-bold text-sm ${config.addressMode === '2_LEVELS' ? 'text-due-blue' : 'text-slate-700'}`}>Chỉ dùng Hệ thống 2 Cấp (Mới)</span>
                                <span className="text-[10px] text-slate-500">{"Tỉnh -> Xã/Phường. (Bỏ qua Quận/Huyện). Dữ liệu import mới."}</span>
                            </div>
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.addressMode === '2_LEVELS' ? 'border-due-blue' : 'border-slate-300'}`}>
                                {config.addressMode === '2_LEVELS' && <div className="w-2.5 h-2.5 bg-due-blue rounded-full" />}
                            </div>
                        </button>
                        
                        <button
                            onClick={() => setConfig({ ...config, addressMode: 'BOTH' })}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all text-left ${config.addressMode === 'BOTH' ? 'border-due-blue bg-blue-50 ring-1 ring-due-blue' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                        >
                             <div className="flex-grow">
                                <span className={`block font-bold text-sm ${config.addressMode === 'BOTH' ? 'text-due-blue' : 'text-slate-700'}`}>Cho phép chọn Cả 2</span>
                                <span className="text-[10px] text-slate-500">Học viên tự chọn hệ thống phù hợp với địa chỉ của mình trên Form.</span>
                            </div>
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.addressMode === 'BOTH' ? 'border-due-blue' : 'border-slate-300'}`}>
                                {config.addressMode === 'BOTH' && <div className="w-2.5 h-2.5 bg-due-blue rounded-full" />}
                            </div>
                        </button>
                    </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-2xl flex gap-4 border border-amber-100">
                    <Info className="text-amber-500 shrink-0" size={24} />
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                       <strong>Lưu ý quan trọng:</strong> Bạn cần Import đủ 2 file Excel dữ liệu (một cho hệ 3 cấp, một cho hệ 2 cấp) nếu chọn chế độ "Cho phép chọn Cả 2".
                    </p>
                </div>
            </div>
         </div>
      </section>

      {/* 3. Cấu hình chi tiết Phiếu thông tin */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Layout className="text-due-blue" size={24} />
            <h4 className="font-black text-slate-800 uppercase tracking-tight">3. Cấu hình Sơ đồ trường dữ liệu</h4>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
             {(['BOTH', 'CAO_HOC', 'NCS'] as const).map(type => (
               <button
                 key={type}
                 onClick={() => setConfigTypeFilter(type)}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                   configTypeFilter === type ? 'bg-white text-due-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {type === 'BOTH' ? 'Chung' : type === 'CAO_HOC' ? 'Cao học' : 'Nghiên cứu sinh'}
               </button>
             ))}
          </div>
        </div>
        
        <div className="p-0">
          {sections.map(section => (
            <div key={section.id} className="border-b border-slate-50 last:border-0">
              <button 
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full flex justify-between items-center p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-700 uppercase tracking-wide">{section.label}</span>
                   <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-400">
                     {config.fieldConfigs.filter(f => f.section === section.id && (f.appliesTo === configTypeFilter || f.appliesTo === 'BOTH')).length} trường
                   </span>
                </div>
                {expandedSection === section.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedSection === section.id && (
                <div className="p-6 bg-slate-50/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.fieldConfigs
                    .filter(f => f.section === section.id && (f.appliesTo === configTypeFilter || f.appliesTo === 'BOTH'))
                    .map(field => (
                    <div key={field.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700 truncate pr-2" title={field.label}>{field.label}</span>
                        <div className="flex gap-2">
                           <button 
                             onClick={() => updateField(field.id, { isVisible: !field.isVisible })}
                             className={`p-1.5 rounded-lg transition-colors ${field.isVisible ? 'bg-due-light text-due-blue' : 'bg-slate-100 text-slate-400'}`}
                             title="Bật/Tắt hiển thị"
                           >
                             {field.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                           </button>
                           <button 
                             onClick={() => updateField(field.id, { isRequired: !field.isRequired })}
                             className={`p-1.5 rounded-lg transition-colors ${field.isRequired ? 'bg-red-50 text-due-red' : 'bg-slate-100 text-slate-400'}`}
                             title="Bắt buộc/Tùy chọn"
                           >
                             {field.isRequired ? <Lock size={16} /> : <Unlock size={16} />}
                           </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <span className={field.isVisible ? "text-green-600" : "text-slate-400"}>{field.isVisible ? "Hiển thị" : "Ẩn"}</span>
                          <span className="text-slate-200">|</span>
                          <span className={field.isRequired ? "text-due-red" : "text-slate-400"}>{field.isRequired ? "Bắt buộc" : "Tùy chọn"}</span>
                        </div>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                          field.appliesTo === 'BOTH' ? 'bg-slate-50 text-slate-400 border-slate-200' : 
                          field.appliesTo === 'NCS' ? 'bg-red-50 text-due-red border-red-100' : 'bg-blue-50 text-due-blue border-blue-100'
                        }`}>
                          {field.appliesTo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Cấu hình Bản in (Text) */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <Printer className="text-due-blue" size={24} />
          <h4 className="font-black text-slate-800 uppercase tracking-tight">4. Nội dung Tiêu đề Bản in</h4>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Cấp chủ quản (Dòng 1)</label>
              <input 
                type="text" 
                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold"
                value={config.printSettings.schoolHeader}
                onChange={(e) => updatePrintSetting('schoolHeader', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Tên Đơn vị (Dòng 2)</label>
              <input 
                type="text" 
                className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold"
                value={config.printSettings.subHeader}
                onChange={(e) => updatePrintSetting('subHeader', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Cấu hình Xuất File & Format (NEW) */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
          <FileCog className="text-due-blue" size={24} />
          <h4 className="font-black text-slate-800 uppercase tracking-tight">5. Định dạng File Tải xuống & Preview</h4>
        </div>
        <div className="p-8 space-y-8">
          
          {/* Font & Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
               <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Phông chữ & Cỡ chữ chuẩn</label>
               <div className="flex gap-4">
                  <div className="flex-1 space-y-1.5">
                     <label className="text-[10px] text-slate-400 font-bold">Font Family</label>
                     <select 
                       className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm bg-white"
                       value={config.exportSettings?.fontFamily || 'Times New Roman'}
                       onChange={(e) => updateExportSetting('fontFamily', e.target.value)}
                     >
                       <option value="Times New Roman">Times New Roman</option>
                       <option value="Arial">Arial</option>
                       <option value="Calibri">Calibri</option>
                     </select>
                  </div>
                  <div className="w-32 space-y-1.5">
                     <label className="text-[10px] text-slate-400 font-bold">Cỡ chữ (pt)</label>
                     <input 
                       type="number" 
                       className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm text-center"
                       value={config.exportSettings?.baseFontSize || 13}
                       onChange={(e) => updateExportSetting('baseFontSize', Number(e.target.value))}
                     />
                  </div>
               </div>
             </div>
             
             <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 h-full flex flex-col justify-center">
                   <p className="text-xs text-blue-800 font-medium mb-1">💡 <strong>Lưu ý:</strong></p>
                   <p className="text-[11px] text-blue-700">Các thay đổi tại đây sẽ áp dụng đồng thời cho file Word (.docx) tải xuống và màn hình Xem trước (PDF).</p>
                </div>
             </div>
          </div>

          {/* Margins */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
             <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Căn lề trang (Đơn vị: mm)</label>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-bold">Lề TRÊN (Top)</label>
                   <input 
                     type="number" 
                     className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm text-center"
                     value={config.exportSettings?.marginTop || 20}
                     onChange={(e) => updateExportSetting('marginTop', Number(e.target.value))}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-bold">Lề DƯỚI (Bottom)</label>
                   <input 
                     type="number" 
                     className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm text-center"
                     value={config.exportSettings?.marginBottom || 20}
                     onChange={(e) => updateExportSetting('marginBottom', Number(e.target.value))}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-bold">Lề TRÁI (Left)</label>
                   <input 
                     type="number" 
                     className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm text-center"
                     value={config.exportSettings?.marginLeft || 30}
                     onChange={(e) => updateExportSetting('marginLeft', Number(e.target.value))}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-slate-400 font-bold">Lề PHẢI (Right)</label>
                   <input 
                     type="number" 
                     className="w-full p-3 border-2 border-slate-100 rounded-xl focus:border-due-blue outline-none font-bold text-sm text-center"
                     value={config.exportSettings?.marginRight || 15}
                     onChange={(e) => updateExportSetting('marginRight', Number(e.target.value))}
                   />
                </div>
             </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default SystemSettings;
