// src/stores/auctionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Team, AuctionConfig, Role, PlayerStatus } from '@/types';

interface AuctionStore {
  // Configurazione
  config: AuctionConfig;
  setConfig: (config: Partial<AuctionConfig>) => void;
  
  // Giocatori
  players: Player[];
  setPlayers: (players: Player[]) => void;
  updatePlayer: (playerId: number, updates: Partial<Player>) => void;
  
  // La mia squadra
  myTeam: Player[];
  budgetRemaining: number;
  
  // Altre squadre
  otherTeams: Map<string, Team>;
  
  // Stato asta
  currentPhase: Role | 'idle';
  selectedPlayer: Player | null;
  
  // Azioni
  purchasePlayer: (player: Player, price: number, owner?: string) => void;
  selectPlayer: (player: Player | null) => void;
  setCurrentPhase: (phase: Role | 'idle') => void;
  resetAuction: () => void;
  
  // Utils
  getSlotsInfo: () => Record<Role, { taken: number; total: number; remaining: number }>;
  getAvailablePlayers: (role?: Role) => Player[];
  calculateMaxPrice: (player: Player) => number;
}

const DEFAULT_CONFIG: AuctionConfig = {
  BUDGET_TOTALE: 500,
  POSTI_RUOLO: { P: 3, D: 8, C: 8, A: 6 },
  NUM_SQUADRE: 10,
  MODIFICATORE_DIFESA: true
};

export const useAuctionStore = create<AuctionStore>()(
  persist(
    (set, get) => ({
      // Stato iniziale
      config: DEFAULT_CONFIG,
      players: [],
      myTeam: [],
      budgetRemaining: DEFAULT_CONFIG.BUDGET_TOTALE,
      otherTeams: new Map(),
      currentPhase: 'idle',
      selectedPlayer: null,
      
      // Setters configurazione
      setConfig: (newConfig) => set((state) => ({
        config: { ...state.config, ...newConfig },
        budgetRemaining: newConfig.BUDGET_TOTALE || state.budgetRemaining
      })),
      
      // Gestione giocatori
      setPlayers: (players) => set({ players }),
      
      updatePlayer: (playerId, updates) => set((state) => ({
        players: state.players.map(p => 
          p.id === playerId ? { ...p, ...updates } : p
        )
      })),
      
      // Acquisto giocatore
      purchasePlayer: (player, price, owner = 'me') => set((state) => {
        const updatedPlayers = state.players.map(p => 
          p.id === player.id 
            ? { 
                ...p, 
                status: (owner === 'me' ? 'mine' : 'taken') as PlayerStatus, 
                owner, 
                paidPrice: price 
              }
            : p
        );
        
        if (owner === 'me') {
          return {
            players: updatedPlayers,
            myTeam: [...state.myTeam, { ...player, status: 'mine' as PlayerStatus, paidPrice: price }],
            budgetRemaining: state.budgetRemaining - price,
            selectedPlayer: null
          };
        } else {
          const updatedOtherTeams = new Map(state.otherTeams);
          const team = updatedOtherTeams.get(owner) || {
            name: owner,
            budget: state.config.BUDGET_TOTALE,
            budgetSpent: 0,
            players: []
          };
          
          team.players.push({ ...player, status: 'taken' as PlayerStatus, paidPrice: price });
          team.budgetSpent += price;
          updatedOtherTeams.set(owner, team);
          
          return {
            players: updatedPlayers,
            otherTeams: updatedOtherTeams,
            selectedPlayer: null
          };
        }
      }),
      
      // Selezione giocatore
      selectPlayer: (player) => set({ selectedPlayer: player }),
      
      // Fase asta
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      
      // Reset
      resetAuction: () => set({
        players: get().players.map(p => ({
          ...p,
          status: 'available' as PlayerStatus,
          owner: undefined,
          paidPrice: undefined
        })),
        myTeam: [],
        budgetRemaining: get().config.BUDGET_TOTALE,
        otherTeams: new Map(),
        currentPhase: 'idle',
        selectedPlayer: null
      }),
      
      // Utility functions
      getSlotsInfo: () => {
        const state = get();
        const info: Record<Role, { taken: number; total: number; remaining: number }> = {
          P: { taken: 0, total: 0, remaining: 0 },
          D: { taken: 0, total: 0, remaining: 0 },
          C: { taken: 0, total: 0, remaining: 0 },
          A: { taken: 0, total: 0, remaining: 0 }
        };
        
        Object.entries(state.config.POSTI_RUOLO).forEach(([ruolo, posti]) => {
          // Conta solo i giocatori con ruolo valido
          const taken = state.myTeam.filter(p => p.ruolo === ruolo as Role).length;
          info[ruolo as Role] = {
            taken,
            total: posti,
            remaining: posti - taken
          };
        });
        
        return info;
      },
      
      getAvailablePlayers: (role) => {
        const state = get();
        return state.players.filter(p => 
          p.status === 'available' && 
          (!role || p.ruolo === role)
        );
      },
      
      calculateMaxPrice: (player) => {
        const state = get();
        const slotsInfo = state.getSlotsInfo();
        
        const totalSlotsRemaining = Object.values(slotsInfo).reduce(
          (acc, info) => acc + info.remaining, 0
        );
        
        if (totalSlotsRemaining === 0) return 0;
        
        const avgBudgetPerSlot = state.budgetRemaining / totalSlotsRemaining;
        const convenienceMultiplier = Math.min(player.convenienzaPotenziale / 50, 2);
        let basePrice = avgBudgetPerSlot * convenienceMultiplier;
        
        // Aggiustamenti base
        if (player.infortunato) basePrice *= 0.7;
        if (player.nuovoAcquisto) basePrice *= 0.85;
        if (player.trend === 'UP') basePrice *= 1.1;
        if (player.trend === 'DOWN') basePrice *= 0.9;
        if (player.fantamediaCorrente > 7) basePrice *= 1.2;
        if (player.fantamediaCorrente > 8) basePrice *= 1.3;
        
        // Aggiustamenti basati su metriche avanzate (se disponibili)
        if (player.xG && player.xG > 10) basePrice *= 1.15;
        if (player.xA && player.xA > 5) basePrice *= 1.1;
        if (player.fantaindex && player.fantaindex > 80) basePrice *= 1.1;
        if (player.yellowCards && player.yellowCards > 8) basePrice *= 0.9;
        if (player.redCards && player.redCards > 1) basePrice *= 0.85;
        
        // Aggiustamento per ruolo e scarsità (con controllo sicurezza)
        const roleInfo = slotsInfo[player.ruolo];
        if (roleInfo) {
          if (roleInfo.remaining === 1) basePrice *= 1.2; // Ultimo slot
          if (roleInfo.remaining === 0) return 0; // Ruolo completo
        }
        
        // Mai più del 40% del budget rimanente per un singolo giocatore
        return Math.round(Math.min(basePrice, state.budgetRemaining * 0.4));
      }
    }),
    {
      name: 'auction-storage',
      partialize: (state) => ({
        config: state.config,
        players: state.players,
        myTeam: state.myTeam,
        budgetRemaining: state.budgetRemaining,
        otherTeams: Array.from(state.otherTeams.entries())
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.otherTeams && Array.isArray(state.otherTeams)) {
          state.otherTeams = new Map(state.otherTeams as any);
        }
        // Pulisci giocatori con ruoli non validi
        if (state && state.players) {
          state.players = state.players.filter(p => 
            p.ruolo && ['P', 'D', 'C', 'A'].includes(p.ruolo)
          );
        }
        if (state && state.myTeam) {
          state.myTeam = state.myTeam.filter(p => 
            p.ruolo && ['P', 'D', 'C', 'A'].includes(p.ruolo)
          );
        }
      }
    }
  )
);