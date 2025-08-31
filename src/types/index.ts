// src/types/index.ts

export type Role = 'P' | 'D' | 'C' | 'A';
export type PlayerStatus = 'available' | 'mine' | 'taken';
export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface Player {
  id: number;
  nome: string;
  ruolo: Role;
  squadra: string;
  
  // Quotazione e valore
  quotazione?: number;
  valorePrezzo?: number;
  
  // Statistiche principali
  convenienzaPotenziale: number;
  convenienza: number;
  punteggio: number;
  fantamediaCorrente: number;
  fantamediaPrecedente?: number;
  fantavotoMedio?: number;
  fmTotGare?: number;
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
  
  // Statistiche dettagliate
  goals?: number;
  assists?: number;
  goalsMin?: number;
  goalsMax?: number;
  assistsMin?: number;
  assistsMax?: number;
  xG?: number;
  xA?: number;
  yellowCards?: number;
  redCards?: number;
  fantaindex?: number;
  
  // NUOVI CAMPI dal file unificato
  scoreAffare?: number;        // Score_Affare
  indiceUnificato?: number;     // Indice_Unificato
  indiceAggiustato?: number;    // Indice_Aggiustato
  affidabilitaDati?: number;    // Affidabilita_Dati (0-100)
  fonteDati?: 'Entrambe' | 'fpedia' | 'fstats';  // Fonte_Dati
  
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
  confidence: number;
  source: string[];
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
  minScoreAffare?: number;  // NUOVO
}