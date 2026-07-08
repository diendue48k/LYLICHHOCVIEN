
import React, { useState, useEffect } from 'react';
import { UserRole, SystemConfig, LocationData, LocationDataTwoLevel } from './types';
import { MOCK_ADMIN_SETTINGS, GOOGLE_SCRIPT_URL } from './constants';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentForm from './components/Student/StudentForm';
import { AlertCircle, UserX, Loader2, Unplug } from 'lucide-react';
import { api } from './services/googleSheets';

const App: React.FC = () => {
  const [user, setUser] = useState<{ role: UserRole; id: string } | null>(null);
  const [config, setConfig] = useState<SystemConfig>(MOCK_ADMIN_SETTINGS);
  
  // Data States
  const [profiles, setProfiles] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [locations2Level, setLocations2Level] = useState<LocationDataTwoLevel[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = !GOOGLE_SCRIPT_URL.includes('PLACEHOLDER');

  // Initial Data Load
  useEffect(() => {
    const loadSystemData = async () => {
      setIsLoading(true);
      
      try {
        // Parallel Fetching to reduce load time
        const [remoteConfig, loc3, loc2] = await Promise.all([
            api.getConfig(),
            api.getLocations('3_LEVELS'),
            api.getLocations('2_LEVELS')
        ]);

        if (remoteConfig) setConfig(remoteConfig);
        if (loc3) setLocations(loc3 as LocationData[]);
        if (loc2) setLocations2Level(loc2 as LocationDataTwoLevel[]);
        
      } catch (error) {
        console.error("Failed to load system data", error);
        // Fallback or alert handled within api methods mostly
      } finally {
        setIsLoading(false);
      }
    };

    loadSystemData();
  }, []);

  // Fetch admin data when user logs in as Admin
  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      const loadAdminData = async () => {
        setIsLoading(true);
        const allStudents = await api.getAllStudents();
        setProfiles(allStudents);
        setIsLoading(false);
      };
      loadAdminData();
    }
  }, [user]);

  const handleLogin = async (id: string, role: UserRole) => {
    setIsLoading(true);
    if (role === UserRole.ADMIN) {
      // Admin login (Simulated for now, normally would check password against config)
      if (id === 'admin') {
         setUser({ id, role });
      } else {
         alert("Sai thông tin đăng nhập Admin (Dùng id: admin)");
      }
    } else {
      // Student Login via API (DR-01: SSOT)
      const result = await api.studentLogin(id);
      if (result.success) {
        setActiveProfile(result.data);
        setUser({ id, role });
      } else {
        alert(result.message || "Không tìm thấy thông tin học viên");
      }
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProfile(null);
    setProfiles([]);
  };

  // Modified to return boolean for local form state management
  const handleSaveStudent = async (updatedProfile: any): Promise<boolean> => {
    const result = await api.saveStudent(updatedProfile);
    if (result.success) {
      // SR-01: Update local state immediately with success, 
      // but SSOT requires the Preview to fetch fresh again (handled in StudentForm)
      setActiveProfile(updatedProfile);
      
      // Only show alert if it's a manual submit (status changes), otherwise silent save
      if (updatedProfile.status === 'submitted') {
          alert('Đã nộp hồ sơ thành công!');
      }
      return true;
    } else {
      alert('Lỗi khi lưu: ' + result.message);
      return false;
    }
  };

  const handleAdminSaveStudent = async (updatedProfile: any) => {
     // Admin updating a student status
     const result = await api.saveStudent(updatedProfile);
     if (result.success) {
        setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
     } else {
        alert('Lỗi cập nhật: ' + result.message);
     }
  };

  const handleSaveConfig = async (newConfig: SystemConfig) => {
      setIsLoading(true);
      const result = await api.saveConfig(newConfig);
      if (result.success) {
          setConfig(newConfig);
          alert("Cấu hình đã được lưu!");
      } else {
          alert("Lỗi lưu cấu hình.");
      }
      setIsLoading(false);
  };

  const isSystemOpen = () => {
    const now = new Date();
    return now >= new Date(config.openDate) && now <= new Date(config.closeDate) && config.isOpen;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
           <Loader2 className="animate-spin text-due-blue mx-auto" size={48} />
           <p className="text-slate-500 font-bold animate-pulse">Đang kết nối cơ sở dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Configuration Warning Banner */}
      {!isConfigured && (
        <div className="bg-due-red text-white text-center py-2 px-4 text-[10px] font-black uppercase tracking-widest sticky top-0 z-[100] flex items-center justify-center gap-2 shadow-lg">
          <Unplug size={14} />
          Chưa kết nối Database. Vui lòng cập nhật GOOGLE_SCRIPT_URL trong file constants.tsx
        </div>
      )}

      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Navbar user={user} onLogout={handleLogout} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {user.role === UserRole.ADMIN ? (
              <AdminDashboard 
                profiles={profiles} 
                config={config} 
                setConfig={setConfig} 
                setProfiles={setProfiles}
                setLocations={setLocations}
                setLocations2Level={setLocations2Level}
                onSaveProfile={handleAdminSaveStudent}
                onSaveConfig={handleSaveConfig}
              />
            ) : (
              <div className="animate-in fade-in duration-500">
                {!activeProfile ? (
                  <div className="max-w-2xl mx-auto mt-20 text-center space-y-6 p-12 bg-white rounded-[2rem] shadow-due border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 text-due-red rounded-full flex items-center justify-center mx-auto">
                      <UserX size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Không tìm thấy hồ sơ</h2>
                    <p className="text-slate-500">Mã học viên hoặc CCCD <strong>{user.id}</strong> không tồn tại trong danh sách trúng tuyển. Vui lòng liên hệ phòng Đào tạo để được hỗ trợ.</p>
                    <button 
                      onClick={handleLogout}
                      className="bg-due-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-due-dark transition-all uppercase text-xs tracking-widest"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                ) : (
                  <>
                    {!isSystemOpen() && (
                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 flex items-center gap-3 rounded-r-xl">
                        <AlertCircle className="text-amber-500" />
                        <p className="text-amber-700 text-sm font-medium">
                          Hệ thống đang đóng hoặc hết hạn. Bạn hiện chỉ có thể xem và in phiếu thông tin.
                        </p>
                      </div>
                    )}
                    <StudentForm 
                      profile={activeProfile} 
                      onSave={handleSaveStudent} 
                      isReadOnly={!isSystemOpen()}
                      config={config}
                      locations={locations}
                      locations2Level={locations2Level}
                    />
                  </>
                )}
              </div>
            )}
          </main>

          <footer className="bg-white border-t py-6 text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest">
            <p>&copy; {new Date().getFullYear()} Trường Đại học Kinh tế - Đại học Đà Nẵng. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
