
import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ProcessedFile } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Download, 
  BarChart3,
  ArrowDown
} from 'lucide-react';

interface BatchStatusProps {
  files: ProcessedFile[];
}

export const BatchStatus: React.FC<BatchStatusProps> = ({ files }) => {
  const { t } = useTranslation();

  const stats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'failed').length,
  };

  const totalOriginal = files.reduce((acc, f) => acc + f.metadata.originalSize, 0);
  const totalProcessed = files.reduce((acc, f) => acc + (f.metadata.processedSize || f.metadata.originalSize), 0);
  const reduction = totalOriginal > 0 ? ((totalOriginal - totalProcessed) / totalOriginal * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('totalFiles')}</div>
          <div className="text-2xl font-black text-indigo-600">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('completed')}</div>
          <div className="text-2xl font-black text-green-500">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('privacyScore')}</div>
          <div className="flex items-center justify-center gap-1">
             <Shield className="w-5 h-5 text-indigo-500" />
             <span className="text-2xl font-black text-indigo-500">
               {stats.completed > 0 ? (stats.completed === stats.total ? 'High' : 'Med') : 'N/A'}
             </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('sizeReduction')}</div>
          <div className="flex items-center justify-center gap-1 text-purple-600">
            <ArrowDown className="w-4 h-4" />
            <span className="text-2xl font-black">{reduction}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
