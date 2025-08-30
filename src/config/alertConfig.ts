// src/config/alertConfig.ts

export interface AlertConfig {
  // Soglie per generazione alert
  thresholds: {
    budget: {
      critical: number;  // Budget sotto questo valore = critico
      warning: number;   // Budget sotto questo valore = warning
    };
    scarcity: {
      critical: number;  // Scarsità sopra questo valore = critico (0-1)
      warning: number;   // Scarsità sopra questo valore = warning
    };
    velocity: {
      fast: number;      // Acquisti/minuto sopra questo = veloce
      slow: number;      // Acquisti/minuto sotto questo = lento
    };
    priceInflation: {
      high: number;      // Inflazione sopra questo % = alta
      low: number;       // Inflazione sotto questo % = bassa
    };
  };
  
  // Personalizzazione comportamento
  behavior: {
    enablePredictive: boolean;     // Abilita alert predittivi
    enableSound: boolean;           // Suoni di default
    alertFrequency: number;         // Secondi tra check degli alert
    maxAlertsDisplay: number;       // Max alert visualizzati
    autoDismissInfo: boolean;       // Dismetti auto alert info dopo X secondi
    autoDismissTimeout: number;     // Secondi per auto-dismiss
  };
  
  // Personalizzazione per stile di gioco
  playStyle: 'aggressive' | 'balanced' | 'conservative' | 'value_hunter';
  
  // Pesi per priorità alert basati su stile
  priorityWeights: {
    budget: number;
    scarcity: number;
    timing: number;
    competition: number;
    strategy: number;
  };
}

// Configurazioni predefinite per stile di gioco
export const PLAY_STYLE_CONFIGS: Record<AlertConfig['playStyle'], Partial<AlertConfig>> = {
  aggressive: {
    thresholds: {
      budget: { critical: 30, warning: 80 },
      scarcity: { critical: 0.8, warning: 0.6 },
      velocity: { fast: 3, slow: 0.5 },
      priceInflation: { high: 1.2, low: 0.9 }
    },
    priorityWeights: {
      budget: 0.6,
      scarcity: 1.0,
      timing: 0.9,
      competition: 1.0,
      strategy: 0.7
    }
  },
  
  balanced: {
    thresholds: {
      budget: { critical: 50, warning: 100 },
      scarcity: { critical: 0.85, warning: 0.7 },
      velocity: { fast: 2, slow: 0.3 },
      priceInflation: { high: 1.3, low: 0.85 }
    },
    priorityWeights: {
      budget: 0.8,
      scarcity: 0.8,
      timing: 0.8,
      competition: 0.8,
      strategy: 0.8
    }
  },
  
  conservative: {
    thresholds: {
      budget: { critical: 70, warning: 150 },
      scarcity: { critical: 0.9, warning: 0.75 },
      velocity: { fast: 1.5, slow: 0.2 },
      priceInflation: { high: 1.4, low: 0.8 }
    },
    priorityWeights: {
      budget: 1.0,
      scarcity: 0.6,
      timing: 0.6,
      competition: 0.5,
      strategy: 0.9
    }
  },
  
  value_hunter: {
    thresholds: {
      budget: { critical: 40, warning: 90 },
      scarcity: { critical: 0.95, warning: 0.85 },
      velocity: { fast: 2.5, slow: 0.4 },
      priceInflation: { high: 1.1, low: 0.95 }
    },
    priorityWeights: {
      budget: 0.9,
      scarcity: 0.5,
      timing: 1.0,
      competition: 0.4,
      strategy: 1.0
    }
  }
};

// Configurazione di default
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  ...PLAY_STYLE_CONFIGS.balanced,
  behavior: {
    enablePredictive: true,
    enableSound: true,
    alertFrequency: 5,
    maxAlertsDisplay: 10,
    autoDismissInfo: true,
    autoDismissTimeout: 30
  },
  playStyle: 'balanced'
} as AlertConfig;

// Helper per ottenere messaggi personalizzati basati su stile
export const getStyleMessage = (playStyle: AlertConfig['playStyle'], situation: string): string => {
  const messages = {
    aggressive: {
      lowBudget: "Hai speso tanto ma ne è valsa la pena! Ora caccia alle occasioni.",
      highScarcity: "I top player stanno finendo - AGISCI ORA o accontentati!",
      opportunity: "OCCASIONE! Non pensarci troppo, i migliori rischiano.",
      competition: "Combatti per questo giocatore! Non mollare facilmente."
    },
    conservative: {
      lowBudget: "Budget ben gestito. Continua con acquisti mirati sotto i 15€.",
      highScarcity: "Valuta alternative più economiche, non farti prendere dal panico.",
      opportunity: "Interessante, ma assicurati che sia davvero un affare.",
      competition: "Lascia che si scannino, tu punta su alternative valide."
    },
    balanced: {
      lowBudget: "Gestisci bene gli ultimi crediti per completare la rosa.",
      highScarcity: "Valuta se vale la pena competere o passare alle alternative.",
      opportunity: "Buona occasione! Valuta in base alle tue necessità.",
      competition: "Decidi un prezzo massimo e non superarlo."
    },
    value_hunter: {
      lowBudget: "Perfetto! Ora è il momento migliore per gli affari.",
      highScarcity: "Ignora i top, cerca i diamanti grezzi sottovalutati.",
      opportunity: "AFFARE DETECTED! Questo è il tuo momento.",
      competition: "Lascia perdere se il prezzo sale, ci sono altre occasioni."
    }
  };
  
  return messages[playStyle]?.[situation as keyof typeof messages.aggressive] || '';
};

// Factory per creare alert personalizzati
export class AlertFactory {
  constructor(private config: AlertConfig) {}
  
  adjustPriority(basePriority: number, category: SmartAlert['category']): number {
    const weight = this.config.priorityWeights[category] || 1;
    return Math.round(basePriority * weight);
  }
  
  shouldGenerateAlert(
    type: 'budget' | 'scarcity' | 'velocity' | 'inflation',
    value: number
  ): { generate: boolean; level: 'critical' | 'warning' | 'info' | null } {
    const thresholds = this.config.thresholds;
    
    switch(type) {
      case 'budget':
        if (value <= thresholds.budget.critical) 
          return { generate: true, level: 'critical' };
        if (value <= thresholds.budget.warning) 
          return { generate: true, level: 'warning' };
        break;
        
      case 'scarcity':
        if (value >= thresholds.scarcity.critical) 
          return { generate: true, level: 'critical' };
        if (value >= thresholds.scarcity.warning) 
          return { generate: true, level: 'warning' };
        break;
        
      case 'velocity':
        if (value >= thresholds.velocity.fast) 
          return { generate: true, level: 'info' };
        if (value <= thresholds.velocity.slow) 
          return { generate: true, level: 'info' };
        break;
        
      case 'inflation':
        if (value >= thresholds.priceInflation.high) 
          return { generate: true, level: 'warning' };
        if (value <= thresholds.priceInflation.low) 
          return { generate: true, level: 'opportunity' };
        break;
    }
    
    return { generate: false, level: null };
  }
  
  personalizeMessage(baseMessage: string, situation: string): string {
    const styleMessage = getStyleMessage(this.config.playStyle, situation);
    return styleMessage ? `${baseMessage} ${styleMessage}` : baseMessage;
  }
}