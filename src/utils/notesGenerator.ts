// src/utils/notesGenerator.ts
import { Player, PlayerNote, Watchlist } from '@/types';

export class NotesGenerator {
  static generateNotes(player: Player): PlayerNote[] {
    const notes: PlayerNote[] = [];
    const baseId = `auto-${player.id}`;
    const now = new Date();
    
    // ANALISI CONVENIENZA + TREND
    if (player.convenienzaPotenziale > 75 && player.trend === 'UP') {
      notes.push({
        id: `${baseId}-convenienza-top`,
        playerId: player.id,
        type: 'auto',
        category: 'opportunity',
        content: `💎 TOP PICK: Convenienza eccezionale (${player.convenienzaPotenziale.toFixed(1)}) con trend in crescita. Priorità assoluta per l'asta!`,
        confidence: 90,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    } else if (player.convenienzaPotenziale > 70 && player.trend !== 'DOWN') {
      notes.push({
        id: `${baseId}-convenienza-high`,
        playerId: player.id,
        type: 'auto',
        category: 'opportunity',
        content: `✨ Ottima convenienza (${player.convenienzaPotenziale.toFixed(1)}). Consideralo seriamente se il prezzo è giusto.`,
        confidence: 80,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // ANALISI INFORTUNI
    if (player.infortunato) {
      notes.push({
        id: `${baseId}-injury-current`,
        playerId: player.id,
        type: 'auto',
        category: 'warning',
        content: `🚨 INFORTUNATO: Valuta attentamente il rischio. Potrebbe saltare le prime giornate.`,
        confidence: 100,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    } else if (player.resistenzaInfortuni && player.resistenzaInfortuni < 40) {
      notes.push({
        id: `${baseId}-injury-risk`,
        playerId: player.id,
        type: 'auto',
        category: 'warning',
        content: `⚠️ Resistenza infortuni bassa (${player.resistenzaInfortuni}/100). Storicamente fragile, considera il rischio.`,
        confidence: 75,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    } else if (player.resistenzaInfortuni && player.resistenzaInfortuni > 80) {
      notes.push({
        id: `${baseId}-injury-resistant`,
        playerId: player.id,
        type: 'auto',
        category: 'opportunity',
        content: `💪 Molto resistente agli infortuni (${player.resistenzaInfortuni}/100). Affidabilità fisica eccellente.`,
        confidence: 80,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // ANALISI NUOVO ACQUISTO
    if (player.nuovoAcquisto) {
      if (player.fantamediaCorrente > 6.5) {
        notes.push({
          id: `${baseId}-new-signing-good`,
          playerId: player.id,
          type: 'auto',
          category: 'tactical',
          content: `🆕 Nuovo acquisto con ottima fantamedia (${player.fantamediaCorrente.toFixed(1)}). Probabile titolare con più minutaggio rispetto al passato.`,
          confidence: 75,
          source: ['fpedia'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      } else {
        notes.push({
          id: `${baseId}-new-signing`,
          playerId: player.id,
          type: 'auto',
          category: 'tactical',
          content: `🆕 Nuovo acquisto. Periodo di adattamento possibile, ma potrebbe essere un'occasione se si ambienta bene.`,
          confidence: 60,
          source: ['fpedia'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    // ANALISI METRICHE AVANZATE (FSTATS)
    if (player.xG) {
      if (player.xG > 15) {
        notes.push({
          id: `${baseId}-xg-excellent`,
          playerId: player.id,
          type: 'auto',
          category: 'statistical',
          content: `🎯 Expected Goals eccezionali (${player.xG.toFixed(1)} xG). Le statistiche suggeriscono un bomber vero.`,
          confidence: 85,
          source: ['fstats'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      } else if (player.xG > 10) {
        notes.push({
          id: `${baseId}-xg-good`,
          playerId: player.id,
          type: 'auto',
          category: 'statistical',
          content: `📊 Buoni Expected Goals (${player.xG.toFixed(1)} xG). Potenziale realizzativo sopra la media.`,
          confidence: 75,
          source: ['fstats'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    if (player.xA && player.xA > 8) {
      notes.push({
        id: `${baseId}-xa-high`,
        playerId: player.id,
        type: 'auto',
        category: 'statistical',
        content: `🎨 Expected Assists elevati (${player.xA.toFixed(1)} xA). Ottimo per i bonus assist.`,
        confidence: 80,
        source: ['fstats'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    if (player.fantaindex) {
      if (player.fantaindex > 85) {
        notes.push({
          id: `${baseId}-fantaindex-top`,
          playerId: player.id,
          type: 'auto',
          category: 'statistical',
          content: `🏆 Fantaindex TOP (${player.fantaindex.toFixed(1)}/100). Performance costanti e affidabili secondo le metriche avanzate.`,
          confidence: 90,
          source: ['fstats'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      } else if (player.fantaindex > 70) {
        notes.push({
          id: `${baseId}-fantaindex-good`,
          playerId: player.id,
          type: 'auto',
          category: 'statistical',
          content: `📈 Fantaindex buono (${player.fantaindex.toFixed(1)}/100). Rendimento sopra la media.`,
          confidence: 75,
          source: ['fstats'],
          editable: true,
          createdAt: now,
          updatedAt: now
        });
      }
    }
    
    // ANALISI DISCIPLINARE
    if (player.yellowCards && player.yellowCards > 8) {
      notes.push({
        id: `${baseId}-yellow-cards`,
        playerId: player.id,
        type: 'auto',
        category: 'warning',
        content: `🟨 Molti cartellini gialli (${player.yellowCards} nella scorsa stagione). Rischio squalifiche frequenti.`,
        confidence: 85,
        source: ['fstats'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    if (player.redCards && player.redCards > 1) {
      notes.push({
        id: `${baseId}-red-cards`,
        playerId: player.id,
        type: 'auto',
        category: 'warning',
        content: `🟥 ${player.redCards} espulsioni nella scorsa stagione. Giocatore falloso, attenzione!`,
        confidence: 90,
        source: ['fstats'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // ANALISI SOTTOVALUTATI (Sleeper)
    if (player.convenienzaPotenziale > 65 && player.presenzeCorrente < 20 && !player.infortunato) {
      notes.push({
        id: `${baseId}-sleeper`,
        playerId: player.id,
        type: 'auto',
        category: 'opportunity',
        content: `🚀 SLEEPER PICK: Alta convenienza (${player.convenienzaPotenziale.toFixed(1)}) ma poche presenze (${player.presenzeCorrente}). Potrebbe esplodere quest'anno!`,
        confidence: 70,
        source: ['fpedia', 'fstats'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // ANALISI BUON INVESTIMENTO
    if (player.buonInvestimento && player.buonInvestimento > 80) {
      notes.push({
        id: `${baseId}-good-investment`,
        playerId: player.id,
        type: 'auto',
        category: 'opportunity',
        content: `💰 Valutato come ottimo investimento (${player.buonInvestimento}/100). Rapporto qualità/prezzo eccellente.`,
        confidence: 85,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // CONSIGLIATO PROSSIMA GIORNATA
    if (player.consigliatoProssimaGiornata) {
      notes.push({
        id: `${baseId}-recommended-next`,
        playerId: player.id,
        type: 'auto',
        category: 'tactical',
        content: `⭐ Consigliato per la prossima giornata. Calendario favorevole o condizione ottimale.`,
        confidence: 75,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    // ANALISI SKILLS SPECIALI
    if (player.skills && player.skills.length > 0) {
      const skillsText = player.skills.join(', ');
      notes.push({
        id: `${baseId}-skills`,
        playerId: player.id,
        type: 'auto',
        category: 'tactical',
        content: `🎮 Skills speciali: ${skillsText}. Caratteristiche che lo rendono unico nel suo ruolo.`,
        confidence: 80,
        source: ['fpedia'],
        editable: true,
        createdAt: now,
        updatedAt: now
      });
    }
    
    return notes;
  }
  
  static generateWatchlists(players: Player[]): Watchlist[] {
    const watchlists: Watchlist[] = [];
    
    // 1. TOP CONVENIENZA ASSOLUTA
    const topConvenienza = players
      .filter(p => p.convenienzaPotenziale > 75)
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 20)
      .map(p => p.id);
    
    if (topConvenienza.length > 0) {
      watchlists.push({
        id: 'auto-top-convenienza',
        name: '💎 Top Convenienza',
        type: 'auto',
        description: 'I 20 giocatori con convenienza potenziale più alta (>75)',
        playerIds: topConvenienza,
        priority: 10,
        color: '#10b981',
        icon: '💎',
        criteria: { minConvenienza: 75 }
      });
    }
    
    // 2. SLEEPER PICKS
    const sleepers = players
      .filter(p => 
        p.convenienzaPotenziale > 60 && 
        p.convenienzaPotenziale < 75 &&
        p.trend === 'UP' && 
        p.presenzeCorrente < 25 &&
        !p.infortunato &&
        (!p.resistenzaInfortuni || p.resistenzaInfortuni > 50)
      )
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 15)
      .map(p => p.id);
    
    if (sleepers.length > 0) {
      watchlists.push({
        id: 'auto-sleepers',
        name: '🚀 Sleeper Picks',
        type: 'auto',
        description: 'Giocatori sottovalutati con alto potenziale di crescita',
        playerIds: sleepers,
        priority: 8,
        color: '#8b5cf6',
        icon: '🚀',
        criteria: { 
          minConvenienza: 60, 
          maxConvenienza: 75,
          trend: 'UP',
          infortunato: false 
        }
      });
    }
    
    // 3. NUOVI ACQUISTI DA MONITORARE
    const newSignings = players
      .filter(p => p.nuovoAcquisto && p.fantamediaCorrente > 5.5 && !p.infortunato)
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 20)
      .map(p => p.id);
    
    if (newSignings.length > 0) {
      watchlists.push({
        id: 'auto-new-signings',
        name: '🆕 Nuovi Acquisti',
        type: 'auto',
        description: 'Nuovi arrivi che potrebbero sorprendere',
        playerIds: newSignings,
        priority: 6,
        color: '#3b82f6',
        icon: '🆕',
        criteria: { nuovoAcquisto: true, minFantamedia: 5.5 }
      });
    }
    
    // 4. ALERT INFORTUNI
    const injuryRisk = players
      .filter(p => p.infortunato || (p.resistenzaInfortuni && p.resistenzaInfortuni < 40))
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .map(p => p.id);
    
    if (injuryRisk.length > 0) {
      watchlists.push({
        id: 'auto-injury-risk',
        name: '🚨 Rischio Infortuni',
        type: 'auto',
        description: 'Giocatori infortunati o storicamente fragili - valuta con attenzione',
        playerIds: injuryRisk,
        priority: 3,
        color: '#ef4444',
        icon: '🚨',
        criteria: { infortunato: true }
      });
    }
    
    // 5. BOMBER CERTIFICATI
    const bombers = players
      .filter(p => 
        (p.goals && p.goals > 10) || 
        (p.xG && p.xG > 12) ||
        (p.fantamediaCorrente > 7 && p.ruolo === 'A')
      )
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 15)
      .map(p => p.id);
    
    if (bombers.length > 0) {
      watchlists.push({
        id: 'auto-bombers',
        name: '⚽ Bomber',
        type: 'auto',
        description: 'I migliori realizzatori della scorsa stagione',
        playerIds: bombers,
        priority: 9,
        color: '#f59e0b',
        icon: '⚽',
        criteria: { minGoals: 10 }
      });
    }
    
    // 6. ASSIST-MAN
    const assistmen = players
      .filter(p => 
        (p.assists && p.assists > 7) || 
        (p.xA && p.xA > 8)
      )
      .sort((a, b) => (b.assists || 0) - (a.assists || 0))
      .slice(0, 15)
      .map(p => p.id);
    
    if (assistmen.length > 0) {
      watchlists.push({
        id: 'auto-assistmen',
        name: '🎯 Assist-Man',
        type: 'auto',
        description: 'I migliori per gli assist',
        playerIds: assistmen,
        priority: 7,
        color: '#06b6d4',
        icon: '🎯',
        criteria: { minAssists: 7 }
      });
    }
    
    // 7. FANTAINDEX TOP
    const fantaindexTop = players
      .filter(p => p.fantaindex && p.fantaindex > 75)
      .sort((a, b) => (b.fantaindex || 0) - (a.fantaindex || 0))
      .slice(0, 20)
      .map(p => p.id);
    
    if (fantaindexTop.length > 0) {
      watchlists.push({
        id: 'auto-fantaindex',
        name: '📊 Fantaindex Top',
        type: 'auto',
        description: 'Migliori secondo le metriche avanzate (Fantaindex > 75)',
        playerIds: fantaindexTop,
        priority: 8,
        color: '#7c3aed',
        icon: '📊',
        criteria: { minFantaindex: 75 }
      });
    }
    
    // 8. OCCASIONI LAST MINUTE
    const lastMinute = players
      .filter(p => 
        p.convenienzaPotenziale > 50 &&
        p.convenienzaPotenziale < 65 &&
        !p.infortunato &&
        p.fantamediaCorrente > 5
      )
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 25)
      .map(p => p.id);
    
    if (lastMinute.length > 0) {
      watchlists.push({
        id: 'auto-last-minute',
        name: '💰 Occasioni Budget',
        type: 'auto',
        description: 'Buoni giocatori per completare la rosa con budget limitato',
        playerIds: lastMinute,
        priority: 5,
        color: '#64748b',
        icon: '💰',
        criteria: { 
          minConvenienza: 50, 
          maxConvenienza: 65,
          minFantamedia: 5 
        }
      });
    }
    
    return watchlists;
  }
}