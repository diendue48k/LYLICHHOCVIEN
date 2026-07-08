
import React, { useState } from 'react';
import { X, Upload, FileText, AlertCircle, Check, MapPin, Layers, Loader2, ArrowRight, Table } from 'lucide-react';
import { StudentType } from '../../types';

interface ImportModalProps {
  type: 'STUDENTS' | 'LOCATIONS';
  onClose: () => void;
  // Updated onImport to accept sheetName options
  onImport: (data: any[], meta?: { targetType?: '3_LEVELS' | '2_LEVELS', sheetName?: string }) => Promise<void> | void; 
}

// Helper: Parse various date formats to YYYY-MM-DD
const normalizeDate = (value: any): string => {
    if (!value) return '';
    try {
        if (typeof value === 'number') {
            const date = new Date(Math.round((value - 25569) * 86400 * 1000));
            date.setMinutes(date.getMinutes() + date.getTimezoneOffset()); 
            return date.toISOString().split('T')[0];
        }
        const str = String(value).trim();
        if (str.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const parts = str.split('/');
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        if (str.match(/^\d{4}-\d{2}-\d{2}$/)) return str;
        const date = new Date(str);
        if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
        return str;
    } catch (e) {
        return String(value);
    }
};

const ImportModal: React.FC<ImportModalProps> = ({ type, onClose, onImport }) => {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [parsedCount, setParsedCount] = useState(0);
  
  // Settings State
  const [sheetName, setSheetName] = useState(type === 'STUDENTS' ? 'STUDENTS' : 'LOCATIONS_3_LEVEL');
  const [locationTarget, setLocationTarget] = useState<'3_LEVELS' | '2_LEVELS'>('3_LEVELS');
  
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus('idle');
      setErrorMsg('');
      
      try {
          // Parse immediately to show preview
          const data = await parseExcelData(selectedFile);
          setPreviewData(data.slice(0, 5)); // Take first 5 for preview
          setParsedCount(data.length);
          setStep('preview');
          
          // Auto update sheetName default for Locations
          if (type === 'LOCATIONS') {
              setSheetName(locationTarget === '3_LEVELS' ? 'LOCATIONS_3_LEVEL' : 'LOCATIONS_2_LEVEL');
          }
      } catch (e: any) {
          setErrorMsg(e.message);
          setStatus('error');
      }
    }
  };

  const processExcel = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        if (!window.XLSX) {
            reject(new Error("Thư viện xử lý Excel chưa tải xong. Vui lòng kiểm tra kết nối mạng và tải lại trang."));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                // @ts-ignore
                const workbook = window.XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                // @ts-ignore
                const jsonData = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(jsonData);
            } catch (error) {
                console.error("XLSX parsing error:", error);
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
  };

  const parseExcelData = async (file: File) => {
        const rawData = await processExcel(file);
        if (!rawData || rawData.length === 0) throw new Error("File không có dữ liệu.");

        const rows = rawData.slice(1); // Skip header
        let importData: any[] = [];

        if (type === 'STUDENTS') {
            importData = rows.filter((row: any) => row[0]).map((row: any) => ({
                id: String(row[0] || '').trim(),
                cccd: String(row[1] || '').trim(),
                fullName: String(row[2] || '').toUpperCase(),
                email: String(row[3] || ''),
                phone: String(row[4] || ''),
                studentType: String(row[5]).toUpperCase().includes('NCS') ? StudentType.NCS : StudentType.CAO_HOC,
                major: String(row[6] || ''),
                className: String(row[7] || ''),
                birthDate: row[8] ? normalizeDate(row[8]) : '', 
                status: 'pending' as const
            }));
        } else {
             if (locationTarget === '3_LEVELS') {
                importData = rows.filter((row: any) => row[0]).map((row: any) => ({
                    city: String(row[0] || '').trim(),
                    district: String(row[1] || '').trim(),
                    ward: String(row[2] || '').trim()
                })).filter((item: any) => item.city);
            } else {
                 importData = rows.filter((row: any) => row[0]).map((row: any) => ({
                    city: String(row[0] || '').trim(),
                    ward: String(row[1] || '').trim()
                 })).filter((item: any) => item.city);
            }
        }
        
        if (importData.length === 0) throw new Error("Không tìm thấy dòng dữ liệu hợp lệ nào.");
        return importData;
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setStatus('idle');

    try {
        // Re-parse to get full data (or could cache it)
        const data = await parseExcelData(file);
        
        if (type === 'STUDENTS') {
             await onImport(data, { sheetName });
        } else {
             await onImport(data, { targetType: locationTarget, sheetName });
        }

        setStatus('success');
        setTimeout(onClose, 2000);

    } catch (e: any) {
        console.error(e);
        setStatus('error');
        setErrorMsg(e.message || 'Lỗi khi import.');
    } finally {
        setIsImporting(false);
    }
  };

  const title = type === 'STUDENTS' ? 'Nhập danh sách học viên' : 'Nhập dữ liệu địa chính';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {step === 'upload' ? <Upload size={24} className="text-due-blue" /> : <Table size={24} className="text-due-blue" />}
            {step === 'upload' ? title : 'Kiểm tra dữ liệu trước khi nhập'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          {step === 'upload' ? (
              // STEP 1: UPLOAD
              <div className="space-y-6">
                {type === 'LOCATIONS' && (
                    <div className="flex flex-col gap-3">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Loại dữ liệu địa chính</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${locationTarget === '3_LEVELS' ? 'border-due-blue bg-blue-50 ring-1 ring-due-blue' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="target" className="hidden" checked={locationTarget === '3_LEVELS'} onChange={() => {setLocationTarget('3_LEVELS'); setSheetName('LOCATIONS_3_LEVEL')}} />
                                <div className="font-bold text-sm text-slate-800">Hệ 3 Cấp (Cũ)</div>
                                <div className="text-[10px] text-slate-500">Tỉnh / Quận / Phường</div>
                            </label>
                            <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${locationTarget === '2_LEVELS' ? 'border-due-blue bg-blue-50 ring-1 ring-due-blue' : 'border-slate-200 hover:border-slate-300'}`}>
                                <input type="radio" name="target" className="hidden" checked={locationTarget === '2_LEVELS'} onChange={() => {setLocationTarget('2_LEVELS'); setSheetName('LOCATIONS_2_LEVEL')}} />
                                <div className="font-bold text-sm text-slate-800">Hệ 2 Cấp (Mới)</div>
                                <div className="text-[10px] text-slate-500">Tỉnh / Xã</div>
                            </label>
                        </div>
                    </div>
                )}

                <div 
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    status === 'error' ? 'border-red-300 bg-red-50' : 'border-due-blue bg-blue-50/50 hover:bg-blue-50'
                    }`}
                >
                    {status === 'error' ? (
                        <div className="flex flex-col items-center gap-2 text-red-600">
                            <AlertCircle size={32} />
                            <p className="font-bold">{errorMsg}</p>
                            <button onClick={() => setStatus('idle')} className="text-xs underline mt-2">Thử lại</button>
                        </div>
                    ) : (
                        <>
                            <FileText size={48} className="mx-auto mb-4 text-due-blue" />
                            <p className="text-gray-600 mb-2 font-medium">Kéo thả hoặc chọn file Excel (.xlsx)</p>
                            <label className="inline-block mt-2 bg-white border border-gray-300 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 cursor-pointer shadow-sm text-due-blue">
                                Chọn file từ máy tính
                                <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>
                        </>
                    )}
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                    <p className="font-bold uppercase tracking-wide text-slate-400">Yêu cầu định dạng:</p>
                    {type === 'STUDENTS' ? (
                        <ul className="list-disc ml-4 space-y-1">
                            <li>Cột A: Mã học viên | Cột B: CCCD | Cột C: Họ tên</li>
                            <li>Cột D: Email | E: SĐT | F: Loại (NCS/CAO_HOC)</li>
                            <li>Cột G: Ngành | H: Lớp | I: Ngày sinh</li>
                        </ul>
                    ) : (
                         <p>File Excel chứa danh sách địa chính theo cột A, B, C tương ứng.</p>
                    )}
                </div>
              </div>
          ) : (
              // STEP 2: PREVIEW & SETTINGS
              <div className="space-y-6">
                 {status === 'success' ? (
                     <div className="flex flex-col items-center justify-center py-10 gap-4 text-green-600 animate-in zoom-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <Check size={40} />
                        </div>
                        <h4 className="text-xl font-bold">Import thành công!</h4>
                        <p className="text-slate-500 text-sm">Đã xử lý {parsedCount} dòng dữ liệu.</p>
                     </div>
                 ) : (
                 <>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <div className="space-y-2 w-full">
                            <p className="text-sm text-amber-900 font-medium">
                                Tìm thấy <strong>{parsedCount}</strong> dòng dữ liệu hợp lệ.
                            </p>
                            <p className="text-xs text-amber-800">Vui lòng kiểm tra 5 dòng đầu tiên bên dưới xem có đúng cột không.</p>
                        </div>
                    </div>

                    <div className="border rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 border-b font-bold text-slate-500 uppercase">
                                    <tr>
                                        {type === 'STUDENTS' ? (
                                            <>
                                                <th className="p-3">Mã HV</th>
                                                <th className="p-3">Họ Tên</th>
                                                <th className="p-3">CCCD</th>
                                                <th className="p-3">Email</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="p-3">Tỉnh/TP</th>
                                                <th className="p-3">{locationTarget === '3_LEVELS' ? 'Quận/Huyện' : 'Xã/Phường'}</th>
                                                {locationTarget === '3_LEVELS' && <th className="p-3">Phường/Xã</th>}
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {previewData.map((row, i) => (
                                        <tr key={i} className="bg-white">
                                            {type === 'STUDENTS' ? (
                                                <>
                                                    <td className="p-3 font-mono text-slate-600">{row.id}</td>
                                                    <td className="p-3 font-bold text-slate-800">{row.fullName}</td>
                                                    <td className="p-3 text-slate-600">{row.cccd}</td>
                                                    <td className="p-3 text-slate-600">{row.email}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-3 font-bold">{row.city}</td>
                                                    <td className="p-3">{locationTarget === '3_LEVELS' ? row.district : row.ward}</td>
                                                    {locationTarget === '3_LEVELS' && <td className="p-3">{row.ward}</td>}
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                             <Layers size={14} className="text-due-blue" />
                             Tên Sheet trên Google (Tab Name)
                        </label>
                        <input 
                            type="text" 
                            className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-due-blue outline-none font-bold text-sm"
                            value={sheetName}
                            onChange={(e) => setSheetName(e.target.value)}
                            placeholder="Vd: STUDENTS, Sheet1..."
                        />
                        <p className="text-[10px] text-slate-400">
                            Quan trọng: Tên này phải TRÙNG KHỚP với tên Tab phía dưới cùng trong file Google Sheet của bạn.
                        </p>
                    </div>
                 </>
                 )}
              </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 flex gap-3 border-t shrink-0">
          <button 
            onClick={() => {
                if (step === 'preview' && status !== 'success') setStep('upload'); 
                else onClose();
            }}
            className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-colors text-xs uppercase tracking-widest"
          >
            {step === 'preview' && status !== 'success' ? 'Chọn file khác' : 'Đóng'}
          </button>
          
          {step === 'preview' && status !== 'success' && (
             <button 
                onClick={handleConfirmImport}
                disabled={isImporting}
                className="flex-1 px-6 py-3 bg-due-blue text-white rounded-xl font-bold hover:bg-due-dark transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
            >
                {isImporting ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</> : <><Check size={16} /> Xác nhận Import</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
