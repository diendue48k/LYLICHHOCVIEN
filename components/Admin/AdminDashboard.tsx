
import React, { useState } from 'react';
import { SystemConfig, LocationData, LocationDataTwoLevel } from '../../types';
import { Users, CheckCircle, Clock, Map, Save, FileSpreadsheet, Loader2, Database, RefreshCw } from 'lucide-react';
import StudentTable from './StudentTable';
import SystemSettings from './SystemSettings';
import ImportModal from './ImportModal';
import PreviewModal from '../Student/PreviewModal';
import { api, convertFlatLocationsToTree } from '../../services/googleSheets';

interface AdminDashboardProps {
  profiles: any[];
  config: SystemConfig;
  setConfig: React.Dispatch<React.SetStateAction<SystemConfig>>;
  setProfiles: React.Dispatch<React.SetStateAction<any[]>>;
  setLocations: React.Dispatch<React.SetStateAction<LocationData[]>>;
  setLocations2Level: React.Dispatch<React.SetStateAction<LocationDataTwoLevel[]>>;
  onSaveProfile: (profile: any) => void;
  onSaveConfig: (config: SystemConfig) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ profiles, config, setConfig, setProfiles, setLocations, setLocations2Level, onSaveProfile, onSaveConfig }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'settings'>('students');
  const [showImportStudent, setShowImportStudent] = useState(false);
  const [showImportLocation, setShowImportLocation] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  
  // Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  
  // State for controlling which sheet to read from
  const [activeSheetName, setActiveSheetName] = useState('STUDENTS');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial stats calculation
  const stats = [
    { label: 'Tổng học viên', value: profiles.length, icon: Users, color: 'text-due-blue', bg: 'bg-blue-50' },
    { label: 'Đã nộp hồ sơ', value: profiles.filter(p => p.status === 'submitted' || p.status === 'approved').length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cần bổ sung', value: profiles.filter(p => p.status === 'pending' || p.status === 'rejected').length, icon: Clock, color: 'text-due-orange', bg: 'bg-orange-50' }
  ];

  // Function to refresh data from a specific sheet
  const refreshData = async (targetSheetName: string) => {
    setIsRefreshing(true);
    try {
        const data = await api.getAllStudents(targetSheetName);
        if (Array.isArray(data)) {
            setProfiles(data);
        } else {
            console.error("Invalid data format", data);
            alert("Dữ liệu trả về không hợp lệ.");
        }
    } catch (e) {
        console.error("Fetch error", e);
        alert("Lỗi khi tải dữ liệu. Vui lòng kiểm tra tên Sheet và kết nối mạng.");
    } finally {
        setIsRefreshing(false);
    }
  };

  const handleSheetNameChange = (e: React.FormEvent) => {
      e.preventDefault();
      refreshData(activeSheetName);
  };

  // Handler for saving students to Database
  const handleImportStudents = async (newStudents: any[], meta?: { sheetName?: string }) => {
      setIsProcessing(true);
      setProgress({ current: 0, total: newStudents.length });
      
      const targetSheet = meta?.sheetName || 'STUDENTS';
      
      // Update UI state with optimistic update
      setProfiles(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = newStudents.filter(s => !existingIds.has(s.id));
          return [...prev, ...uniqueNew];
      });

      // Save to API (Bulk) with explicit sheetName AND progress callback
      const result = await api.saveStudentsBulk(newStudents, targetSheet, (curr, tot) => {
          setProgress({ current: curr, total: tot });
      });
      
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
      
      if (result.success) {
          alert(`✅ ĐỒNG BỘ THÀNH CÔNG!\n\nĐã lưu ${newStudents.length} học viên vào Google Sheet "${targetSheet}".`);
          // If we imported to a different sheet than currently viewing, switch to it
          if (targetSheet !== activeSheetName) {
              setActiveSheetName(targetSheet);
              // Trigger reload
              refreshData(targetSheet);
          }
      } else {
          if (result.isNetworkError) {
               alert(`⚠️ CẢNH BÁO: CHƯA LƯU ĐƯỢC LÊN SERVER\n\nDữ liệu đã hiển thị trên trình duyệt NHƯNG chưa vào được Google Sheet do lỗi kết nối.\n\nNguyên nhân có thể:\n1. Mạng yếu hoặc bị chặn.\n2. Script Google chưa được Deploy đúng quyền "Anyone".\n3. Tên Sheet "${targetSheet}" không tồn tại trong file.`);
          } else {
              alert(`❌ Lỗi: ${result.message}`);
          }
      }
  };

  // Handler for saving locations to Database
  const handleImportLocations = async (flatData: any[], meta?: { targetType?: '3_LEVELS' | '2_LEVELS', sheetName?: string }) => {
      setIsProcessing(true);
      const target = meta?.targetType || '3_LEVELS';
      const sheetName = meta?.sheetName;
      
      // 1. Convert Flat Data to Tree for UI State
      const treeData = convertFlatLocationsToTree(flatData, target);

      // 2. Update UI
      if (target === '3_LEVELS') {
          const specificData = treeData as LocationData[];
          setLocations(prev => {
               const newNames = new Set(specificData.map((d) => d.name));
               const others = prev.filter(p => !newNames.has(p.name));
               return [...others, ...specificData];
          });
      } else {
          const specificData = treeData as LocationDataTwoLevel[];
          setLocations2Level(prev => {
               const newNames = new Set(specificData.map((d) => d.name));
               const others = prev.filter(p => !newNames.has(p.name));
               return [...others, ...specificData];
          });
      }

      // 3. Save FLAT Data to API (More reliable for Sheets)
      const result = await api.saveLocations(target, flatData, sheetName);
      
      setIsProcessing(false);
      
      if (result.success) {
          alert(`✅ ĐÃ LƯU ĐỊA ĐIỂM!\n\nĐã cập nhật dữ liệu hành chính vào Sheet "${sheetName || (target === '3_LEVELS' ? 'LOCATIONS_3_LEVEL' : 'LOCATIONS_2_LEVEL')}".`);
      } else {
          alert(`❌ Lỗi: ${result.message}`);
      }
  };

  const handleViewStudent = (student: any) => {
    setViewingStudent(student);
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected' | 'submitted') => {
    const student = profiles.find(p => p.id === id);
    if (!student) return;

    const updated = { ...student, status };
    // Optimistic update
    setProfiles(prev => prev.map(p => p.id === id ? updated : p));
    
    // Call API via parent handler or directly
    // The prop is onSaveProfile
    onSaveProfile(updated);
  };

  const handleDeleteStudent = (id: string) => {
      if(!window.confirm("Bạn có chắc chắn muốn xóa học viên này khỏi danh sách hiển thị?\n(Lưu ý: Dữ liệu trên Google Sheet cần được xóa thủ công nếu muốn)")) return;
      setProfiles(prev => prev.filter(p => p.id !== id));
      // Note: Delete API is not implemented in services/googleSheets based on provided code, 
      // usually delete implies removing from UI or setting status to deleted.
      // Assuming UI removal for now.
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 ${stat.bg}`}>
            <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
             <button 
               onClick={() => setActiveTab('students')}
               className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-white text-due-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Quản lý Hồ sơ
             </button>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-white text-due-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Cấu hình Hệ thống
             </button>
          </div>

          {activeTab === 'students' && (
            <div className="flex flex-wrap gap-3">
               <form onSubmit={handleSheetNameChange} className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 focus-within:border-due-blue/50 focus-within:bg-white transition-all">
                  <Database size={14} className="text-slate-400" />
                  <input 
                    type="text" 
                    value={activeSheetName}
                    onChange={(e) => setActiveSheetName(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-600 w-24 focus:ring-0 placeholder:text-slate-300"
                    placeholder="Sheet Name"
                    title="Tên Sheet trong file Google Sheet"
                  />
                  <button 
                    type="submit"
                    disabled={isRefreshing} 
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                    title="Tải lại dữ liệu từ Sheet này"
                  >
                    <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
                  </button>
               </form>
               <div className="w-px h-8 bg-slate-100 mx-1 hidden md:block"></div>
               <button 
                 onClick={() => setShowImportLocation(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest shadow-sm"
               >
                 <Map size={14} /> Data Địa chính
               </button>
               <button 
                 onClick={() => setShowImportStudent(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-due-blue text-white rounded-lg font-bold hover:bg-due-dark transition-all text-[10px] uppercase tracking-widest shadow-sm shadow-due-blue/20"
               >
                 <FileSpreadsheet size={14} /> Import Danh sách
               </button>
            </div>
          )}
        </div>

        {/* Loading Overlay for Bulk Actions */}
        {isProcessing && (
           <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full text-center">
                 <Loader2 size={40} className="animate-spin text-due-blue mx-auto mb-4" />
                 <h4 className="text-lg font-black text-slate-800 mb-2">Đang đồng bộ dữ liệu...</h4>
                 <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                    <div 
                      className="bg-due-blue h-full transition-all duration-300" 
                      style={{ width: `${(progress.current / Math.max(progress.total, 1)) * 100}%` }}
                    ></div>
                 </div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Đã xử lý {progress.current} / {progress.total}
                 </p>
              </div>
           </div>
        )}

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'students' ? (
            <StudentTable 
               students={profiles} 
               onView={handleViewStudent} 
               onUpdateStatus={handleUpdateStatus}
               onDelete={handleDeleteStudent}
            />
          ) : (
             <SystemSettings config={config} setConfig={setConfig} />
          )}
        </div>
        
        {/* Footer Actions for Settings */}
        {activeTab === 'settings' && (
           <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                 onClick={() => onSaveConfig(config)}
                 className="flex items-center gap-2 px-8 py-3 bg-due-blue text-white rounded-xl font-black hover:bg-due-dark transition-all shadow-due text-[10px] uppercase tracking-widest"
              >
                 <Save size={16} /> Lưu cấu hình
              </button>
           </div>
        )}
      </div>

      {/* Modals */}
      {showImportStudent && (
        <ImportModal 
          type="STUDENTS" 
          onClose={() => setShowImportStudent(false)} 
          onImport={handleImportStudents} 
        />
      )}
      
      {showImportLocation && (
        <ImportModal 
          type="LOCATIONS" 
          onClose={() => setShowImportLocation(false)} 
          onImport={handleImportLocations} 
        />
      )}

      {viewingStudent && (
        <PreviewModal 
          data={viewingStudent} 
          onClose={() => setViewingStudent(null)}
          config={config} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
