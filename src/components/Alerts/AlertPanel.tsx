// src/components/Alerts/AlertPanel.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bell, X, AlertTriangle, Info, TrendingUp, 
  AlertCircle, ChevronDown, ChevronUp, Zap,
  Eye, Clock, Target, DollarSign, Users,
  Volume2, VolumeX
} from 'lucide-react';
import clsx from 'clsx';
import { alertSystem, SmartAlert } from '@/utils/alertSystem';
import { useAuctionStore } from '@/stores/auctionStore';
import toast from 'react-hot-toast';
import { AlertConfig, DEFAULT_ALERT_CONFIG } from '@/config/alertConfig';

interface AlertPanelProps {
  config?: AlertConfig;
}

export function AlertPanel({ config = DEFAULT_ALERT_CONFIG }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'all' | SmartAlert['level']>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [pulseNew, setPulseNew] = useState(false);
  
  const { selectedPlayer } = useAuctionStore();
  
  // Polling per nuovi alert
  useEffect(() => {
    const updateAlerts = () => {
        alertSystem.setConfig(config);

      // Genera alert contestuali
      const contextAlerts = alertSystem.analyzeCurrentState();
      const predictiveAlerts = alertSystem.generatePredictiveAlerts();
      const activeAlerts = alertSystem.getActiveAlerts();
      
      // Combina tutti gli alert
      const allAlerts = [...activeAlerts, ...contextAlerts, ...predictiveAlerts];
      
      // Filtra i già dismessi
      const filteredAlerts = allAlerts.filter(a => !dismissedIds.has(a.id));
      
      // Rileva nuovi alert
      const newAlertCount = filteredAlerts.filter(a => 
        !alerts.some(existing => existing.id === a.id)
      ).length;
      
      if (newAlertCount > 0) {
        setPulseNew(true);
        setTimeout(() => setPulseNew(false), 1000);
        
        // Notifica toast per alert critici
        const criticalNew = filteredAlerts.find(a => 
          a.level === 'critical' && !alerts.some(e => e.id === a.id)
        );
        
        if (criticalNew) {
          toast(criticalNew.title, {
            icon: '🚨',
            duration: 5000
          });
        }
      }
      
      setAlerts(filteredAlerts);
    };
    
    updateAlerts();
    const interval = setInterval(updateAlerts, 5000); // Aggiorna ogni 5 secondi
    
    return () => clearInterval(interval);
}, [alerts, dismissedIds, selectedPlayer, config])
  
  const handleDismiss = useCallback((alertId: string) => {
    alertSystem.dismissAlert(alertId);
    setDismissedIds(prev => new Set(prev).add(alertId));
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);
  
  const handleAction = useCallback((alert: SmartAlert) => {
    if (alert.actionable?.action) {
      alert.actionable.action();
      toast.success('Azione eseguita!');
    }
  }, []);
  
  // Filtra alert per livello
  const filteredAlerts = filterLevel === 'all' 
    ? alerts 
    : alerts.filter(a => a.level === filterLevel);
  
  // Conta per livello
  const levelCounts = {
    critical: alerts.filter(a => a.level === 'critical').length,
    warning: alerts.filter(a => a.level === 'warning').length,
    opportunity: alerts.filter(a => a.level === 'opportunity').length,
    info: alerts.filter(a => a.level === 'info').length
  };
  
  const totalAlerts = alerts.length;
  
  const getLevelIcon = (level: SmartAlert['level']) => {
    switch(level) {
      case 'critical': return <AlertCircle className="text-red-600" size={18} />;
      case 'warning': return <AlertTriangle className="text-orange-600" size={18} />;
      case 'opportunity': return <TrendingUp className="text-green-600" size={18} />;
      case 'info': return <Info className="text-blue-600" size={18} />;
    }
  };
  
  const getCategoryIcon = (category: SmartAlert['category']) => {
    switch(category) {
      case 'budget': return <DollarSign size={14} />;
      case 'strategy': return <Target size={14} />;
      case 'timing': return <Clock size={14} />;
      case 'competition': return <Users size={14} />;
      case 'scarcity': return <AlertCircle size={14} />;
    }
  };
  
  const getLevelStyle = (level: SmartAlert['level']) => {
    switch(level) {
      case 'critical': return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'warning': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'opportunity': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'info': return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
    }
  };
  
  if (totalAlerts === 0 && !isExpanded) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div 
        className={clsx(
          "px-4 py-3 flex justify-between items-center cursor-pointer transition-all",
          "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
          pulseNew && "animate-pulse"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bell size={20} className={clsx(totalAlerts > 0 && "animate-bounce")} />
          <h3 className="font-bold">
            Alert Intelligenti
            {totalAlerts > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                {totalAlerts}
              </span>
            )}
          </h3>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quick stats */}
          {totalAlerts > 0 && (
            <div className="flex gap-2 text-sm">
              {levelCounts.critical > 0 && (
                <span className="px-2 py-1 bg-red-500 rounded">
                  {levelCounts.critical}
                </span>
              )}
              {levelCounts.warning > 0 && (
                <span className="px-2 py-1 bg-orange-500 rounded">
                  {levelCounts.warning}
                </span>
              )}
              {levelCounts.opportunity > 0 && (
                <span className="px-2 py-1 bg-green-500 rounded">
                  {levelCounts.opportunity}
                </span>
              )}
            </div>
          )}
          
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {isExpanded && (
        <>
          {/* Filters */}
          {totalAlerts > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-b flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setFilterLevel('all'); }}
                className={clsx(
                  "px-3 py-1 rounded text-sm transition",
                  filterLevel === 'all' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white hover:bg-gray-100'
                )}
              >
                Tutti ({totalAlerts})
              </button>
              
              {Object.entries(levelCounts).map(([level, count]) => (
                count > 0 && (
                  <button
                    key={level}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setFilterLevel(level as SmartAlert['level']); 
                    }}
                    className={clsx(
                      "px-3 py-1 rounded text-sm transition flex items-center gap-1",
                      filterLevel === level 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white hover:bg-gray-100'
                    )}
                  >
                    {getLevelIcon(level as SmartAlert['level'])}
                    {count}
                  </button>
                )
              ))}
              
              {dismissedIds.size > 0 && (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setDismissedIds(new Set());
                  }}
                  className="ml-auto px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Mostra dismessi ({dismissedIds.size})
                </button>
              )}
            </div>
          )}
          
          {/* Alert List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredAlerts.length > 0 ? (
              <div className="p-2 space-y-2">
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={clsx(
                      "p-3 rounded-lg border transition-all animate-in fade-in slide-in-from-top-1",
                      getLevelStyle(alert.level)
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getLevelIcon(alert.level)}
                          <span className="font-semibold">{alert.title}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            {getCategoryIcon(alert.category)}
                            {alert.category}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">
                          {alert.message}
                        </p>
                        
                        {/* Metadata e confidence */}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Zap size={12} />
                            {alert.confidence}% confidence
                          </span>
                          {alert.ttl && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              Scade tra {Math.floor(alert.ttl / 60)}min
                            </span>
                          )}
                          {alert.metadata?.reasoning && (
                            <span className="italic">
                              ({alert.metadata.reasoning})
                            </span>
                          )}
                        </div>
                        
                        {/* Actionable */}
                        {alert.actionable && (
                          <div className="mt-2 pt-2 border-t border-current/10">
                            <button
                              onClick={() => handleAction(alert)}
                              className="px-3 py-1 bg-white/50 hover:bg-white rounded text-sm font-medium transition"
                            >
                              {alert.actionable.suggestion} →
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(alert.id);
                        }}
                        className="ml-2 p-1 hover:bg-white/50 rounded transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Eye size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {filterLevel !== 'all' 
                    ? `Nessun alert di tipo ${filterLevel}`
                    : 'Nessun alert attivo al momento'
                  }
                </p>
                <p className="text-xs mt-1">
                  Il sistema monitora costantemente l'asta
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}