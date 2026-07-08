
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { StudentType, SystemConfig } from '../../types';

interface GeneralInfoTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  config: SystemConfig;
  errors: string[];
}

// InputField component defined outside to prevent re-renders
interface InputFieldProps {
  id: string;
  label: string;
  value: any;
  onChange: (id: string, value: any) => void;
  isReadOnly: boolean;
  isVisible: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  isReadOnly, 
  isVisible, 
  type = 'text', 
  placeholder = '', 
  className = "",
  maxLength
}) => {
  if (!isVisible) return null;
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(id, e.target.value)}
        disabled={isReadOnly}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:border-due-blue focus:bg-white focus:ring-2 focus:ring-due-blue/10 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
};

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ data, onChange, isReadOnly, config, errors }) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoUrl || null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
        onChange('photoUrl', event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to enforce numeric input with max length
  // Validates: CCCD (12), Phone (10)
  const handleNumericChange = (fieldId: string, rawValue: string, maxLength: number) => {
    if (isReadOnly) return;
    // Remove non-numeric characters immediately
    const numericValue = rawValue.replace(/\D/g, '');
    // Enforce max length
    const finalValue = numericValue.slice(0, maxLength);
    onChange(fieldId, finalValue);
  };

  const isFieldVisible = (fieldId: string) => {
    const fieldConfig = config.fieldConfigs.find(f => f.id === fieldId);
    if (!fieldConfig) return true;
    if (fieldConfig.appliesTo !== 'BOTH' && fieldConfig.appliesTo !== data.studentType) return false;
    return fieldConfig.isVisible;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-40 flex-shrink-0">
          <div className="relative group">
            <div className={`w-32 h-48 mx-auto md:mx-0 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center bg-slate-50 overflow-hidden transition-all relative ${
              photoPreview ? 'border-due-blue shadow-due' : 'border-slate-300 hover:border-due-blue/50'
            }`}>
              {photoPreview ? (
                <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-3">
                  <Camera className="mx-auto mb-2 text-slate-400 group-hover:text-due-blue transition-colors" size={28} />
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider leading-tight">Ảnh 4x6<br/>DƯỚI 6 THÁNG</p>
                </div>
              )}
            </div>
            {!isReadOnly && (
              <label className="absolute inset-0 cursor-pointer opacity-0 z-20">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        </div>

        <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="md:col-span-2">
               <InputField 
                 id="fullName" 
                 label="Họ và tên" 
                 placeholder="Viết hoa có dấu..." 
                 value={data.fullName}
                 onChange={onChange}
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('fullName')}
               />
            </div>
            <InputField 
                 id="className" 
                 label="Lớp khóa học" 
                 placeholder="Vd: K29.Quản trị" 
                 value={data.className}
                 onChange={onChange}
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('className')}
            />
            <InputField 
                 id="major" 
                 label="Ngành đào tạo" 
                 placeholder="Vd: Kinh tế học" 
                 value={data.major}
                 onChange={onChange}
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('major')}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField 
             id="birthDate" 
             label="Ngày sinh" 
             type="date" 
             value={data.birthDate}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('birthDate')}
        />
        
        {isFieldVisible('gender') && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Giới tính</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              {['Nam', 'Nữ'].map(g => (
                <label key={g} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md cursor-pointer transition-all font-semibold text-xs ${
                  data.gender === g ? 'bg-white text-due-blue shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}>
                  <input type="radio" className="hidden" value={g} checked={data.gender === g} onChange={(e) => onChange('gender', e.target.value)} disabled={isReadOnly} /> {g}
                </label>
              ))}
            </div>
          </div>
        )}
        
        <InputField 
             id="nationality" 
             label="Quốc tịch" 
             value={data.nationality}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('nationality')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField 
             id="birthPlace" 
             label="Nơi sinh (Theo khai sinh)" 
             placeholder="Ghi đúng Tỉnh/TP..." 
             value={data.birthPlace}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('birthPlace')}
        />
        <InputField 
             id="ethnic" 
             label="Dân tộc" 
             value={data.ethnic}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('ethnic')}
        />
        <InputField 
             id="religion" 
             label="Tôn giáo" 
             value={data.religion}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('religion')}
        />
      </div>

      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField 
             id="cccd" 
             label="Số CCCD" 
             value={data.cccd}
             onChange={(id, val) => handleNumericChange(id, val, 12)} // Validation: Numeric only, Max 12
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cccd')}
             placeholder="Đủ 12 chữ số"
             maxLength={12}
          />
          <InputField 
             id="cccdIssuedDate" 
             label="Ngày cấp CCCD" 
             type="date" 
             value={data.cccdIssuedDate}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cccdIssuedDate')}
          />
          <InputField 
             id="cccdIssuedPlace" 
             label="Nơi cấp CCCD" 
             value={data.cccdIssuedPlace}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cccdIssuedPlace')}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField 
             id="cmnd" 
             label="Số CMND (nếu có)" 
             value={data.cmnd}
             onChange={(id, val) => handleNumericChange(id, val, 12)} // Validation: Numeric only, Max 12
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cmnd')}
             placeholder="9 hoặc 12 số"
             maxLength={12}
          />
          <InputField 
             id="cmndIssuedDate" 
             label="Ngày cấp CMND" 
             type="date" 
             value={data.cmndIssuedDate}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cmndIssuedDate')}
          />
          <InputField 
             id="cmndIssuedPlace" 
             label="Nơi cấp CMND" 
             value={data.cmndIssuedPlace}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('cmndIssuedPlace')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {isFieldVisible('disability') && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Khuyết tật</label>
            <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
              {[true, false].map(v => (
                <label key={v.toString()} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl cursor-pointer transition-all font-black text-xs uppercase ${
                  data.disability === v ? 'bg-due-blue text-white shadow-due' : 'text-slate-400 hover:text-slate-600'
                }`}>
                  <input type="radio" className="hidden" checked={data.disability === v} onChange={() => onChange('disability', v)} disabled={isReadOnly} /> {v ? 'Có' : 'Không'}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="md:col-span-2">
          <InputField 
             id="disabilityType" 
             label="Loại khuyết tật (Nếu có)" 
             value={data.disabilityType}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('disabilityType')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
             id="hometown" 
             label="Quê quán" 
             placeholder="Xã/Phường - Quận/Huyện - Tỉnh/TP" 
             value={data.hometown}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('hometown')}
        />
        <InputField 
             id="socialInsuranceId" 
             label="Số sổ BHXH" 
             value={data.socialInsuranceId}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('socialInsuranceId')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField 
             id="unionJoinDate" 
             label="Ngày vào Đoàn" 
             type="date" 
             value={data.unionJoinDate}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('unionJoinDate')}
        />
        <InputField 
             id="partyJoinDate" 
             label="Ngày vào Đảng" 
             type="date" 
             value={data.partyJoinDate}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('partyJoinDate')}
        />
        {data.studentType === StudentType.NCS && (
             <InputField 
                 id="officialPartyJoinDate" 
                 label="Ngày vào Đảng chính thức" 
                 type="date" 
                 value={data.officialPartyJoinDate}
                 onChange={onChange}
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('officialPartyJoinDate')}
             />
        )}
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
        <h4 className="text-[11px] font-black text-due-blue uppercase tracking-[0.3em] ml-4">Cơ quan & Liên hệ</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField 
             id="workPlace" 
             label="Cơ quan công tác" 
             value={data.workPlace}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('workPlace')}
          />
          <InputField 
             id="phone" 
             label={`SĐT ${data.studentType === StudentType.NCS ? 'NCS' : 'Học viên'}`} 
             value={data.phone}
             onChange={(id, val) => handleNumericChange(id, val, 10)} // Validation: Numeric only, Max 10
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('phone')}
             placeholder="Đủ 10 chữ số"
             maxLength={10}
          />
          <InputField 
             id="email" 
             label="Email cá nhân" 
             value={data.email}
             onChange={onChange}
             isReadOnly={isReadOnly}
             isVisible={isFieldVisible('email')}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField 
                 id="emergencyContactName" 
                 label="Họ tên người thân" 
                 value={data.emergencyContactName}
                 onChange={onChange}
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('emergencyContactName')}
            />
            <InputField 
                 id="emergencyContactPhone" 
                 label="SĐT người thân" 
                 value={data.emergencyContactPhone}
                 onChange={(id, val) => handleNumericChange(id, val, 10)} // Validation: Numeric only, Max 10
                 isReadOnly={isReadOnly}
                 isVisible={isFieldVisible('emergencyContactPhone')}
                 placeholder="10 chữ số"
                 maxLength={10}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
