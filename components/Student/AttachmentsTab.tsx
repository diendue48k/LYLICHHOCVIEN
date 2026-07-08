
import React from 'react';
import { Link as LinkIcon, AlertCircle } from 'lucide-react';
import { SystemConfig, StudentType } from '../../types';

interface AttachmentsTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  config: SystemConfig;
  // Added errors property to match StudentForm usage
  errors: string[];
}

const AttachmentsTab: React.FC<AttachmentsTabProps> = ({ data, onChange, isReadOnly, config, errors }) => {
  const handleUpdate = (field: string, value: string) => {
    const current = data.attachments || {};
    onChange('attachments', { ...current, [field]: value });
  };

  const getFieldConfig = (fieldId: string) => {
    return config.fieldConfigs.find(f => f.id === fieldId) || { isVisible: true, isRequired: false, label: '' };
  };

  const renderLinkInput = (id: string, description: string) => {
    const fConfig = getFieldConfig(id);
    if (!fConfig.isVisible) return null;

    if (id === 'degreeMasterFile' && data.studentType !== StudentType.NCS) return null;

    return (
      <div className="space-y-1.5 p-5 bg-white rounded-xl border border-slate-200 group focus-within:border-due-blue focus-within:shadow-md transition-all duration-300">
        <div className="flex justify-between items-start">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {fConfig.label} {fConfig.isRequired && <span className="text-due-red">*</span>}
          </label>
          <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within:bg-due-blue/10 group-focus-within:text-due-blue transition-all">
            <LinkIcon size={12} />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium">{description}</p>
        <input 
          type="url"
          value={data.attachments?.[id] || ''}
          onChange={(e) => handleUpdate(id, e.target.value)}
          disabled={isReadOnly}
          placeholder="https://drive.google.com/share-link-cua-ban"
          className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue outline-none text-sm font-medium text-slate-700 transition-all placeholder:text-slate-300"
        />
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <AlertCircle className="text-due-blue flex-shrink-0 mt-0.5" size={16} />
        <div>
          <p className="text-xs text-due-blue font-bold uppercase tracking-wide mb-1">
            Quy trình nộp minh chứng số hóa
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Vui lòng upload hồ sơ lên Google Drive và dán Link vào các ô bên dưới. 
            Đảm bảo thiết lập quyền truy cập cho Link là <strong className="text-due-blue">"Bất kỳ ai có đường liên kết đều có thể xem"</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderLinkInput('degreeUniFile', 'Scan bản gốc hoặc bản sao công chứng')}
        {renderLinkInput('degreeMasterFile', 'Bắt buộc đối với Nghiên cứu sinh')}
        {renderLinkInput('birthCertFile', 'Scan bản sao trích lục hoặc bản chính')}
        {renderLinkInput('cccdFrontFile', 'Ảnh chụp rõ nét mặt trước CCCD')}
        {renderLinkInput('cccdBackFile', 'Ảnh chụp rõ nét mặt sau CCCD')}
        {renderLinkInput('othersFile', 'Các chứng chỉ ngoại ngữ, thành tích KH...')}
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Hướng dẫn 3 bước số hóa hồ sơ</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
          <div className="flex flex-col items-center text-center group">
             <div className="w-10 h-10 rounded-xl bg-due-blue/10 text-due-blue flex items-center justify-center mb-3 transition-colors font-bold text-sm">1</div>
             <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Scan/Chụp ảnh</p>
             <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Sử dụng ứng dụng CamScanner để có chất lượng scan tốt nhất.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
             <div className="w-10 h-10 rounded-xl bg-due-blue/10 text-due-blue flex items-center justify-center mb-3 transition-colors font-bold text-sm">2</div>
             <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Drive</p>
             <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Tải tệp lên Google Drive cá nhân và MỞ QUYỀN TRUY CẬP.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
             <div className="w-10 h-10 rounded-xl bg-due-blue/10 text-due-blue flex items-center justify-center mb-3 transition-colors font-bold text-sm">3</div>
             <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dán link</p>
             <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Sao chép đường dẫn trực tiếp và dán vào các ô hồ sơ tương ứng.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachmentsTab;
