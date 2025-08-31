// src/utils/notesGenerator.ts (versione aggiornata con nuovi campi)
import { Player, PlayerNote, Watchlist } from "@/types";

export class NotesGenerator {
  static generateNotes(player: Player): PlayerNote[] {
    const notes: PlayerNote[] = [];
    const baseId = `auto-${player.id}`;
    const now = new Date();

    // ANALISI SCORE AFFARE (NUOVO)
    if (player.scoreAffare) {
      if (player.scoreAffare > 90) {
        notes.push({
          id: `${baseId}-score-affare-top`,
          playerId: player.id,
          type: "auto",
          category: "opportunity",
          content: `🏆 SUPER AFFARE! Score Affare eccezionale (${player.scoreAffare.toFixed(1)}/100). ${
            player.affidabilitaDati && player.affidabilitaDati === 100 
              ? 'Dati completamente affidabili.' 
              : `Affidabilità dati: ${player.affidabilitaDati}%`
          } Priorità assoluta per l'asta!`,
          confidence: player.affidabilitaDati || 90,
          source: [player.fonteDati || 'Entrambe'],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      } else if (player.scoreAffare > 80) {
        notes.push({
          id: `${baseId}-score-affare-high`,
          playerId: player.id,
          type: "auto",
          category: "opportunity",
          content: `💎 Ottimo affare (Score: ${player.scoreAffare.toFixed(1)}). Rapporto qualità/prezzo eccellente secondo l'analisi unificata.`,
          confidence: player.affidabilitaDati || 85,
          source: [player.fonteDati || 'Entrambe'],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // ANALISI INDICE UNIFICATO (NUOVO)
    if (player.indiceUnificato && player.indiceAggiustato) {
      if (player.indiceAggiustato > 90) {
        notes.push({
          id: `${baseId}-indice-top`,
          playerId: player.id,
          type: "auto",
          category: "statistical",
          content: `📊 Performance TOP! Indice Aggiustato: ${player.indiceAggiustato.toFixed(1)}/100 (base: ${player.indiceUnificato.toFixed(1)}). Prestazioni elite secondo le metriche avanzate.`,
          confidence: 90,
          source: [player.fonteDati || 'Entrambe'],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      } else if (player.indiceAggiustato > 75) {
        notes.push({
          id: `${baseId}-indice-good`,
          playerId: player.id,
          type: "auto",
          category: "statistical",
          content: `📈 Indice performance elevato (${player.indiceAggiustato.toFixed(1)}/100). Giocatore sopra la media per il suo ruolo.`,
          confidence: 85,
          source: [player.fonteDati || 'Entrambe'],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // AFFIDABILITÀ DATI (NUOVO)
    if (player.affidabilitaDati && player.affidabilitaDati < 80) {
      notes.push({
        id: `${baseId}-data-reliability`,
        playerId: player.id,
        type: "auto",
        category: "warning",
        content: `⚠️ Affidabilità dati limitata (${player.affidabilitaDati}%). Alcuni dati potrebbero essere incompleti o provenienti da una sola fonte.`,
        confidence: 100,
        source: [player.fonteDati || 'Entrambe'],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ANALISI CONVENIENZA + TREND (esistente ma migliorata)
    if (player.convenienzaPotenziale > 75 && player.trend === "UP") {
      notes.push({
        id: `${baseId}-convenienza-top`,
        playerId: player.id,
        type: "auto",
        category: "opportunity",
        content: `💎 TOP PICK: Convenienza eccezionale (${player.convenienzaPotenziale.toFixed(
          1
        )}) con trend in crescita. ${
          player.valorePrezzo
            ? `Rapporto valore/prezzo: ${player.valorePrezzo.toFixed(1)}`
            : ""
        } ${player.scoreAffare ? `Score Affare: ${player.scoreAffare.toFixed(1)}` : ''}`,
        confidence: 90,
        source: [player.fonteDati || "fpedia"],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    } else if (player.convenienzaPotenziale > 70 && player.trend !== "DOWN") {
      notes.push({
        id: `${baseId}-convenienza-high`,
        playerId: player.id,
        type: "auto",
        category: "opportunity",
        content: `✨ Ottima convenienza (${player.convenienzaPotenziale.toFixed(
          1
        )}). ${
          player.quotazione ? `Quotato a ${player.quotazione}€.` : ""
        } Consideralo seriamente se il prezzo è giusto.`,
        confidence: 80,
        source: [player.fonteDati || "fpedia"],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Resto delle analisi esistenti...
    // ANALISI INFORTUNI
    if (player.infortunato) {
      notes.push({
        id: `${baseId}-injury-current`,
        playerId: player.id,
        type: "auto",
        category: "warning",
        content: `🚨 INFORTUNATO: Valuta attentamente il rischio. Potrebbe saltare le prime giornate.`,
        confidence: 100,
        source: [player.fonteDati || "fpedia"],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    } else if (player.resistenzaInfortuni && player.resistenzaInfortuni < 40) {
      notes.push({
        id: `${baseId}-injury-risk`,
        playerId: player.id,
        type: "auto",
        category: "warning",
        content: `⚠️ Resistenza infortuni bassa (${player.resistenzaInfortuni}/100). Storicamente fragile, considera il rischio.`,
        confidence: 75,
        source: [player.fonteDati || "fpedia"],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ANALISI NUOVO ACQUISTO
    if (player.nuovoAcquisto) {
      if (player.fantamediaCorrente > 6.5) {
        notes.push({
          id: `${baseId}-new-signing-good`,
          playerId: player.id,
          type: "auto",
          category: "tactical",
          content: `🆕 Nuovo acquisto con ottima fantamedia (${player.fantamediaCorrente.toFixed(
            1
          )}). Probabile titolare con più minutaggio rispetto al passato.`,
          confidence: 75,
          source: [player.fonteDati || "fpedia"],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // ANALISI DISCIPLINARE
    if (player.yellowCards && player.yellowCards > 8) {
      notes.push({
        id: `${baseId}-yellow-cards`,
        playerId: player.id,
        type: "auto",
        category: "warning",
        content: `🟨 Molti cartellini gialli (${player.yellowCards} nella scorsa stagione). Rischio squalifiche frequenti.`,
        confidence: 85,
        source: [player.fonteDati || "fstats"],
        editable: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    // ANALISI SKILLS SPECIALI
    if (player.skills && player.skills.length > 0) {
      const importantSkills = ['Fuoriclasse', 'Titolare', 'Goleador', 'Rigorista'];
      const hasImportantSkills = player.skills.some(s => importantSkills.includes(s));
      
      if (hasImportantSkills) {
        notes.push({
          id: `${baseId}-skills`,
          playerId: player.id,
          type: "auto",
          category: "tactical",
          content: `🎮 Skills importanti: ${player.skills.join(", ")}. Caratteristiche che lo rendono particolarmente prezioso.`,
          confidence: 85,
          source: [player.fonteDati || "fpedia"],
          editable: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    return notes;
  }

  static generateWatchlists(players: Player[]): Watchlist[] {
    const watchlists: Watchlist[] = [];

    // 1. SUPER AFFARI (NUOVO - basato su Score_Affare)
    const superAffari = players
      .filter((p) => p.scoreAffare && p.scoreAffare > 85)
      .sort((a, b) => (b.scoreAffare || 0) - (a.scoreAffare || 0))
      .slice(0, 20)
      .map((p) => p.id);

    if (superAffari.length > 0) {
      watchlists.push({
        id: "auto-super-affari",
        name: "🏆 Super Affari",
        type: "auto",
        description: "I migliori affari secondo Score_Affare (>85)",
        playerIds: superAffari,
        priority: 10,
        color: "#fbbf24",
        icon: "🏆",
        criteria: { minScoreAffare: 85 },
      });
    }

    // 2. TOP PERFORMANCE (NUOVO - basato su Indice Aggiustato)
    const topPerformance = players
      .filter((p) => p.indiceAggiustato && p.indiceAggiustato > 85)
      .sort((a, b) => (b.indiceAggiustato || 0) - (a.indiceAggiustato || 0))
      .slice(0, 20)
      .map((p) => p.id);

    if (topPerformance.length > 0) {
      watchlists.push({
        id: "auto-top-performance",
        name: "📊 Top Performance",
        type: "auto",
        description: "Migliori per Indice Aggiustato (>85)",
        playerIds: topPerformance,
        priority: 9,
        color: "#8b5cf6",
        icon: "📊",
      });
    }

    // 3. DATI COMPLETI E AFFIDABILI (NUOVO)
    const fullData = players
      .filter((p) => 
        p.fonteDati === 'Entrambe' && 
        p.affidabilitaDati === 100 &&
        p.convenienzaPotenziale > 65
      )
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 25)
      .map((p) => p.id);

    if (fullData.length > 0) {
      watchlists.push({
        id: "auto-full-data",
        name: "✅ Dati Completi",
        type: "auto",
        description: "Giocatori con dati completi da entrambe le fonti",
        playerIds: fullData,
        priority: 8,
        color: "#10b981",
        icon: "✅",
      });
    }

    // Watchlist esistenti migliorate...
    // 4. TOP CONVENIENZA ASSOLUTA
    const topConvenienza = players
      .filter((p) => p.convenienzaPotenziale > 75)
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 20)
      .map((p) => p.id);

    if (topConvenienza.length > 0) {
      watchlists.push({
        id: "auto-top-convenienza",
        name: "💎 Top Convenienza",
        type: "auto",
        description: "I 20 giocatori con convenienza potenziale più alta (>75)",
        playerIds: topConvenienza,
        priority: 9,
        color: "#3b82f6",
        icon: "💎",
        criteria: { minConvenienza: 75 },
      });
    }

    // 5. BOMBER CERTIFICATI
    const bombers = players
      .filter(
        (p) =>
          (p.goals && p.goals > 10) ||
          (p.xG && p.xG > 12) ||
          (p.fantamediaCorrente > 7 && p.ruolo === "A")
      )
      .sort((a, b) => (b.goals || 0) - (a.goals || 0))
      .slice(0, 15)
      .map((p) => p.id);

    if (bombers.length > 0) {
      watchlists.push({
        id: "auto-bombers",
        name: "⚽ Bomber",
        type: "auto",
        description: "I migliori realizzatori",
        playerIds: bombers,
        priority: 7,
        color: "#f59e0b",
        icon: "⚽",
        criteria: { minGoals: 10 },
      });
    }

    // 6. OCCASIONI BUDGET (con Score_Affare)
    const budgetDeals = players
      .filter(
        (p) =>
          p.quotazione && p.quotazione <= 15 &&
          ((p.scoreAffare && p.scoreAffare > 70) || p.convenienzaPotenziale > 60) &&
          !p.infortunato
      )
      .sort((a, b) => (b.scoreAffare || b.convenienzaPotenziale) - (a.scoreAffare || a.convenienzaPotenziale))
      .slice(0, 25)
      .map((p) => p.id);

    if (budgetDeals.length > 0) {
      watchlists.push({
        id: "auto-budget-deals",
        name: "💰 Occasioni Budget",
        type: "auto",
        description: "Ottimi giocatori sotto i 15€ con buon Score Affare",
        playerIds: budgetDeals,
        priority: 6,
        color: "#64748b",
        icon: "💰",
      });
    }

    return watchlists;
  }
}