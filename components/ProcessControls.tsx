
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Settings, Shield, Calendar, MapPin, Zap, HelpCircle } from 'lucide-react';
import { ProcessOptions } from '../types';

interface ProcessControlsProps {
  onProcess: (options: ProcessOptions) => void;
  isProcessing: boolean;
}

export const ProcessControls: React.FC<ProcessControlsProps> = ({
  onProcess,
  isProcessing,
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ProcessOptions>({
    safeMode: true,
    removeGPS: true,
    changeDates: false,
    generateFakeData: false,
    preserveQuality: true,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleOptionChange = (key: keyof ProcessOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const presets = [
    {
      id: 'privacy',
      name: t('privacyPreset'),
      icon: <Shield className="w-4 h-4" />,
      options: { safeMode: true, removeGPS: true, changeDates: true, generateFakeData: false, preserveQuality: true }
    },
    {
      id: 'social',
      name: t('socialMediaPreset'),
      icon: <Zap className="w-4 h-4" />,
      options: { safeMode: true, removeGPS: true, changeDates: false, generateFakeData: true, preserveQuality: false }
    },
    {
      id: 'minimal',
      name: t('minimalPreset'),
      icon: <Settings className="w-4 h-4" />,
      options: { safeMode: false, removeGPS: true, changeDates: false, generateFakeData: false, preserveQuality: true }
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-slate-800">{t('processingOptions')}</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Settings className={`w-4 h-4 ${showAdvanced ? 'rotate-180' : ''} transition-transform`} />
          <span>{showAdvanced ? t('hideAdvanced') : t('showAdvanced')}</span>
        </button>
      </div>

      <div className="mb-8">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('quickPresets')}</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => setOptions(preset.options as ProcessOptions)}
              className="flex items-center justify-center gap-2 p-4 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all font-bold text-xs"
            >
              {preset.icon}
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><Shield className="w-5 h-5" /></div>
            <div>
              <label className="font-bold text-slate-700 block text-sm">{t('safeMode')}</label>
              <p className="text-[11px] text-slate-400">{t('safeModeDesc')}</p>
            </div>
          </div>
          <input type="checkbox" checked={options.safeMode} onChange={() => handleOptionChange('safeMode')} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl text-red-600"><MapPin className="w-5 h-5" /></div>
            <div>
              <label className="font-bold text-slate-700 block text-sm">{t('removeGPS')}</label>
              <p className="text-[11px] text-slate-400">{t('removeGPSDesc')}</p>
            </div>
          </div>
          <input type="checkbox" checked={options.removeGPS} onChange={() => handleOptionChange('removeGPS')} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Calendar className="w-5 h-5" /></div>
            <div>
              <label className="font-bold text-slate-700 block text-sm">{t('changeDates')}</label>
              <p className="text-[11px] text-slate-400">{t('changeDatesDesc')}</p>
            </div>
          </div>
          <input type="checkbox" checked={options.changeDates} onChange={() => handleOptionChange('changeDates')} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600"><Zap className="w-5 h-5" /></div>
              <div>
                <label className="font-bold text-slate-700 block text-sm">{t('generateFakeData')}</label>
                <p className="text-[11px] text-slate-400">{t('generateFakeDataDesc')}</p>
              </div>
            </div>
            <input type="checkbox" checked={options.generateFakeData} onChange={() => handleOptionChange('generateFakeData')} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><HelpCircle className="w-5 h-5" /></div>
              <div>
                <label className="font-bold text-slate-700 block text-sm">{t('preserveQuality')}</label>
                <p className="text-[11px] text-slate-400">{t('preserveQualityDesc')}</p>
              </div>
            </div>
            <input type="checkbox" checked={options.preserveQuality} onChange={() => handleOptionChange('preserveQuality')} className="w-6 h-6 accent-indigo-600 cursor-pointer" />
          </div>
        </div>
      )}

      <button
        onClick={() => onProcess(options)}
        disabled={isProcessing}
        className={`
          w-full mt-12 py-5 px-6 rounded-2xl font-black text-lg transition-all shadow-xl
          ${isProcessing
            ? 'bg-slate-300 cursor-not-allowed text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 text-white active:scale-95'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-4">
            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <span>{t('processing')}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <Shield className="w-6 h-6" />
            <span>{t('startProcessing')}</span>
          </div>
        )}
      </button>
    </div>
  );
};
