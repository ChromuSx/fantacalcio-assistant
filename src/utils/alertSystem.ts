// src/utils/alertSystem.ts
import { Player, Role, AuctionConfig } from '@/types';
import { useAuctionStore } from '@/stores/auctionStore';
import { AlertConfig, DEFAULT_ALERT_CONFIG } from '@/config/alertConfig';

// Tipi per il sistema di alert
export interface SmartAlert {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'critical' | 'opportunity';
  category: 'budget' | 'strategy' | 'timing' | 'competition' | 'scarcity';
  
  title: string;
  message: string;
  
  confidence: number; // 0-100
  priority: number;   // 1-10 per ordinamento
  ttl?: number;       // Secondi di vita dell'alert
  
  actionable?: {
    suggestion: string;
    action?: () => void;
  };
  
  metadata?: {
    playerId?: number;
    role?: Role;
    teamName?: string;
    reasoning?: string;
  };
}

export interface MarketMetrics {
  purchaseVelocity: {
    last5min: number;
    last10min: number;
    last30min: number;
    trend: 'accelerating' | 'stable' | 'slowing';
  };
  
  priceInflation: Record<Role, number>;
  scarcityIndex: Record<Role, number>;
  
  avgPriceByRole: Record<Role, number>;
  topPlayersRemaining: Record<Role, number>;
  
  competitorProfiles: Map<string, CompetitorProfile>;
}

interface CompetitorProfile {
  name: string;
  spendingPattern: 'aggressive' | 'conservative' | 'balanced';
  avgPurchasePrice: number;
  budgetRemaining: number;
  preferredRoles: Role[];
  lastPurchaseTime?: Date;
}

export class AlertIntelligence {
  private alerts: SmartAlert[] = [];
  private purchaseHistory: Array<{player: Player; price: number; owner: string; timestamp: Date}> = [];
  private marketMetrics: MarketMetrics;
  private alertIdCounter = 0;
  private config: AlertConfig = DEFAULT_ALERT_CONFIG;

  constructor() {
    this.marketMetrics = this.initializeMetrics();
  }

  setConfig(config: AlertConfig) {
    this.config = config;
  }
  
  private initializeMetrics(): MarketMetrics {
    return {
      purchaseVelocity: {
        last5min: 0,
        last10min: 0,
        last30min: 0,
        trend: 'stable'
      },
      priceInflation: { P: 1.0, D: 1.0, C: 1.0, A: 1.0 },
      scarcityIndex: { P: 0, D: 0, C: 0, A: 0 },
      avgPriceByRole: { P: 0, D: 0, C: 0, A: 0 },
      topPlayersRemaining: { P: 0, D: 0, C: 0, A: 0 },
      competitorProfiles: new Map()
    };
  }
  
  // Registra un acquisto e aggiorna metriche
  recordPurchase(player: Player, price: number, owner: string) {
    const purchase = {
      player,
      price,
      owner,
      timestamp: new Date()
    };
    
    this.purchaseHistory.push(purchase);
    this.updateMarketMetrics();
    this.updateCompetitorProfile(owner, player, price);
    
    // Genera alert basati sul nuovo acquisto
    this.generatePurchaseAlerts(purchase);
  }
  
  // Aggiorna tutte le metriche di mercato
  private updateMarketMetrics() {
    const now = new Date();
    const state = useAuctionStore.getState();
    
    // Calcola velocity
    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    this.marketMetrics.purchaseVelocity = {
      last5min: this.purchaseHistory.filter(p => p.timestamp > fiveMinAgo).length,
      last10min: this.purchaseHistory.filter(p => p.timestamp > tenMinAgo).length,
      last30min: this.purchaseHistory.filter(p => p.timestamp > thirtyMinAgo).length,
      trend: this.calculateVelocityTrend()
    };
    
    // Calcola scarsità per ruolo
    const roles: Role[] = ['P', 'D', 'C', 'A'];
    roles.forEach(role => {
      const available = state.players.filter(p => p.ruolo === role && p.status === 'available');
      const total = state.players.filter(p => p.ruolo === role);
      const topAvailable = available.filter(p => p.convenienzaPotenziale > 70).length;
      
      this.marketMetrics.scarcityIndex[role] = 1 - (available.length / total.length);
      this.marketMetrics.topPlayersRemaining[role] = topAvailable;
      
      // Calcola inflazione prezzi
      const recentPurchases = this.purchaseHistory
        .filter(p => p.player.ruolo === role && p.timestamp > thirtyMinAgo);
      
      if (recentPurchases.length > 0) {
        const avgPaid = recentPurchases.reduce((sum, p) => sum + p.price, 0) / recentPurchases.length;
        const avgExpected = recentPurchases.reduce((sum, p) => 
          sum + state.calculateMaxPrice(p.player), 0) / recentPurchases.length;
        
        this.marketMetrics.priceInflation[role] = avgExpected > 0 ? avgPaid / avgExpected : 1;
      }
    });
  }
  
  private calculateVelocityTrend(): 'accelerating' | 'stable' | 'slowing' {
    const v = this.marketMetrics.purchaseVelocity;
    const recentRate = v.last5min / 5;
    const midRate = (v.last10min - v.last5min) / 5;
    
    if (recentRate > midRate * 1.3) return 'accelerating';
    if (recentRate < midRate * 0.7) return 'slowing';
    return 'stable';
  }
  
  private updateCompetitorProfile(owner: string, player: Player, price: number) {
    if (owner === 'me') return;
    
    let profile = this.marketMetrics.competitorProfiles.get(owner);
    if (!profile) {
      profile = {
        name: owner,
        spendingPattern: 'balanced',
        avgPurchasePrice: price,
        budgetRemaining: 500, // Assumiamo budget standard
        preferredRoles: [player.ruolo],
        lastPurchaseTime: new Date()
      };
      this.marketMetrics.competitorProfiles.set(owner, profile);
    } else {
      // Aggiorna profilo esistente
      const purchases = this.purchaseHistory.filter(p => p.owner === owner);
      profile.avgPurchasePrice = purchases.reduce((sum, p) => sum + p.price, 0) / purchases.length;
      profile.budgetRemaining -= price;
      profile.lastPurchaseTime = new Date();
      
      // Aggiorna pattern di spesa
      if (profile.avgPurchasePrice > 40) profile.spendingPattern = 'aggressive';
      else if (profile.avgPurchasePrice < 20) profile.spendingPattern = 'conservative';
      else profile.spendingPattern = 'balanced';
      
      // Aggiorna ruoli preferiti
      if (!profile.preferredRoles.includes(player.ruolo)) {
        profile.preferredRoles.push(player.ruolo);
      }
    }
  }
  
  // GENERATORI DI ALERT
  
  private generatePurchaseAlerts(purchase: {player: Player; price: number; owner: string}) {
    const state = useAuctionStore.getState();
    
    // Alert se un giocatore della watchlist è stato preso
    if (purchase.owner !== 'me') {
      const inWatchlist = state.watchlists.some(w => 
        w.playerIds.includes(purchase.player.id)
      );
      
      if (inWatchlist) {
        this.addAlert({
          level: 'warning',
          category: 'competition',
          title: '⚠️ Watchlist Alert',
          message: `${purchase.player.nome} preso da ${purchase.owner} per ${purchase.price}€`,
          confidence: 100,
          priority: 7,
          metadata: {
            playerId: purchase.player.id,
            teamName: purchase.owner
          }
        });
      }
    }
    
    // Alert se prezzo molto sopra/sotto le aspettative
    const expectedPrice = state.calculateMaxPrice(purchase.player);
    const priceRatio = purchase.price / expectedPrice;
    
    if (priceRatio > 1.5) {
      this.addAlert({
        level: 'info',
        category: 'budget',
        title: '💸 Overpay Detected',
        message: `${purchase.player.nome} pagato ${Math.round((priceRatio - 1) * 100)}% sopra il valore atteso`,
        confidence: 90,
        priority: 5
      });
    } else if (priceRatio < 0.7 && purchase.player.convenienzaPotenziale > 60) {
      this.addAlert({
        level: 'opportunity',
        category: 'budget',
        title: '💎 Affare Completato',
        message: `${purchase.player.nome} preso a prezzo ottimo! (${Math.round((1 - priceRatio) * 100)}% sotto valore)`,
        confidence: 90,
        priority: 6
      });
    }
  }
  
  // Analizza lo stato corrente e genera alert contestuali
  analyzeCurrentState(): SmartAlert[] {
    const newAlerts: SmartAlert[] = [];
    const state = useAuctionStore.getState();
    const slotsInfo = state.getSlotsInfo();
    
    // 1. BUDGET ALERTS
    if (state.budgetRemaining < this.config.thresholds.budget.warning && state.budgetRemaining > 0) {
      const totalSlotsRemaining = Object.values(slotsInfo)
        .reduce((sum, info) => sum + info.remaining, 0);
      
      if (totalSlotsRemaining > 0) {
        const avgPerSlot = state.budgetRemaining / totalSlotsRemaining;
        newAlerts.push({
          id: this.generateAlertId(),
          timestamp: new Date(),
          level: 'warning',
          category: 'budget',
          title: '💰 Budget Critico',
          message: `Solo ${avgPerSlot.toFixed(1)}€ medi per slot rimanente. Punta su occasioni sotto i ${Math.floor(avgPerSlot * 1.2)}€`,
          confidence: 95,
          priority: 8,
          actionable: {
            suggestion: 'Filtra giocatori per prezzo basso'
          }
        });
      }
    }
    
    // 2. SCARCITY ALERTS
    Object.entries(this.marketMetrics.scarcityIndex).forEach(([role, scarcity]) => {
      if (scarcity > this.config.thresholds.scarcity.warning && slotsInfo[role as Role].remaining > 0) {
        const basePriority = scarcity > this.config.thresholds.scarcity.critical ? 9 : 7;
        const adjustedPriority = Math.round(basePriority * this.config.priorityWeights.scarcity);
        
        const topRemaining = this.marketMetrics.topPlayersRemaining[role as Role];
        newAlerts.push({
          id: this.generateAlertId(),
          timestamp: new Date(),
          level: scarcity > 0.85 ? 'critical' : 'warning',
          category: 'scarcity',
          title: `🚨 Scarsità ${role}`,
          message: `Solo ${topRemaining} top player ${role} disponibili! Agisci ora o dovrai ripiegare`,
          confidence: 85,
          priority: adjustedPriority,
          metadata: { role: role as Role },
          actionable: {
            suggestion: `Visualizza migliori ${role} disponibili`,
            action: () => {
              // Filtra per ruolo
              state.setCurrentPhase(role as Role);
            }
          }
        });
      }
    });
    
    // 3. VELOCITY ALERTS
    if (this.marketMetrics.purchaseVelocity.trend === 'accelerating') {
      newAlerts.push({
        id: this.generateAlertId(),
        timestamp: new Date(),
        level: 'info',
        category: 'timing',
        title: '⚡ Asta Accelerata',
        message: `Ritmo acquisti in aumento (${this.marketMetrics.purchaseVelocity.last5min} negli ultimi 5min). Preparati a decisioni rapide!`,
        confidence: 80,
        priority: 6,
        ttl: 300 // 5 minuti
      });
    }
    
    // 4. COMPETITION ALERTS
    const aggressiveCompetitors = Array.from(this.marketMetrics.competitorProfiles.values())
      .filter(p => p.spendingPattern === 'aggressive' && p.budgetRemaining > 100);
    
    if (aggressiveCompetitors.length > 0 && state.selectedPlayer) {
      const likelyCompetitors = aggressiveCompetitors.filter(c => 
        c.preferredRoles.includes(state.selectedPlayer!.ruolo)
      );
      
      if (likelyCompetitors.length > 0) {
        newAlerts.push({
          id: this.generateAlertId(),
          timestamp: new Date(),
          level: 'warning',
          category: 'competition',
          title: '🎯 Competitor Alert',
          message: `${likelyCompetitors[0].name} potrebbe competere su ${state.selectedPlayer.nome} (budget: ${likelyCompetitors[0].budgetRemaining}€)`,
          confidence: 70,
          priority: 7,
          metadata: {
            playerId: state.selectedPlayer.id,
            teamName: likelyCompetitors[0].name
          }
        });
      }
    }
    
    // 5. OPPORTUNITY WINDOW ALERTS
    if (this.marketMetrics.purchaseVelocity.trend === 'slowing') {
      const undervaluedRoles = Object.entries(this.marketMetrics.priceInflation)
        .filter(([role, inflation]) => inflation < 0.9 && slotsInfo[role as Role].remaining > 0)
        .map(([role]) => role);
      
      if (undervaluedRoles.length > 0) {
        newAlerts.push({
          id: this.generateAlertId(),
          timestamp: new Date(),
          level: 'opportunity',
          category: 'timing',
          title: '🎯 Finestra Opportunità',
          message: `Momento ottimale per ${undervaluedRoles.join(', ')}: prezzi sotto media e bassa competizione`,
          confidence: 75,
          priority: 8,
          ttl: 180, // 3 minuti
          actionable: {
            suggestion: `Focus su ${undervaluedRoles[0]}`
          }
        });
      }
    }
    
    // 6. STRATEGIC ALERTS
    const mySpendingRate = (state.config.BUDGET_TOTALE - state.budgetRemaining) / state.config.BUDGET_TOTALE;
    const avgCompetitorSpendingRate = Array.from(this.marketMetrics.competitorProfiles.values())
      .reduce((sum, p) => sum + (1 - p.budgetRemaining / state.config.BUDGET_TOTALE), 0) / 
      this.marketMetrics.competitorProfiles.size;
    
    if (mySpendingRate < avgCompetitorSpendingRate * 0.7 && state.myTeam.length < 10) {
      newAlerts.push({
        id: this.generateAlertId(),
        timestamp: new Date(),
        level: 'info',
        category: 'strategy',
        title: '📊 Strategia Conservativa',
        message: 'Stai spendendo meno della media. Potresti permetterti qualche top player in più',
        confidence: 65,
        priority: 5,
        metadata: {
          reasoning: `Tu: ${Math.round(mySpendingRate * 100)}% speso, Media: ${Math.round(avgCompetitorSpendingRate * 100)}%`
        }
      });
    }
    
    return newAlerts;
  }
  
  // Predizioni basate su pattern
  generatePredictiveAlerts(): SmartAlert[] {
    const alerts: SmartAlert[] = [];
    const state = useAuctionStore.getState();
    
    // Predici quando finiranno i top player per ruolo
    Object.entries(this.marketMetrics.topPlayersRemaining).forEach(([role, remaining]) => {
      if (remaining > 0 && remaining <= 5) {
        const velocity = this.marketMetrics.purchaseVelocity.last10min / 10; // per minuto
        const minutesRemaining = remaining / (velocity * 0.3); // Assumiamo 30% siano top
        
        if (minutesRemaining < 15) {
          alerts.push({
            id: this.generateAlertId(),
            timestamp: new Date(),
            level: 'warning',
            category: 'timing',
            title: `⏰ Previsione ${role}`,
            message: `I top ${role} finiranno in ~${Math.round(minutesRemaining)} minuti al ritmo attuale`,
            confidence: 60,
            priority: 7,
            metadata: { role: role as Role }
          });
        }
      }
    });
    
    // Predici inflazione prezzi
    const inflationTrend = this.calculateInflationTrend();
    if (inflationTrend.accelerating) {
      alerts.push({
        id: this.generateAlertId(),
        timestamp: new Date(),
        level: 'info',
        category: 'budget',
        title: '📈 Inflazione Prezzi',
        message: `I prezzi sono saliti del ${Math.round(inflationTrend.rate * 100)}% negli ultimi 10 min. Considera di anticipare gli acquisti`,
        confidence: 70,
        priority: 6
      });
    }
    
    return alerts;
  }
  
  private calculateInflationTrend(): {accelerating: boolean; rate: number} {
    const recent = this.purchaseHistory.slice(-10);
    const older = this.purchaseHistory.slice(-20, -10);
    
    if (recent.length === 0 || older.length === 0) {
      return { accelerating: false, rate: 0 };
    }
    
    const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length;
    
    const rate = (recentAvg - olderAvg) / olderAvg;
    return {
      accelerating: rate > 0.1,
      rate
    };
  }
  
  private generateAlertId(): string {
    return `alert-${++this.alertIdCounter}-${Date.now()}`;
  }
  
  private addAlert(alertData: Omit<SmartAlert, 'id' | 'timestamp'>) {
    const alert: SmartAlert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      ...alertData
    };
    
    this.alerts.push(alert);
    
    // Rimuovi alert scaduti
    if (alert.ttl) {
      setTimeout(() => {
        this.alerts = this.alerts.filter(a => a.id !== alert.id);
      }, alert.ttl * 1000);
    }
    
    return alert;
  }
  
  // Ottieni alert attivi
  getActiveAlerts(): SmartAlert[] {
    const now = new Date();
    
    // Filtra alert scaduti
    this.alerts = this.alerts.filter(alert => {
      if (!alert.ttl) return true;
      const elapsed = (now.getTime() - alert.timestamp.getTime()) / 1000;
      return elapsed < alert.ttl;
    });
    
    // Ordina per priorità
    return this.alerts.sort((a, b) => b.priority - a.priority);
  }
  
  // Pulisci alert
  dismissAlert(alertId: string) {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
  
  clearAllAlerts() {
    this.alerts = [];
  }
}

// Singleton instance
export const alertSystem = new AlertIntelligence();