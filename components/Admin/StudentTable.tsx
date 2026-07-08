
import React, { useState } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, Trash2, AlertTriangle } from 'lucide-react';
import { StudentType } from '../../types';

interface StudentTableProps {
  students: any[];
  onView: (student: any) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected' | 'submitted') => void;
  onDelete: (id: string) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onView, onUpdateStatus, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | StudentType>('ALL');

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cccd.includes(searchTerm);
    
    const matchesType = filterType === 'ALL' || s.studentType === filterType;
    
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'submitted': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">Đã nộp</span>;
      case 'approved': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">Hợp lệ</span>;
      case 'rejected': return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">Từ chối</span>;
      default: return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200">Chưa điền</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã HV hoặc CCCD..."
            className="block w-full pl-11 pr-4 py-3 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-due-blue/5 focus:border-due-blue outline-none transition-all font-medium text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-due-blue font-bold text-xs uppercase tracking-widest text-slate-600 bg-white"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
        >
          <option value="ALL">Tất cả đối tượng</option>
          <option value={StudentType.CAO_HOC}>Cao học</option>
          <option value={StudentType.NCS}>Nghiên cứu sinh</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Học viên / Liên hệ</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã HV / CCCD</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngành đào tạo</th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác Quản trị</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-xl bg-due-blue/10 text-due-blue flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 transition-transform">
                      {student.fullName.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{student.fullName}</div>
                      <div className="text-xs text-slate-400 font-medium">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-700">{student.id}</div>
                  <div className="text-xs text-slate-400 font-mono">{student.cccd}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-slate-700">{student.major}</div>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${student.studentType === StudentType.CAO_HOC ? 'text-due-blue' : 'text-due-red'}`}>
                    {student.studentType === StudentType.CAO_HOC ? 'Học viên Cao học' : 'Nghiên cứu sinh'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStatusBadge(student.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                    <button 
                      onClick={() => onView(student)}
                      className="p-2 text-slate-400 hover:text-due-blue hover:bg-due-light rounded-xl transition-all" 
                      title="Xem chi tiết phiếu"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(student.id, 'approved')}
                      disabled={student.status === 'approved'}
                      className={`p-2 rounded-xl transition-all ${student.status === 'approved' ? 'text-green-500 bg-green-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                      title="Duyệt hợp lệ"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(student.id, 'rejected')}
                      disabled={student.status === 'rejected'}
                      className={`p-2 rounded-xl transition-all ${student.status === 'rejected' ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                      title="Yêu cầu bổ sung (Từ chối)"
                    >
                      <XCircle size={18} />
                    </button>
                    <div className="w-px h-6 bg-slate-100 mx-1 self-center"></div>
                    <button 
                      onClick={() => onDelete(student.id)}
                      className="p-2 text-slate-300 hover:text-due-red hover:bg-red-50 rounded-xl transition-all" 
                      title="Xóa khỏi danh sách"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <AlertTriangle size={48} />
                    <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy dữ liệu học viên</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
