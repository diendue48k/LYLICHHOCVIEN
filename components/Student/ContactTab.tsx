
import React, { useState } from 'react';
import { SystemConfig, LocationData, LocationDataTwoLevel } from '../../types';
import { List, AlertCircle } from 'lucide-react';

interface ContactTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  config: SystemConfig;
  locations?: LocationData[];
  locations2Level?: LocationDataTwoLevel[]; // Add support for 2nd dataset
  errors: string[];
}

const ContactTab: React.FC<ContactTabProps> = ({ data, onChange, isReadOnly, config, locations = [], locations2Level = [], errors }) => {
  // States to track manual input mode for each address section
  const [manualMode, setManualMode] = useState<{ permanent: boolean; current: boolean }>({
    permanent: false,
    current: false
  });

  // State to track which system (3-Level vs 2-Level) the user chooses for each address IF config.addressMode is 'BOTH'
  // Defaults to '3_LEVELS' if BOTH. Otherwise enforced by config.
  const [systemChoice, setSystemChoice] = useState<{ permanent: '3_LEVELS' | '2_LEVELS'; current: '3_LEVELS' | '2_LEVELS' }>({
    permanent: config.addressMode === '2_LEVELS' ? '2_LEVELS' : '3_LEVELS',
    current: config.addressMode === '2_LEVELS' ? '2_LEVELS' : '3_LEVELS'
  });

  const toggleManualMode = (type: 'permanent' | 'current') => {
    setManualMode(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSystemChange = (type: 'permanent' | 'current', system: '3_LEVELS' | '2_LEVELS') => {
      setSystemChoice(prev => ({ ...prev, [type]: system }));
      // Reset dependent fields when system changes to avoid invalid state
      const currentData = data[type === 'permanent' ? 'permanentAddress' : 'currentAddress'] || {};
      onChange(type === 'permanent' ? 'permanentAddress' : 'currentAddress', { ...currentData, city: '', district: '', ward: '' });
  };

  const handleAddressUpdate = (type: 'permanentAddress' | 'currentAddress', field: string, value: string) => {
    const currentData = data[type] || {};
    const modeKey = type === 'permanentAddress' ? 'permanent' : 'current';
    const isManual = manualMode[modeKey];
    
    // Auto-reset dependent fields logic
    if (!isManual) {
        if (field === 'city') {
            onChange(type, { ...currentData, [field]: value, district: '', ward: '' });
        } 
        else if (field === 'district') {
            onChange(type, { ...currentData, [field]: value, ward: '' });
        } else {
            onChange(type, { ...currentData, [field]: value });
        }
    } else {
        onChange(type, { ...currentData, [field]: value });
    }
  };

  // --- 3-LEVEL HELPERS ---
  const getDistricts3 = (cityName: string) => {
    const city = locations.find(c => c.name === cityName);
    return city ? city.districts : [];
  };
  const getWards3 = (cityName: string, districtName: string) => {
    const city = locations.find(c => c.name === cityName);
    if (!city) return [];
    const district = city.districts.find(d => d.name === districtName);
    return district ? district.wards : [];
  };

  // --- 2-LEVEL HELPERS ---
  const getWards2 = (cityName: string) => {
    const city = locations2Level.find(c => c.name === cityName);
    return city ? city.wards : [];
  };

  const renderAddressGroup = (title: string, type: 'permanentAddress' | 'currentAddress') => {
    const addr = data[type] || {};
    const modeKey = type === 'permanentAddress' ? 'permanent' : 'current';
    const isManual = manualMode[modeKey];
    
    // Determine active system
    let activeSystem = systemChoice[modeKey];
    if (config.addressMode !== 'BOTH') {
        activeSystem = config.addressMode;
    }

    // Cascading Data
    let districts: any[] = [];
    let wards: string[] = [];

    if (activeSystem === '3_LEVELS') {
        districts = getDistricts3(addr.city);
        wards = getWards3(addr.city, addr.district);
    } else {
        wards = getWards2(addr.city);
    }

    return (
      <div className="space-y-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex flex-col gap-4 border-b border-blue-100 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h4 className="font-black text-due-blue uppercase text-xs tracking-widest flex items-center gap-2">
                  {title}
                </h4>
                
                {!isReadOnly && (
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="sr-only peer"
                                checked={isManual}
                                onChange={() => toggleManualMode(modeKey)}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-due-orange"></div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isManual ? 'text-due-orange' : 'text-slate-400 group-hover:text-slate-600'}`}>
                            {isManual ? 'Nhập thủ công (Khác)' : 'Chọn từ danh sách'}
                        </span>
                    </label>
                )}
            </div>

            {/* System Selector if BOTH is allowed and not Manual */}
            {config.addressMode === 'BOTH' && !isManual && !isReadOnly && (
                <div className="flex gap-2 p-1 bg-white rounded-xl w-fit border border-slate-200">
                    <button 
                        onClick={() => handleSystemChange(modeKey, '3_LEVELS')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeSystem === '3_LEVELS' ? 'bg-due-blue text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Hệ 3 Cấp (Cũ)
                    </button>
                    <button 
                        onClick={() => handleSystemChange(modeKey, '2_LEVELS')}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeSystem === '2_LEVELS' ? 'bg-due-blue text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Hệ 2 Cấp (Mới)
                    </button>
                </div>
            )}
        </div>

        {isManual && (
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-start gap-3">
                <AlertCircle className="text-due-orange shrink-0 mt-0.5" size={16} />
                <p className="text-[11px] text-orange-800 font-medium leading-relaxed">
                    Bạn đang ở chế độ <strong>Nhập thủ công</strong>. Sử dụng chế độ này nếu địa chỉ của bạn là địa danh cũ, mới sát nhập, hoặc không tìm thấy trong danh sách mặc định.
                </p>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-12 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Địa chỉ chi tiết</label>
            <input type="text" placeholder="Số nhà, đường, thôn..." className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-due-blue shadow-sm" value={addr.details || ''} onChange={(e) => handleAddressUpdate(type, 'details', e.target.value)} disabled={isReadOnly} />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Số nhà</label>
            <input type="text" className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-due-blue shadow-sm" value={addr.houseNumber || ''} onChange={(e) => handleAddressUpdate(type, 'houseNumber', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên đường</label>
            <input type="text" className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-due-blue shadow-sm" value={addr.street || ''} onChange={(e) => handleAddressUpdate(type, 'street', e.target.value)} disabled={isReadOnly} />
          </div>
          <div className="md:col-span-5 space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tổ/Thôn/Xóm</label>
             <input type="text" className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none font-bold text-sm focus:border-due-blue shadow-sm" value={addr.hamlet || ''} onChange={(e) => handleAddressUpdate(type, 'hamlet', e.target.value)} disabled={isReadOnly} />
          </div>

          {/* Level 1: City/Province */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tỉnh/Thành phố</label>
            {isManual ? (
                <input 
                    type="text" 
                    className="w-full p-3.5 bg-white border-2 border-due-orange/20 rounded-2xl outline-none font-bold text-sm focus:border-due-orange shadow-sm text-slate-700"
                    placeholder="Nhập tên Tỉnh/TP..."
                    value={addr.city || ''} 
                    onChange={(e) => handleAddressUpdate(type, 'city', e.target.value)} 
                    disabled={isReadOnly}
                />
            ) : (
                <div className="relative">
                    <select 
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-sm focus:border-due-blue focus:ring-2 focus:ring-due-blue/10 appearance-none truncate pr-8" 
                        value={addr.city || ''} 
                        onChange={(e) => handleAddressUpdate(type, 'city', e.target.value)} 
                        disabled={isReadOnly}
                    >
                        <option value="">Chọn Tỉnh/TP...</option>
                        {activeSystem === '3_LEVELS' 
                            ? locations.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
                            : locations2Level.map(c => <option key={c.name} value={c.name}>{c.name}</option>)
                        }
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <List size={16} />
                    </div>
                </div>
            )}
          </div>

          {/* Level 2: District (Only if 3_LEVELS) */}
          {activeSystem === '3_LEVELS' && (
            <div className="md:col-span-4 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quận/Huyện</label>
                {isManual ? (
                    <input 
                        type="text" 
                        className="w-full p-3.5 bg-white border-2 border-due-orange/20 rounded-2xl outline-none font-bold text-sm focus:border-due-orange shadow-sm text-slate-700"
                        placeholder="Nhập tên Quận/Huyện..."
                        value={addr.district || ''} 
                        onChange={(e) => handleAddressUpdate(type, 'district', e.target.value)} 
                        disabled={isReadOnly}
                    />
                ) : (
                    <div className="relative">
                        <select 
                            className="w-full p-3.5 bg-white border-2 border-transparent rounded-2xl outline-none font-bold text-sm focus:border-due-blue shadow-sm appearance-none truncate pr-8" 
                            value={addr.district || ''} 
                            onChange={(e) => handleAddressUpdate(type, 'district', e.target.value)} 
                            disabled={isReadOnly || !addr.city}
                        >
                            <option value="">Chọn Quận/Huyện...</option>
                            {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <List size={16} />
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* Level 3 (or 2): Ward */}
          <div className={activeSystem === '3_LEVELS' ? "md:col-span-4 space-y-1.5" : "md:col-span-8 space-y-1.5"}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xã/Phường</label>
            {isManual ? (
                <input 
                    type="text" 
                    className="w-full p-3.5 bg-white border-2 border-due-orange/20 rounded-2xl outline-none font-bold text-sm focus:border-due-orange shadow-sm text-slate-700"
                    placeholder="Nhập tên Xã/Phường..."
                    value={addr.ward || ''} 
                    onChange={(e) => handleAddressUpdate(type, 'ward', e.target.value)} 
                    disabled={isReadOnly}
                />
            ) : (
                <div className="relative">
                    {(wards.length > 0) ? (
                        <select 
                            className="w-full p-3.5 bg-white border-2 border-transparent rounded-2xl outline-none font-bold text-sm focus:border-due-blue shadow-sm appearance-none truncate pr-8" 
                            value={addr.ward || ''} 
                            onChange={(e) => handleAddressUpdate(type, 'ward', e.target.value)} 
                            disabled={isReadOnly}
                        >
                        <option value="">Chọn Xã/Phường...</option>
                        {wards.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    ) : (
                         <input 
                            type="text" 
                            className="w-full p-3.5 bg-white border-2 border-transparent rounded-2xl outline-none font-bold text-sm focus:border-due-blue shadow-sm" 
                            value={addr.ward || ''} 
                            onChange={(e) => handleAddressUpdate(type, 'ward', e.target.value)} 
                            disabled={isReadOnly} 
                            placeholder="Nhập tên Xã/Phường"
                        />
                    )}
                    {wards.length > 0 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                             <List size={16} />
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {renderAddressGroup('II.1. Hộ khẩu thường trú', 'permanentAddress')}
      <div className="flex justify-center">
        <button onClick={() => onChange('currentAddress', { ...data.permanentAddress })} className="px-8 py-3 bg-due-blue/5 text-due-blue rounded-full text-[10px] font-black uppercase border border-blue-100 hover:bg-due-blue hover:text-white transition-all shadow-sm" disabled={isReadOnly}>
          Sử dụng HK thường trú làm địa chỉ hiện tại
        </button>
      </div>
      {renderAddressGroup('II.2. Địa chỉ ở hiện tại', 'currentAddress')}
    </div>
  );
};

export default ContactTab;
