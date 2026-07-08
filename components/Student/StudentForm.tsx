import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, SystemConfig, StudentType, LocationData, LocationDataTwoLevel } from '../../types';
import { Save, Download, FileCheck, User, MapPin, GraduationCap, Briefcase, Users as FamilyIcon, Link as LinkIcon, FileText, Loader2, ChevronRight } from 'lucide-react';
import GeneralInfoTab from './GeneralInfoTab';
import ContactTab from './ContactTab';
import EducationTab from './EducationTab';
import WorkTab from './WorkTab';
import FamilyTab from './FamilyTab';
import AttachmentsTab from './AttachmentsTab';
import PreviewModal from './PreviewModal';
import { generateStudentDocx } from '../../utils/docxGenerator';
import { api } from '../../services/googleSheets';

interface StudentFormProps {
  profile: any;
  onSave: (profile: any) => Promise<boolean>;
  isReadOnly: boolean;
  config: SystemConfig;
  locations: LocationData[];
  locations2Level: LocationDataTwoLevel[];
}

const StudentForm: React.FC<StudentFormProps> = ({ profile, onSave, isReadOnly, config, locations, locations2Level }) => {
  const safeProfile = profile || {};
  
  const [formData, setFormData] = useState<any>({
    ...safeProfile,
    educationHistory: safeProfile.educationHistory || [],
    workHistory: safeProfile.workHistory || [],
    scientificWorks: safeProfile.scientificWorks || [],
    father: safeProfile.father || {},
    mother: safeProfile.mother || {},
    spouse: safeProfile.spouse || {},
    permanentAddress: safeProfile.permanentAddress || {},
    currentAddress: safeProfile.currentAddress || {},
    uniDegree: safeProfile.uniDegree || {},
    masterDegree: safeProfile.masterDegree || {},
    attachments: safeProfile.attachments || {}
  });

  const [previewData, setPreviewData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  const isLocked = isReadOnly || formData.status === 'approved';

  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const tabs = [
    { id: 0, label: 'Thông tin cá nhân', icon: User },
    { id: 1, label: 'Địa chỉ & Liên hệ', icon: MapPin },
    { id: 2, label: 'Đào tạo & Bằng cấp', icon: GraduationCap },
    { id: 3, label: 'Công tác & Nghiên cứu', icon: Briefcase },
    { id: 4, label: 'Gia đình & Cam đoan', icon: FamilyIcon },
    { id: 5, label: 'Tệp đính kèm', icon: LinkIcon },
  ];

  const handleUpdate = (field: string, value: any) => {
    if (isLocked) return;
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const scrollToSection = (id: number) => {
    setActiveTab(id);
    sectionRefs[id].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || isLocked) return;
    setIsSaving(true);
    try {
      const success = await onSave({ ...formData, status: 'submitted', submittedAt: new Date().toISOString() });
      if (success) setFormData((prev: any) => ({ ...prev, status: 'submitted' }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPreview = async () => {
    setPreviewData({ ...formData });
    setShowPreview(true);
    if (!isLocked) onSave(formData).catch(e => console.warn("Background save failed", e));
  };

  const handleExportWord = async () => {
    setIsGeneratingDoc(true);
    try {
      await generateStudentDocx(formData, config);
      if (!isLocked) onSave(formData).catch(console.warn);
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi tạo file Word');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const getHeaderStatus = () => {
    if (isLocked) {
      if (formData.status === 'approved') return 'Hồ sơ đã được duyệt (Khóa)';
      return 'Hết hạn nộp hồ sơ (Khóa)';
    }
    if (formData.status === 'submitted') return 'Đã nộp - Có thể cập nhật';
    return 'Hệ thống đang mở';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4">
      {/* Sidebar */}
      <div className="lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100/60 p-6 sticky top-24 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-due-blue"></div>
          
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold text-xs uppercase tracking-widest px-2 mb-1">Tiến trình khai báo</h3>
            {(formData.status === 'submitted' || formData.status === 'approved') && (
                <div className={`mt-2 flex items-center gap-2 text-[10px] font-bold p-2 rounded-lg ${
                    formData.status === 'approved' 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-due-blue bg-blue-50'
                }`}>
                    <FileCheck size={12} />
                    {formData.status === 'approved' ? 'Hồ sơ đã được duyệt' : 'Đã nộp hồ sơ'}
                </div>
            )}
          </div>

          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left border ${
                  activeTab === tab.id 
                    ? 'bg-due-blue/5 border-due-blue/20 text-due-blue shadow-sm' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-due-blue' : 'text-slate-400'} />
                <span className="text-xs font-bold uppercase tracking-tight whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3 hidden lg:block">
            <button
              onClick={handleOpenPreview}
              disabled={isFetchingPreview}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-due-orange text-due-orange rounded-2xl font-black hover:bg-orange-50 transition-all text-[11px] uppercase tracking-widest disabled:opacity-50"
            >
              {isFetchingPreview ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isFetchingPreview ? 'Đang xử lý...' : 'Xem & Tải PDF'}
            </button>

            <button
              onClick={handleExportWord}
              disabled={isGeneratingDoc || isFetchingPreview}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-blue-600 text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all text-[11px] uppercase tracking-widest disabled:opacity-50"
            >
              {isGeneratingDoc ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              {isGeneratingDoc ? 'Đang tạo...' : 'Xuất File Word'}
            </button>

            {!isLocked && (
              <button
                onClick={handleSubmit}
                disabled={isSaving || isFetchingPreview}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-due-blue text-white rounded-2xl font-black hover:bg-due-dark transition-all shadow-due text-[11px] uppercase tracking-widest disabled:opacity-50"
              >
                <FileCheck size={16} /> 
                {isSaving 
                    ? 'Đang lưu...' 
                    : (formData.status === 'submitted' ? 'Cập nhật Hồ Sơ' : 'Gửi Hồ Sơ')
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow space-y-8 max-w-4xl">
        <div className="bg-white rounded-[2.5rem] shadow-due border border-slate-100 overflow-hidden">
          <div className="bg-due-blue p-6 md:px-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight">Khai báo lý lịch</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-400' : 'bg-green-400 animate-pulse'}`}></span>
                <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-widest">
                    {getHeaderStatus()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 relative z-10">
               <div className="text-right">
                  <span className="block text-[8px] uppercase font-black text-blue-200 tracking-widest mb-1">Mã định danh</span>
                  <span className="text-lg font-black bg-white/10 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">{formData.id}</span>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>

          <div className="p-0 divide-y divide-slate-50">
            {/* Sections */}
            {[
              { component: GeneralInfoTab, title: "I. Thông tin cá nhân", icon: "1", props: {} },
              { component: ContactTab, title: "II. Địa chỉ & Liên hệ", icon: "2", props: { locations, locations2Level } },
              { component: EducationTab, title: "III-IV. Bằng cấp đào tạo", icon: "3", props: {} },
              { component: WorkTab, title: "V-VII. Công tác chuyên môn", icon: "4", props: {} },
              { component: FamilyTab, title: "VIII-IX. Gia đình & Cam đoan", icon: "5", props: {} },
              { component: AttachmentsTab, title: "Tệp đính kèm số hóa", icon: "6", props: {} }
            ].map((section, idx) => (
              <div key={idx} ref={sectionRefs[idx]} className="p-6 lg:px-10 lg:py-8 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-due-blue text-white flex items-center justify-center font-black text-lg shadow-due">
                     {section.icon}
                   </div>
                   <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{section.title}</h3>
                </div>
                <section.component 
                  data={formData} 
                  onChange={handleUpdate} 
                  isReadOnly={isLocked} 
                  config={config}
                  errors={errors}
                  {...section.props}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden flex flex-col gap-3 pb-10">
          <button 
            onClick={handleOpenPreview} 
            disabled={isFetchingPreview}
            className="flex-1 bg-white border-2 border-due-orange text-due-orange p-4 rounded-2xl font-black uppercase text-[10px] shadow-sm disabled:opacity-50"
          >
            {isFetchingPreview ? 'Đang tải...' : 'Xem & Tải PDF'}
          </button>
          
          {!isLocked && (
            <button 
                onClick={handleSubmit} 
                disabled={isSaving} 
                className="flex-1 bg-due-blue text-white p-4 rounded-2xl font-black uppercase text-[10px] shadow-due disabled:opacity-50"
            >
              {isSaving 
                  ? 'Đang lưu...' 
                  : (formData.status === 'submitted' ? 'Cập nhật Hồ Sơ' : 'Gửi Hồ Sơ')
              }
            </button>
          )}
        </div>
      </div>

      {showPreview && previewData && <PreviewModal data={previewData} onClose={() => setShowPreview(false)} config={config} />}
    </div>
  );
};

export default StudentForm;
