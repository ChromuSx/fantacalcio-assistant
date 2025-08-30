// src/components/Alerts/AlertSettings.tsx
import { useState } from 'react';
import { Settings, X, Save, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { AlertConfig, PLAY_STYLE_CONFIGS, DEFAULT_ALERT_CONFIG } from '@/config/alertConfig';
import toast from 'react-hot-toast';

interface AlertSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onSave: (config: AlertConfig) => void;
}

export function AlertSettings({ isOpen, onClose, config, onSave }: AlertSettingsProps) {
  const [localConfig, setLocalConfig] = useState<AlertConfig>(config);
  
  const playStyles = [
    {
      id: 'aggressive',
      name: '🔥 Aggressivo',
      description: 'Punta sui top player, alert frequenti su scarsità'
    },
    {
      id: 'balanced',
      name: '⚖️ Bilanciato',
      description: 'Approccio equilibrato, tutti gli alert importanti'
    },
    {
      id: 'conservative',
      name: '🛡️ Conservativo',
      description: 'Focus su budget e strategie sicure'
    },
    {
      id: 'value_hunter',
      name: '💎 Cacciatore di Affari',
      description: 'Alert per occasioni e timing ottimali'
    }
  ];
  
  const handlePlayStyleChange = (style: AlertConfig['playStyle']) => {
    const styleConfig = PLAY_STYLE_CONFIGS[style];
    setLocalConfig({
      ...localConfig,
      ...styleConfig,
      playStyle: style
    });
  };
  
  const handleSave = () => {
    onSave(localConfig);
    toast.success('Impostazioni alert salvate!');
    onClose();
  };
  
  const handleReset = () => {
    setLocalConfig(DEFAULT_ALERT_CONFIG);
    toast.success('Impostazioni resettate!');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings size={24} />
            Configura Alert Intelligenti
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Play Style Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Stile di Gioco</h3>
          <div className="grid grid-cols-2 gap-3">
            {playStyles.map(style => (
              <button
                key={style.id}
                onClick={() => handlePlayStyleChange(style.id as AlertConfig['playStyle'])}
                className={clsx(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  localConfig.playStyle === style.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="font-semibold mb-1">{style.name}</div>
                <div className="text-sm text-gray-600">{style.description}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Soglie Personalizzate */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Soglie Alert</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Critico (€)
              </label>
              <input
                type="number"
                value={localConfig.thresholds.budget.critical}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  thresholds: {
                    ...localConfig.thresholds,
                    budget: {
                      ...localConfig.thresholds.budget,
                      critical: parseInt(e.target.value)
                    }
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Warning (€)
              </label>
              <input
                type="number"
                value={localConfig.thresholds.budget.warning}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  thresholds: {
                    ...localConfig.thresholds,
                    budget: {
                      ...localConfig.thresholds.budget,
                      warning: parseInt(e.target.value)
                    }
                  }
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Scarsità */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scarsità Critica (%)
              </label>
              <input
                type="number"
                value={Math.round(localConfig.thresholds.scarcity.critical * 100)}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  thresholds: {
                    ...localConfig.thresholds,
                    scarcity: {
                      ...localConfig.thresholds.scarcity,
                      critical: parseInt(e.target.value) / 100
                    }
                  }
                })}
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scarsità Warning (%)
              </label>
              <input
                type="number"
                value={Math.round(localConfig.thresholds.scarcity.warning * 100)}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  thresholds: {
                    ...localConfig.thresholds,
                    scarcity: {
                      ...localConfig.thresholds.scarcity,
                      warning: parseInt(e.target.value) / 100
                    }
                  }
                })}
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        
        {/* Comportamento */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Comportamento Alert</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localConfig.behavior.enablePredictive}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  behavior: {
                    ...localConfig.behavior,
                    enablePredictive: e.target.checked
                  }
                })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm">
                Abilita alert predittivi (previsioni basate su pattern)
              </span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localConfig.behavior.enableSound}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  behavior: {
                    ...localConfig.behavior,
                    enableSound: e.target.checked
                  }
                })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm">
                Abilita suoni per nuovi alert
              </span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={localConfig.behavior.autoDismissInfo}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  behavior: {
                    ...localConfig.behavior,
                    autoDismissInfo: e.target.checked
                  }
                })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm">
                Chiudi automaticamente alert informativi dopo {localConfig.behavior.autoDismissTimeout} secondi
              </span>
            </label>
            
            <div className="flex items-center gap-3">
              <label className="text-sm">Frequenza controllo (secondi):</label>
              <input
                type="number"
                value={localConfig.behavior.alertFrequency}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  behavior: {
                    ...localConfig.behavior,
                    alertFrequency: parseInt(e.target.value)
                  }
                })}
                min="1"
                max="60"
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm">Max alert visualizzati:</label>
              <input
                type="number"
                value={localConfig.behavior.maxAlertsDisplay}
                onChange={(e) => setLocalConfig({
                  ...localConfig,
                  behavior: {
                    ...localConfig.behavior,
                    maxAlertsDisplay: parseInt(e.target.value)
                  }
                })}
                min="5"
                max="50"
                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        
        {/* Priorità Alert */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Priorità Alert (0-10)</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(localConfig.priorityWeights).map(([category, weight]) => (
              <div key={category} className="flex items-center gap-3">
                <label className="text-sm capitalize flex-1">{category}:</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={weight * 10}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    priorityWeights: {
                      ...localConfig.priorityWeights,
                      [category]: parseFloat(e.target.value) / 10
                    }
                  })}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12 text-right">
                  {(weight * 10).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset Default
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
            >
              <Save size={18} />
              Salva Impostazioni
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}