
import React, { useState } from 'react';
import { ChevronLeft, Printer, Download, Loader2, FileText } from 'lucide-react';
import { StudentType, SystemConfig } from '../../types';
import { MOCK_ADMIN_SETTINGS } from '../../constants';
import { generateStudentDocx } from '../../utils/docxGenerator';

interface PreviewModalProps {
  data: any;
  onClose: () => void;
  config?: SystemConfig;
}

const cleanData = (val: any) => (val === null || val === undefined) ? "" : String(val);

const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return cleanData(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const PreviewModal: React.FC<PreviewModalProps> = ({ data, onClose, config }) => {
  const isNCS = data.studentType === StudentType.NCS;
  const activeConfig = config || MOCK_ADMIN_SETTINGS;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);

  const handleExportWord = async () => {
    setIsGeneratingDoc(true);
    try {
        await generateStudentDocx(data, activeConfig);
    } catch (e) {
        console.error(e);
        alert('Có lỗi khi tạo file Word');
    } finally {
        setIsGeneratingDoc(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    const element = document.getElementById('print-section');
    if (!element) return;
    
    setIsDownloading(true);

    const opt = {
      margin: [10, 10, 10, 10], // mm
      filename: `Ly_lich_${data.id}_${data.fullName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
          scale: 2, 
          useCORS: true, 
          scrollY: 0,
          scrollX: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        const html2pdf = (window as any).html2pdf;
        if (html2pdf) {
            await html2pdf().set(opt).from(element).save();
        } else {
            alert("Lỗi: Thư viện tạo PDF chưa tải xong.");
        }
    } catch (e) {
        console.error(e);
        alert("Có lỗi xảy ra khi tạo PDF.");
    } finally {
        setIsDownloading(false);
    }
  };

  // --- STYLES ---
  const sContainer = {
      width: '210mm', 
      padding: '15mm 20mm', 
      backgroundColor: 'white',
      fontFamily: '"Times New Roman", Times, serif', 
      fontSize: '13pt', 
      lineHeight: '1.3', 
      color: '#000',
      margin: '0', // Bỏ margin auto để tránh lỗi offset khi chụp PDF
      boxSizing: 'border-box' as const
  };

  const sTable = { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '5px' };
  const sCell = { padding: '4px 2px', verticalAlign: 'top' as const };
  const sLabel = { ...sCell, whiteSpace: 'nowrap' as const, paddingRight: '5px' };
  // word-break: break-word giúp nội dung dài tự xuống dòng trong PDF
  const sValue = { ...sCell, fontWeight: 'normal' as const, paddingLeft: '5px', wordBreak: 'break-word' as const }; 
  
  const sSectionHeader = { 
      fontWeight: 'bold', 
      textDecoration: 'underline', 
      marginTop: '15px', 
      marginBottom: '5px', 
      fontSize: '13pt',
      textTransform: 'uppercase' as const,
      pageBreakAfter: 'avoid' as const
  };
  
  const sCheckbox = { 
      fontFamily: 'Arial Unicode MS, Lucida Sans Unicode, sans-serif', 
      fontSize: '14pt', 
      marginRight: '3px',
      lineHeight: '1'
  };

  const sNote = {
      fontStyle: 'italic',
      fontSize: '13pt',
      fontWeight: 'normal',
      textDecoration: 'none',
      textTransform: 'none' as const,
      display: 'inline'
  };

  const displayVal = (val: any) => cleanData(val);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 overflow-y-auto modal-backdrop">
      <style>{`
        @media print {
            @page { margin: 0; size: A4; }
            html, body { 
                background: white; 
                height: auto; 
                width: 100%;
                margin: 0;
            }
            .modal-backdrop { 
                position: static !important; /* QUAN TRỌNG: Không dùng absolute */
                overflow: visible !important; 
                background: white !important; 
                display: block !important;
                width: 100%;
                height: auto;
            }
            #print-section { 
                margin: 0 auto !important; 
                padding: 15mm 20mm !important; 
                width: 100% !important;
                max-width: 210mm !important;
                box-shadow: none !important;
                border: none !important;
                position: relative !important;
            }
            .no-print { display: none !important; }
        }
        
        /* Ngăn cắt dòng giữa chừng */
        tr { page-break-inside: avoid !important; }
        td { page-break-inside: avoid !important; }
        .keep-together { page-break-inside: avoid; }
      `}</style>
      
      <div className="sticky top-0 w-full bg-white border-b p-4 flex gap-4 justify-between items-center shadow-md z-[110] no-print">
        <button onClick={onClose} className="text-slate-600 font-bold flex items-center gap-2 uppercase text-xs hover:text-blue-600">
          <ChevronLeft size={20} /> Quay lại
        </button>
        <div className="hidden md:block text-xs text-red-500 font-bold uppercase">
            Chế độ xem trước (PDF)
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleExportWord} 
                disabled={isGeneratingDoc}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-bold text-xs uppercase flex gap-2 items-center disabled:opacity-50 transition-colors shadow-sm"
            >
                {isGeneratingDoc ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                {isGeneratingDoc ? 'Đang tạo...' : 'Xuất Word'}
            </button>
            <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="bg-due-orange text-white hover:bg-orange-600 px-4 py-2 rounded font-bold text-xs uppercase flex gap-2 items-center disabled:opacity-50 transition-colors shadow-sm"
            >
                {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isDownloading ? 'Đang tạo...' : 'Tải PDF'}
            </button>
            <button onClick={handlePrint} className="bg-due-blue text-white hover:bg-due-dark px-4 py-2 rounded font-bold text-xs uppercase flex gap-2 items-center transition-colors shadow-sm">
                <Printer size={16} /> In phiếu
            </button>
        </div>
      </div>

      <div className="flex justify-center py-8 bg-slate-500 print:bg-white print:py-0 print:block">
        <div id="print-section" style={sContainer}>
            {/* HEADER - Sử dụng bảng để căn chỉnh logo và tiêu đề */}
            <table style={{...sTable, marginBottom: '20px'}} className="keep-together">
                <tbody>
                    <tr>
                        <td style={{ width: '110px', verticalAlign: 'middle', border: '1px solid #000', height: '140px', textAlign: 'center', fontSize: '11pt', padding: 0 }}>
                            {data.photoUrl ? (
                                <img src={data.photoUrl} style={{width:'100%', height:'100%', objectFit: 'cover'}} crossorigin="anonymous" />
                            ) : (
                                <div style={{padding: '5px'}}>Ảnh<br/>(Chụp không quá<br/>6 tháng)</div>
                            )}
                        </td>
                        <td style={{ verticalAlign: 'top', paddingLeft: '20px', textAlign: 'center' }}>
                            <div style={{fontWeight:'bold', fontSize:'13pt'}}>ĐẠI HỌC ĐÀ NẴNG</div>
                            <div style={{fontWeight:'bold', fontSize:'13pt', textDecoration: 'underline'}}>TRƯỜNG ĐẠI HỌC KINH TẾ</div>
                            <div style={{marginTop: '20px', fontSize:'16pt', fontWeight:'bold', textTransform: 'uppercase'}}>
                                {isNCS ? "PHIẾU THÔNG TIN LÝ LỊCH NGHIÊN CỨU SINH" : "THÔNG TIN LÝ LỊCH HỌC VIÊN CAO HỌC"}
                            </div>
                        </td>
                        <td style={{ width: '180px', verticalAlign: 'top', paddingLeft: '10px' }}>
                            <div style={{marginBottom:'5px'}}>Lớp: <span style={sValue}>{data.className}</span></div>
                            <div>Ngành: <span style={sValue}>{data.major}</span></div>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* I. THONG TIN CA NHAN */}
            <div style={sSectionHeader}>{isNCS ? "I. THÔNG TIN CÁ NHÂN NGHIÊN CỨU SINH (NCS)" : "I. THÔNG TIN CÁ NHÂN"}</div>
            <table style={sTable}>
                <tbody>
                    <tr>
                        <td style={{...sLabel, width: '15%'}}>- Họ tên:</td>
                        <td style={{...sValue, width: '40%', textTransform: 'uppercase'}}>{displayVal(data.fullName)}</td>
                        <td style={{...sLabel, width: '15%'}}>- Ngày sinh:</td>
                        <td style={{...sValue, width: '15%'}}>{formatDate(data.birthDate)}</td>
                        <td style={{...sLabel, width: '15%'}}>- Giới tính:</td>
                        <td style={{...sValue}}>
                            <span style={{marginRight:'10px'}}><span style={sCheckbox}>{data.gender === 'Nam' ? '☑' : '☐'}</span>Nam</span>
                            <span><span style={sCheckbox}>{data.gender === 'Nữ' ? '☑' : '☐'}</span>Nữ</span>
                        </td>
                    </tr>
                    <tr>
                         <td style={sLabel}>- Nơi sinh:</td>
                         <td style={sValue} colSpan={3}>{displayVal(data.birthPlace)}</td>
                         <td style={sLabel}>- Quốc tịch:</td>
                         <td style={sValue}>{displayVal(data.nationality)}</td>
                    </tr>
                    <tr>
                        <td colSpan={6} style={{fontStyle:'italic', paddingLeft:'20px', paddingBottom:'5px'}}>
                            {isNCS ? "(Nơi sinh: Nghiên cứu sinh ghi đúng tên Tỉnh trên Giấy khai sinh)" : "(Nơi sinh: Học viên ghi đúng tên tỉnh ghi trên giấy khai sinh)"}
                        </td>
                    </tr>
                    <tr>
                         <td style={sLabel}>- Dân tộc:</td>
                         <td style={sValue} colSpan={3}>{displayVal(data.ethnic)}</td>
                         <td style={sLabel}>- Tôn giáo:</td>
                         <td style={sValue}>{displayVal(data.religion)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>- Số CCCD:</td>
                        <td style={sValue} colSpan={2}>{displayVal(data.cccd)}</td>
                        <td style={sLabel}>- Ngày cấp:</td>
                        <td style={sValue}>{formatDate(data.cccdIssuedDate)}</td>
                        <td style={sLabel}>{isNCS ? "- Nơi cấp: " : "- Nơi cấp CCCD: "}<span style={sValue}>{displayVal(data.cccdIssuedPlace)}</span></td>
                    </tr>
                    <tr>
                        <td style={sLabel}>- Số CMND:</td>
                        <td style={sValue} colSpan={2}>{displayVal(data.cmnd)}</td>
                        <td style={sLabel}>- Ngày cấp:</td>
                        <td style={sValue}>{formatDate(data.cmndIssuedDate)}</td>
                        <td style={sLabel}>{isNCS ? "- Nơi cấp: " : "- Nơi cấp CNMD: "}<span style={sValue}>{displayVal(data.cmndIssuedPlace)}</span></td>
                    </tr>
                    <tr>
                        <td style={sLabel}>- Khuyết tật:</td>
                        <td style={sValue} colSpan={2}>
                            <span style={{marginRight:'20px'}}><span style={sCheckbox}>{data.disability ? '☑' : '☐'}</span>Có</span>
                            <span><span style={sCheckbox}>{!data.disability ? '☑' : '☐'}</span>Không</span>
                        </td>
                        <td style={sLabel} colSpan={2}>- Loại Khuyết tật:</td>
                        <td style={sValue}>{displayVal(data.disabilityType)}</td>
                    </tr>
                    <tr>
                         <td style={sLabel}>- Quê quán:</td>
                         <td style={sValue} colSpan={5}>{displayVal(data.hometown)}</td>
                    </tr>
                    <tr>
                         <td style={sLabel} colSpan={2}>- Số sổ bảo hiểm xã hội:</td>
                         <td style={sValue} colSpan={4}>{displayVal(data.socialInsuranceId)}</td>
                    </tr>
                    {isNCS ? (
                        <>
                            <tr>
                                <td style={sLabel} colSpan={3}>- Ngày vào Đoàn: <span style={sValue}>{formatDate(data.unionJoinDate)}</span></td>
                                <td style={sLabel} colSpan={3}>- Ngày vào Đảng: <span style={sValue}>{formatDate(data.partyJoinDate)}</span></td>
                            </tr>
                            <tr>
                                <td style={sLabel} colSpan={6}>- Ngày vào Đảng chính thức: <span style={sValue}>{formatDate(data.officialPartyJoinDate)}</span></td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td style={sLabel} colSpan={2}>- Ngày vào Đoàn: <span style={sValue}>{formatDate(data.unionJoinDate)}</span></td>
                            <td style={sLabel} colSpan={2}>- Ngày vào Đảng: <span style={sValue}>{formatDate(data.partyJoinDate)}</span></td>
                            <td style={sLabel} colSpan={2}>- Ngày vào Đảng chính thức: <span style={sValue}>{formatDate(data.officialPartyJoinDate)}</span></td>
                        </tr>
                    )}
                    <tr>
                        <td style={sLabel}>- Cơ quan CT:</td>
                        <td style={sValue} colSpan={5}>{displayVal(data.workPlace)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel} colSpan={6}>{isNCS ? "- Số điện thoại nghiên cứu sinh: " : "- Số điện thoại học viên: "}<span style={sValue}>{displayVal(data.phone)}</span></td>
                    </tr>
                    <tr>
                        <td style={sLabel} colSpan={6}>- Email:<span style={sValue}>{displayVal(data.email)}</span></td>
                    </tr>
                    <tr>
                        <td style={sLabel} colSpan={6}>- Họ tên người thân khi cần liên hệ: <span style={sValue}>{displayVal(data.emergencyContactName)}</span></td>
                    </tr>
                    <tr>
                        <td style={sLabel} colSpan={6}>- Số điện thoại của người thân: <span style={sValue}>{displayVal(data.emergencyContactPhone)}</span></td>
                    </tr>
                </tbody>
            </table>

            {/* II. LIEN HE */}
            <div style={sSectionHeader}>II. THÔNG TIN LIÊN HỆ <span style={sNote}>({isNCS ? 'NCS' : 'Học viên'} khai thật cụ thể, đầy đủ)</span></div>
            
            <table style={sTable}>
                <tbody>
                    <tr>
                        <td style={{...sLabel, fontWeight:'bold'}} colSpan={6}>- Hộ Khẩu Thường Trú: <span style={{fontWeight:'normal'}}>Số nhà:</span> <span style={sValue}>{displayVal(data.permanentAddress?.houseNumber)}</span> <span style={{fontWeight:'normal', marginLeft: '20px'}}>Tên đường:</span> <span style={sValue}>{displayVal(data.permanentAddress?.street)}</span></td>
                    </tr>
                    <tr>
                        <td style={{...sLabel, width: '15%'}}>Tổ/Thôn/Xóm:</td>
                        <td style={{...sValue, width: '35%'}}>{displayVal(data.permanentAddress?.hamlet)}</td>
                        <td style={{...sLabel, width: '15%'}}>Xã/Phường:</td>
                        <td style={{...sValue, width: '35%'}}>{displayVal(data.permanentAddress?.ward)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Tỉnh/Thành phố:</td>
                        <td style={sValue} colSpan={3}>{displayVal(data.permanentAddress?.city)}</td>
                    </tr>
                    <tr><td colSpan={6} style={{height: '5px'}}></td></tr>
                    <tr>
                         <td style={{...sLabel, fontWeight:'bold'}} colSpan={6}>- Địa Chỉ ở Hiện Tại: <span style={{fontWeight:'normal'}}>Số nhà:</span> <span style={sValue}>{displayVal(data.currentAddress?.houseNumber)}</span> <span style={{fontWeight:'normal', marginLeft: '20px'}}>Tên đường:</span> <span style={sValue}>{displayVal(data.currentAddress?.street)}</span></td>
                    </tr>
                    <tr>
                        <td style={{...sLabel, width: '15%'}}>Tổ/Thôn/Xóm:</td>
                        <td style={{...sValue, width: '35%'}}>{displayVal(data.currentAddress?.hamlet)}</td>
                        <td style={{...sLabel, width: '15%'}}>Xã/Phường:</td>
                        <td style={{...sValue, width: '35%'}}>{displayVal(data.currentAddress?.ward)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Tỉnh/Thành phố:</td>
                        <td style={sValue} colSpan={3}>{displayVal(data.currentAddress?.city)}</td>
                    </tr>
                </tbody>
            </table>

            {/* III. BANG DAI HOC */}
            <div style={sSectionHeader}>
                {isNCS ? "III. THÔNG TIN BẰNG TỐT NGHIỆP ĐẠI HỌC " : "III. THÔNG TIN BẰNG TỐT NGHIỆP "}
                <span style={sNote}>{isNCS ? "(NCS khai cụ thể thông tin văn bằng)" : "(Học viên khai cụ thể thông tin văn bằng)"}</span>
            </div>
            <table style={sTable}>
                <tbody>
                    <tr>
                        <td style={{...sLabel, width: '20%'}}>Trường cấp bằng:</td>
                        <td style={{...sValue, width: '40%'}}>{displayVal(data.uniDegree?.school)}</td>
                        <td style={{...sLabel, width: '15%'}}>Hệ đào tạo:</td>
                        <td style={{...sValue, width: '25%'}}>{displayVal(data.uniDegree?.system)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Số hiệu bằng:</td>
                        <td style={sValue}>{displayVal(data.uniDegree?.degreeNumber)}</td>
                        <td style={sLabel}>Số vào sổ cấp bằng:</td>
                        <td style={sValue}>{displayVal(data.uniDegree?.bookNumber)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Ngày ký bằng:</td>
                        <td style={sValue}>{formatDate(data.uniDegree?.signDate)}</td>
                        <td style={sLabel}>Năm tốt nghiệp:</td>
                        <td style={sValue}>{displayVal(data.uniDegree?.gradYear)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Ngành:</td>
                        <td style={sValue}>{displayVal(data.uniDegree?.major)}</td>
                        <td style={sLabel}>Chuyên ngành:</td>
                        <td style={sValue}>{displayVal(data.uniDegree?.specialization)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Học hàm-Học vị/Họ tên người ký bằng:</td>
                        <td style={sValue} colSpan={3}>{displayVal(data.uniDegree?.signer)}</td>
                    </tr>
                    <tr>
                        <td style={sLabel}>Liên thông:</td>
                        <td colSpan={3} style={sValue}>
                            <span style={{marginRight:'20px'}}><span style={sCheckbox}>{data.uniDegree?.isTransfer ? '☑' : '☐'}</span>Có</span>
                            <span><span style={sCheckbox}>{!data.uniDegree?.isTransfer ? '☑' : '☐'}</span>Không</span>
                        </td>
                    </tr>
                </tbody>
            </table>
            
             {/* IV. BANG THAC SI (NCS ONLY) */}
             {isNCS && (
                <>
                <div style={sSectionHeader}>IV. THÔNG TIN BẰNG TỐT NGHIỆP THẠC SĨ <span style={sNote}>(NCS khai cụ thể thông tin văn bằng)</span></div>
                <table style={sTable}>
                    <tbody>
                        <tr>
                            <td style={{...sLabel, width: '20%'}}>Trường cấp bằng:</td>
                            <td style={{...sValue, width: '40%'}}>{displayVal(data.masterDegree?.school)}</td>
                            <td style={{...sLabel, width: '15%'}}>Hệ đào tạo:</td>
                            <td style={{...sValue, width: '25%'}}>{displayVal(data.masterDegree?.system)}</td>
                        </tr>
                        <tr>
                            <td style={sLabel}>Số hiệu bằng:</td>
                            <td style={sValue}>{displayVal(data.masterDegree?.degreeNumber)}</td>
                            <td style={sLabel}>Số vào sổ cấp bằng:</td>
                            <td style={sValue}>{displayVal(data.masterDegree?.bookNumber)}</td>
                        </tr>
                        <tr>
                            <td style={sLabel}>Ngày ký bằng:</td>
                            <td style={sValue}>{formatDate(data.masterDegree?.signDate)}</td>
                            <td style={sLabel}>Năm tốt nghiệp:</td>
                            <td style={sValue}>{displayVal(data.masterDegree?.gradYear)}</td>
                        </tr>
                        <tr>
                            <td style={sLabel}>Ngành:</td>
                            <td style={sValue}>{displayVal(data.masterDegree?.major)}</td>
                            <td style={sLabel}>Chuyên ngành:</td>
                            <td style={sValue}>{displayVal(data.masterDegree?.specialization)}</td>
                        </tr>
                        <tr>
                            <td style={sLabel}>Học hàm-Học vị/Họ tên người ký bằng:</td>
                            <td style={sValue} colSpan={3}>{displayVal(data.masterDegree?.signer)}</td>
                        </tr>
                    </tbody>
                </table>
                </>
             )}

            {/* V. QUA TRINH DAO TAO */}
            <div style={sSectionHeader}>{isNCS ? "V" : "IV"}. QUÁ TRÌNH ĐÀO TẠO <span style={sNote}>({isNCS ? 'NCS khai đầy đủ quá trình đào tạo từ cao đẳng trở lên' : 'Học viên khai đầy đủ quá trình đào tạo từ hệ cao đẳng trở lên'})</span></div>
            <table style={{...sTable, border: '1px solid black'}}>
                <thead>
                    <tr>
                        <th style={{border: '1px solid black', padding: '5px', width: '15%', textAlign:'center', fontWeight:'bold'}}>Thời gian<br/><span style={{fontWeight:'normal', fontStyle:'italic'}}>(từ tháng/năm -<br/>đến tháng năm)</span></th>
                        <th style={{border: '1px solid black', padding: '5px', width: '25%', textAlign:'center', fontWeight:'bold'}}>Tên trường/<br/>Cơ sở đào tạo</th>
                        <th style={{border: '1px solid black', padding: '5px', width: '20%', textAlign:'center', fontWeight:'bold'}}>Ngành học</th>
                        <th style={{border: '1px solid black', padding: '5px', width: '25%', textAlign:'center', fontWeight:'bold'}}>Hình thức đào tạo<br/><span style={{fontWeight:'normal', fontStyle:'italic'}}>(Chính quy/Tại chức/<br/>Từ xa/Vừa làm vừa học...)</span></th>
                        <th style={{border: '1px solid black', padding: '5px', width: '15%', textAlign:'center', fontWeight:'bold'}}>Văn bằng/<br/>Chứng chỉ</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({length: Math.max(5, (data.educationHistory?.length || 0))}).map((_, i) => (
                        <tr key={i} style={{height: '35px'}}>
                             <td style={{border: '1px solid black', textAlign: 'center', verticalAlign:'middle'}}>{cleanData(data.educationHistory?.[i]?.timeRange)}</td>
                             <td style={{border: '1px solid black', textAlign: 'left', verticalAlign:'middle', paddingLeft:'5px'}}>{cleanData(data.educationHistory?.[i]?.schoolName)}</td>
                             <td style={{border: '1px solid black', textAlign: 'left', verticalAlign:'middle', paddingLeft:'5px'}}>{cleanData(data.educationHistory?.[i]?.major)}</td>
                             <td style={{border: '1px solid black', textAlign: 'center', verticalAlign:'middle'}}>{cleanData(data.educationHistory?.[i]?.learningType)}</td>
                             <td style={{border: '1px solid black', textAlign: 'center', verticalAlign:'middle'}}>{cleanData(data.educationHistory?.[i]?.degree)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

             {/* VI. QUA TRINH CONG TAC */}
            <div style={sSectionHeader}>{isNCS ? "VI" : "V"}. QUÁ TRÌNH CÔNG TÁC CHUYÊN MÔN KỂ TỪ KHI TỐT NGHIỆP ĐẠI HỌC</div>
            <div style={{fontStyle:'italic', marginBottom:'10px', fontSize: '13pt'}}>({isNCS ? 'NCS' : 'Học viên'} khai đầy đủ quá trình công tác chuyên môn)</div>
            <table style={{...sTable, border: '1px solid black'}}>
                <thead>
                    <tr>
                        <th style={{border: '1px solid black', padding: '5px', width: '20%', textAlign:'center', fontWeight:'bold'}}>Thời gian<br/><span style={{fontWeight:'normal', fontStyle:'italic'}}>(từ tháng/năm -<br/>đến tháng năm)</span></th>
                        <th style={{border: '1px solid black', padding: '5px', width: '45%', textAlign:'center', fontWeight:'bold'}}>Đơn vị công tác</th>
                        <th style={{border: '1px solid black', padding: '5px', width: '35%', textAlign:'center', fontWeight:'bold'}}>Chức vụ, công việc<br/>đảm nhiệm</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from({length: Math.max(3, (data.workHistory?.length || 0))}).map((_, i) => (
                        <tr key={i} style={{height: '35px'}}>
                             <td style={{border: '1px solid black', textAlign: 'center', verticalAlign:'middle'}}>{cleanData(data.workHistory?.[i]?.timeRange)}</td>
                             <td style={{border: '1px solid black', textAlign: 'left', verticalAlign:'middle', paddingLeft:'5px'}}>{cleanData(data.workHistory?.[i]?.organization)}</td>
                             <td style={{border: '1px solid black', textAlign: 'left', verticalAlign:'middle', paddingLeft:'5px'}}>{cleanData(data.workHistory?.[i]?.position)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* VII. KHOA HOC */}
            <div style={sSectionHeader}>{isNCS ? "VII" : "VI"}. CÁC CÔNG TRÌNH KHOA HỌC ĐÃ CÔNG BỐ:</div>
            {data.scientificWorks && data.scientificWorks.length > 0 ? (
                data.scientificWorks.map((w: string, i: number) => (
                    <div key={i} style={{ minHeight: '25px', marginBottom: '5px', paddingLeft: '5px', borderBottom: '1px dotted #ccc' }}>
                        {displayVal(w)}
                    </div>
                ))
            ) : (
                <>
                    <div style={{ borderBottom: '1px dotted #ccc', height: '25px', marginBottom: '5px' }}></div>
                    <div style={{ borderBottom: '1px dotted #ccc', height: '25px', marginBottom: '5px' }}></div>
                    <div style={{ borderBottom: '1px dotted #ccc', height: '25px', marginBottom: '5px' }}></div>
                </>
            )}

            {/* VIII. KHEN THƯỞNG */}
            <div style={{...sSectionHeader, marginTop:'15px', display:'inline-block'}}>
                {isNCS ? "VIII" : "VII"}. KHEN THƯỞNG, KỈ LUẬT 
            </div>
            <span style={{...sNote, color: 'red', fontSize: '13pt'}}> ({isNCS ? 'NCS' : 'Học viên'} cần khai rõ cho đến thời điểm kê khai có bị kỷ luật hoặc bị truy cứu trách nhiệm hình sự hay không).</span>
            
            <div style={{marginTop:'5px', marginBottom:'5px'}}>Khen thưởng: <span style={sValue}>{displayVal(data.rewards)}</span></div>
            <div style={{borderBottom: '1px dotted #999', width: '100%', marginBottom: '10px'}}></div>
            
            <div>Kỷ luật: <span style={sValue}>{displayVal(data.discipline)}</span></div>
            <div style={{borderBottom: '1px dotted #999', width: '100%', marginBottom: '10px'}}></div>

            {/* IX. GIA DINH */}
            <div style={sSectionHeader}>{isNCS ? "IX" : "VIII"}. THÀNH PHẦN GIA ĐÌNH <span style={sNote}>({isNCS ? 'NCS' : 'Học viên'} khai đầy đủ thông tin gia đình)</span></div>
            
            {/* CHA */}
            <div style={{marginTop: '5px'}}>- <b>Họ và tên CHA:</b> <span style={sValue}>{data.father?.fullName?.toUpperCase()}</span> <span style={{marginLeft: '30px'}}>Ngày sinh: <span style={sValue}>{data.father?.birthDate}</span></span></div>
            <table style={sTable}><tbody>
                <tr>
                    <td style={{...sLabel, width: '150px'}}>- Số điện thoại:</td>
                    <td style={{...sValue, width: '150px'}}>{displayVal(data.father?.phone)}</td>
                    <td style={{...sLabel, width: '100px', textAlign:'right'}}>Nghề nghiệp:</td>
                    <td style={{...sValue}}>{displayVal(data.father?.job)}</td>
                </tr>
                <tr><td style={sLabel}>- Địa chỉ thường trú:</td><td style={sValue} colSpan={3}>{displayVal(data.father?.address)}</td></tr>
                <tr>
                    <td style={sLabel}>- Trình độ học vấn:</td>
                    <td colSpan={3} style={sValue}>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.father?.educationLevel === "Sau đại học" ? '☑' : '☐'}</span>Sau đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.father?.educationLevel === "Đại học" ? '☑' : '☐'}</span>Đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.father?.educationLevel === "Cao đẳng" ? '☑' : '☐'}</span>Cao đẳng</span>
                        <span><span style={sCheckbox}>{data.father?.educationLevel === "Trung cấp" ? '☑' : '☐'}</span>Trung cấp</span><br/>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.father?.educationLevel === "Phổ thông trung học" ? '☑' : '☐'}</span>Phổ thông trung học</span>
                        <span><span style={sCheckbox}>{data.father?.educationLevel === "Chưa tốt nghiệp PTTH" ? '☑' : '☐'}</span>Chưa tốt nghiệp PTTH</span>
                    </td>
                </tr>
            </tbody></table>
            
             {/* ME */}
            <div style={{marginTop: '10px'}}>- <b>Họ và tên MẸ:</b> <span style={sValue}>{data.mother?.fullName?.toUpperCase()}</span> <span style={{marginLeft: '30px'}}>Ngày sinh: <span style={sValue}>{data.mother?.birthDate}</span></span></div>
            <table style={sTable}><tbody>
                <tr><td style={{...sLabel, width: '150px'}}>- Địa chỉ thường trú:</td><td style={sValue} colSpan={3}>{displayVal(data.mother?.address)}</td></tr>
                <tr>
                    <td style={{...sLabel, width: '150px'}}>- Số điện thoại:</td>
                    <td style={{...sValue, width: '150px'}}>{displayVal(data.mother?.phone)}</td>
                    <td style={{...sLabel, width: '100px', textAlign:'right'}}>Nghề nghiệp:</td>
                    <td style={{...sValue}}>{displayVal(data.mother?.job)}</td>
                </tr>
                <tr>
                    <td style={sLabel}>- Trình độ học vấn:</td>
                    <td colSpan={3} style={sValue}>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.mother?.educationLevel === "Sau đại học" ? '☑' : '☐'}</span>Sau đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.mother?.educationLevel === "Đại học" ? '☑' : '☐'}</span>Đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.mother?.educationLevel === "Cao đẳng" ? '☑' : '☐'}</span>Cao đẳng</span>
                        <span><span style={sCheckbox}>{data.mother?.educationLevel === "Trung cấp" ? '☑' : '☐'}</span>Trung cấp</span><br/>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.mother?.educationLevel === "Phổ thông trung học" ? '☑' : '☐'}</span>Phổ thông trung học</span>
                        <span><span style={sCheckbox}>{data.mother?.educationLevel === "Chưa tốt nghiệp PTTH" ? '☑' : '☐'}</span>Chưa tốt nghiệp PTTH</span>
                    </td>
                </tr>
            </tbody></table>

            {/* SPOUSE */}
            <div style={{marginTop: '10px'}}>- <b>Họ và tên CHỒNG/VỢ:</b> <span style={sValue}>{data.spouse?.fullName?.toUpperCase()}</span> <span style={{marginLeft: '30px'}}>Ngày sinh: <span style={sValue}>{data.spouse?.birthDate}</span></span></div>
            <table style={sTable}><tbody>
                <tr><td style={{...sLabel, width: '150px'}}>- Địa chỉ thường trú:</td><td style={sValue} colSpan={3}>{displayVal(data.spouse?.address)}</td></tr>
                <tr>
                    <td style={{...sLabel, width: '150px'}}>- Số điện thoại:</td>
                    <td style={{...sValue, width: '150px'}}>{displayVal(data.spouse?.phone)}</td>
                    <td style={{...sLabel, width: '100px', textAlign:'right'}}>Nghề nghiệp:</td>
                    <td style={{...sValue}}>{displayVal(data.spouse?.job)}</td>
                </tr>
                <tr>
                    <td style={sLabel}>- Trình độ học vấn:</td>
                    <td colSpan={3} style={sValue}>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.spouse?.educationLevel === "Sau đại học" ? '☑' : '☐'}</span>Sau đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.spouse?.educationLevel === "Đại học" ? '☑' : '☐'}</span>Đại học</span>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.spouse?.educationLevel === "Cao đẳng" ? '☑' : '☐'}</span>Cao đẳng</span>
                        <span><span style={sCheckbox}>{data.spouse?.educationLevel === "Trung cấp" ? '☑' : '☐'}</span>Trung cấp</span><br/>
                        <span style={{marginRight:'15px'}}><span style={sCheckbox}>{data.spouse?.educationLevel === "Phổ thông trung học" ? '☑' : '☐'}</span>Phổ thông trung học</span>
                        <span><span style={sCheckbox}>{data.spouse?.educationLevel === "Chưa tốt nghiệp PTTH" ? '☑' : '☐'}</span>Chưa tốt nghiệp PTTH</span>
                    </td>
                </tr>
            </tbody></table>

            <div style={{marginTop:'20px'}}>
                <div style={{textAlign:'left'}}>Tôi xin cam đoan những lời khai trên là đúng sự thật. Tôi xin chịu mọi trách nhiệm trước Pháp luật nếu kê khai không trung thực, chính xác./.</div>
                <table style={{width:'100%', marginTop:'15px'}} className="section-block">
                    <tbody>
                        <tr>
                            <td style={{width:'50%', textAlign:'center', fontWeight:'bold', verticalAlign:'top'}}>
                                XÁC NHẬN CỦA ĐỊA PHƯƠNG/<br/>
                                CƠ QUAN CÓ THẨM QUYỀN
                            </td>
                            <td style={{width:'50%', textAlign:'center', fontWeight:'bold', verticalAlign:'top'}}>
                                <div style={{fontStyle:'italic', fontWeight:'normal', marginBottom:'10px'}}>
                                    {isNCS ? "................, ngày ......... tháng ......... năm 20....." : "…..………......, ngày .......... tháng …... năm 20....."}
                                </div>
                                Ký tên<br/>
                                <span style={{fontWeight:'normal', fontStyle:'italic'}}>(Ký và ghi rõ họ tên){isNCS ? "" : "……………………………."}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
