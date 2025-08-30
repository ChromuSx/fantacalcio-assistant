// src/types/index.ts

export type Role = 'P' | 'D' | 'C' | 'A';
export type PlayerStatus = 'available' | 'mine' | 'taken';
export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface Player {
  id: number;
  nome: string;
  ruolo: Role;
  squadra: string;
  
  // Statistiche da FPEDIA
  convenienzaPotenziale: number;
  convenienza: number;
  punteggio: number;
  fantamediaCorrente: number;
  fantamediaPrecedente?: number;
  presenzeCorrente: number;
  presenzePrecedente?: number;
  
  // Caratteristiche
  skills?: string[];
  trend: Trend;
  infortunato: boolean;
  nuovoAcquisto: boolean;
  buonInvestimento?: number;
  resistenzaInfortuni?: number;
  consigliatoProssimaGiornata?: boolean;
  
  // Statistiche da FSTATS
  goals?: number;
  assists?: number;
  xG?: number;
  xA?: number;
  yellowCards?: number;
  redCards?: number;
  fantaindex?: number;
  
  // Stato durante l'asta
  status: PlayerStatus;
  owner?: string;
  paidPrice?: number;
  suggestedMaxPrice?: number;
}

export interface Team {
  name: string;
  budget: number;
  budgetSpent: number;
  players: Player[];
}

export interface AuctionConfig {
  BUDGET_TOTALE: number;
  POSTI_RUOLO: Record<Role, number>;
  NUM_SQUADRE: number;
  MODIFICATORE_DIFESA?: boolean;
}

export interface AuctionState {
  config: AuctionConfig;
  currentPhase: Role | 'idle';
  myTeam: Player[];
  budgetRemaining: number;
  otherTeams: Map<string, Team>;
  allPlayers: Player[];
}

export interface SlotsInfo {
  taken: number;
  total: number;
  remaining: number;
}

export type Recommendation = 'COMPRA' | 'VALUTA' | 'LASCIA';

export interface PriceCalculation {
  basePrice: number;
  adjustedPrice: number;
  maxSuggestedPrice: number;
  factors: {
    convenience: number;
    injury: number;
    trend: number;
    newPlayer: number;
    fantaMedia: number;
  };
}
export interface PlayerNote {
  id: string;
  playerId: number;
  type: 'auto' | 'manual' | 'mixed';
  category: 'opportunity' | 'warning' | 'tactical' | 'statistical';
  content: string;
  confidence: number;  // 0-100
  source: string[];    // ['fpedia', 'fstats', 'user']
  editable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Watchlist {
  id: string;
  name: string;
  type: 'auto' | 'manual';
  description: string;
  criteria?: WatchlistCriteria;
  playerIds: number[];
  priority: number;
  color: string;
  icon: string;
}

export interface WatchlistCriteria {
  minConvenienza?: number;
  maxConvenienza?: number;
  trend?: Trend;
  infortunato?: boolean;
  nuovoAcquisto?: boolean;
  minFantamedia?: number;
  maxFantamedia?: number;
  minGoals?: number;
  minAssists?: number;
  minxG?: number;
  minFantaindex?: number;
  maxPrice?: number;
}