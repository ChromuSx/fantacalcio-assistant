// src/stores/auctionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Team, AuctionConfig, Role, PlayerStatus, PlayerNote, Watchlist } from '@/types';
import { NotesGenerator } from '@/utils/notesGenerator';

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
  
  // Note e Watchlist
  notes: PlayerNote[];
  watchlists: Watchlist[];
  
  // Azioni principali
  purchasePlayer: (player: Player, price: number, owner?: string) => void;
  selectPlayer: (player: Player | null) => void;
  setCurrentPhase: (phase: Role | 'idle') => void;
  resetAuction: () => void;
  
  // Azioni per Note
  generateNotesForPlayer: (playerId: number) => void;
  generateAllNotes: () => void;
  addManualNote: (playerId: number, content: string, category?: PlayerNote['category']) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  
  // Azioni per Watchlist
  generateWatchlists: () => void;
  createWatchlist: (name: string, description: string, playerIds: number[]) => void;
  addToWatchlist: (watchlistId: string, playerId: number) => void;
  removeFromWatchlist: (watchlistId: string, playerId: number) => void;
  deleteWatchlist: (watchlistId: string) => void;
  updateWatchlist: (watchlistId: string, updates: Partial<Watchlist>) => void;
  
  // Utils
  getSlotsInfo: () => Record<Role, { taken: number; total: number; remaining: number }>;
  getAvailablePlayers: (role?: Role) => Player[];
  calculateMaxPrice: (player: Player) => number;
  getPlayerNotes: (playerId: number) => PlayerNote[];
  getWatchlistPlayers: (watchlistId: string) => Player[];
  isPlayerInWatchlist: (playerId: number, watchlistId: string) => boolean;
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
      notes: [],
      watchlists: [],
      
      // Setters configurazione
      setConfig: (newConfig) => set((state) => ({
        config: { ...state.config, ...newConfig },
        budgetRemaining: newConfig.BUDGET_TOTALE || state.budgetRemaining
      })),
      
      // Gestione giocatori
      setPlayers: (players) => {
        set({ players });
        
        // Genera automaticamente note e watchlist quando importi i dati
        setTimeout(() => {
          get().generateAllNotes();
          get().generateWatchlists();
        }, 100);
      },
      
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
        selectedPlayer: null,
        notes: [],
        watchlists: []
      }),
      
      // GESTIONE NOTE
      
      // Genera note per un singolo giocatore
      generateNotesForPlayer: (playerId) => {
        const player = get().players.find(p => p.id === playerId);
        if (!player) return;
        
        const newNotes = NotesGenerator.generateNotes(player);
        set((state) => ({
          notes: [
            ...state.notes.filter(n => n.playerId !== playerId && n.type === 'manual'),
            ...newNotes
          ]
        }));
      },
      
      // Genera tutte le note automatiche
      generateAllNotes: () => {
        const players = get().players;
        const allNotes = players.flatMap(p => NotesGenerator.generateNotes(p));
        
        // Preserva le note manuali esistenti
        const manualNotes = get().notes.filter(n => n.type === 'manual');
        
        set({ notes: [...allNotes, ...manualNotes] });
      },
      
      // Aggiungi nota manuale
      addManualNote: (playerId, content, category = 'tactical') => {
        const newNote: PlayerNote = {
          id: `manual-${Date.now()}`,
          playerId,
          type: 'manual',
          category,
          content,
          confidence: 100,
          source: ['user'],
          editable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => ({
          notes: [...state.notes, newNote]
        }));
      },
      
      // Aggiorna nota
      updateNote: (noteId, content) => {
        set((state) => ({
          notes: state.notes.map(n =>
            n.id === noteId
              ? { 
                  ...n, 
                  content, 
                  type: n.type === 'auto' ? 'mixed' : n.type,
                  updatedAt: new Date()
                }
              : n
          )
        }));
      },
      
      // Elimina nota
      deleteNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter(n => n.id !== noteId)
        }));
      },
      
      // GESTIONE WATCHLIST
      
      // Genera watchlist automatiche
      generateWatchlists: () => {
        const players = get().players;
        const autoWatchlists = NotesGenerator.generateWatchlists(players);
        
        // Mantieni le watchlist manuali esistenti
        set((state) => ({
          watchlists: [
            ...state.watchlists.filter(w => w.type === 'manual'),
            ...autoWatchlists
          ]
        }));
      },
      
      // Crea watchlist manuale
      createWatchlist: (name, description, playerIds) => {
        const newWatchlist: Watchlist = {
          id: `manual-${Date.now()}`,
          name,
          type: 'manual',
          description,
          playerIds,
          priority: 5,
          color: '#6b7280',
          icon: '📌'
        };
        
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist]
        }));
      },
      
      // Aggiungi a watchlist
      addToWatchlist: (watchlistId, playerId) => {
        set((state) => ({
          watchlists: state.watchlists.map(w =>
            w.id === watchlistId && !w.playerIds.includes(playerId)
              ? { ...w, playerIds: [...w.playerIds, playerId] }
              : w
          )
        }));
      },
      
      // Rimuovi da watchlist
      removeFromWatchlist: (watchlistId, playerId) => {
        set((state) => ({
          watchlists: state.watchlists.map(w =>
            w.id === watchlistId
              ? { ...w, playerIds: w.playerIds.filter(id => id !== playerId) }
              : w
          )
        }));
      },
      
      // Elimina watchlist
      deleteWatchlist: (watchlistId) => {
        set((state) => ({
          watchlists: state.watchlists.filter(w => w.id !== watchlistId)
        }));
      },
      
      // Aggiorna watchlist
      updateWatchlist: (watchlistId, updates) => {
        set((state) => ({
          watchlists: state.watchlists.map(w =>
            w.id === watchlistId ? { ...w, ...updates } : w
          )
        }));
      },
      
      // UTILITY FUNCTIONS
      
      getSlotsInfo: () => {
        const state = get();
        const info: Record<Role, { taken: number; total: number; remaining: number }> = {
          P: { taken: 0, total: 0, remaining: 0 },
          D: { taken: 0, total: 0, remaining: 0 },
          C: { taken: 0, total: 0, remaining: 0 },
          A: { taken: 0, total: 0, remaining: 0 }
        };
        
        Object.entries(state.config.POSTI_RUOLO).forEach(([ruolo, posti]) => {
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
        
        // Aggiustamenti basati su metriche avanzate
        if (player.xG && player.xG > 10) basePrice *= 1.15;
        if (player.xA && player.xA > 5) basePrice *= 1.1;
        if (player.fantaindex && player.fantaindex > 80) basePrice *= 1.1;
        if (player.yellowCards && player.yellowCards > 8) basePrice *= 0.9;
        if (player.redCards && player.redCards > 1) basePrice *= 0.85;
        
        // Aggiustamento per ruolo e scarsità
        const roleInfo = slotsInfo[player.ruolo];
        if (roleInfo) {
          if (roleInfo.remaining === 1) basePrice *= 1.2;
          if (roleInfo.remaining === 0) return 0;
        }
        
        // Mai più del 40% del budget rimanente per un singolo giocatore
        return Math.round(Math.min(basePrice, state.budgetRemaining * 0.4));
      },
      
      // Ottieni note di un giocatore
      getPlayerNotes: (playerId) => {
        return get().notes.filter(n => n.playerId === playerId);
      },
      
      // Ottieni giocatori in una watchlist
      getWatchlistPlayers: (watchlistId) => {
        const watchlist = get().watchlists.find(w => w.id === watchlistId);
        if (!watchlist) return [];
        
        return get().players.filter(p => watchlist.playerIds.includes(p.id));
      },
      
      // Controlla se un giocatore è in una watchlist
      isPlayerInWatchlist: (playerId, watchlistId) => {
        const watchlist = get().watchlists.find(w => w.id === watchlistId);
        return watchlist ? watchlist.playerIds.includes(playerId) : false;
      }
    }),
    {
      name: 'auction-storage',
      partialize: (state) => ({
        config: state.config,
        players: state.players,
        myTeam: state.myTeam,
        budgetRemaining: state.budgetRemaining,
        otherTeams: Array.from(state.otherTeams.entries()),
        notes: state.notes,
        watchlists: state.watchlists
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