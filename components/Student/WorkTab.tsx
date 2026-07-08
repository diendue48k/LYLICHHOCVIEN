
import React from 'react';
import { Plus, Trash2, Award } from 'lucide-react';
import { StudentType, SystemConfig } from '../../types';

interface WorkTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
  isReadOnly: boolean;
  // Added config and errors properties to match StudentForm usage
  config: SystemConfig;
  errors: string[];
}

// Destructured config and errors to satisfy prop checking
const WorkTab: React.FC<WorkTabProps> = ({ data, onChange, isReadOnly, config, errors }) => {
  const addWorkRow = () => {
    const next = [...(data.workHistory || []), { id: Date.now().toString(), timeRange: '', organization: '', position: '' }];
    onChange('workHistory', next);
  };

  const removeWorkRow = (id: string) => {
    const next = data.workHistory.filter((w: any) => w.id !== id);
    onChange('workHistory', next);
  };

  const handleWorkUpdate = (index: number, field: string, value: string) => {
    const next = [...data.workHistory];
    next[index][field] = value;
    onChange('workHistory', next);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {data.studentType === StudentType.NCS ? 'VI' : 'V'}. Quá trình công tác chuyên môn (Kể từ khi tốt nghiệp ĐH)
            </h4>
          </div>
          {!isReadOnly && (
            <button 
              type="button" 
              onClick={addWorkRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-due-blue/10 text-due-blue rounded-md font-semibold hover:bg-due-blue hover:text-white transition-all text-xs"
            >
              <Plus size={14} /> Thêm dòng
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="border-r border-slate-200 p-3 text-xs font-semibold text-slate-600 text-left">Thời gian</th>
                <th className="border-r border-slate-200 p-3 text-xs font-semibold text-slate-600 text-left">Đơn vị công tác</th>
                <th className="border-r border-slate-200 p-3 text-xs font-semibold text-slate-600 text-left">Chức vụ, công việc đảm nhiệm</th>
                {!isReadOnly && <th className="p-3 w-10"></th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {data.workHistory?.map((row: any, index: number) => (
                <tr key={row.id}>
                  <td className="border-r border-slate-100 p-1.5"><input className="w-full p-1.5 bg-transparent font-medium text-slate-700 outline-none text-sm focus:bg-slate-50 rounded" value={row.timeRange} onChange={(e) => handleWorkUpdate(index, 'timeRange', e.target.value)} disabled={isReadOnly} /></td>
                  <td className="border-r border-slate-100 p-1.5"><input className="w-full p-1.5 bg-transparent font-medium text-slate-700 outline-none text-sm focus:bg-slate-50 rounded" value={row.organization} onChange={(e) => handleWorkUpdate(index, 'organization', e.target.value)} disabled={isReadOnly} /></td>
                  <td className="border-r border-slate-100 p-1.5"><input className="w-full p-1.5 bg-transparent font-medium text-slate-700 outline-none text-sm focus:bg-slate-50 rounded" value={row.position} onChange={(e) => handleWorkUpdate(index, 'position', e.target.value)} disabled={isReadOnly} /></td>
                  {!isReadOnly && (
                    <td className="p-1.5 text-center">
                      <button type="button" onClick={() => removeWorkRow(row.id)} className="p-1.5 text-slate-400 hover:text-due-red rounded-md hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <div className="w-8 h-8 bg-due-blue/10 rounded-lg flex items-center justify-center text-due-blue">
              <Award size={16} />
           </div>
           <div>
             <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{data.studentType === StudentType.NCS ? 'VII' : 'VI'}. Các công trình khoa học đã công bố</h4>
           </div>
        </div>
        <textarea 
          className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-due-blue/10 focus:border-due-blue transition-all font-medium text-slate-700 resize-none text-sm"
          placeholder="Danh sách các bài báo, tạp chí, hội thảo..."
          value={data.scientificWorks?.join('\n') || ''}
          onChange={(e) => onChange('scientificWorks', e.target.value.split('\n'))}
          disabled={isReadOnly}
        />
      </div>
    </div>
  );
};

export default WorkTab;
