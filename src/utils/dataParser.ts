// src/utils/dataParser.ts
import * as XLSX from 'xlsx';
import { Player, Role, Trend, PlayerStatus } from '@/types';

export async function parseExcelFile(file: File, source: 'fpedia' | 'fstats' = 'fpedia'): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`Parsing ${source} data, found ${jsonData.length} rows`);
        if (jsonData.length > 0) {
          console.log('First row example:', jsonData[0]);
        }
        
        const players: Player[] = source === 'fpedia' 
          ? parseFpediaData(jsonData)
          : parseFstatsData(jsonData);
        
        console.log(`Parsed ${players.length} valid players`);
        if (players.length > 0) {
          console.log('First player parsed:', players[0]);
        }
        
        resolve(players);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsArrayBuffer(file);
  });
}

// Funzione helper per normalizzare il ruolo
function normalizeRole(role: string): Role {
  const normalized = role?.toString().toUpperCase().trim();
  
  // Prova prima con il valore esatto
  if (['P', 'D', 'C', 'A'].includes(normalized)) {
    return normalized as Role;
  }
  
  // Prova con il primo carattere
  const firstChar = normalized?.charAt(0);
  switch (firstChar) {
    case 'P': return 'P';
    case 'D': return 'D';
    case 'C': return 'C';
    case 'A': return 'A';
    default:
      console.warn(`Ruolo non riconosciuto: "${role}" - default a D`);
      return 'D';
  }
}

function parseFpediaData(jsonData: any[]): Player[] {
  return jsonData.map((row: any, index) => ({
    id: index + 1,
    nome: row['Nome'] || '',
    ruolo: normalizeRole(row['Ruolo']),
    squadra: row['Squadra'] || '',
    
    // Dati principali FPEDIA
    convenienzaPotenziale: parseFloat(row['Convenienza Potenziale']) || 0,
    convenienza: parseFloat(row['Convenienza']) || 0,
    punteggio: parseFloat(row['Punteggio']) || 0,
    
    // Fantamedie
    fantamediaCorrente: parseFloat(row['Fantamedia anno 2024-2025']) || 0,
    fantamediaPrecedente: parseFloat(row['Fantamedia anno 2023-2024']) || 0,
    presenzeCorrente: parseInt(row['Presenze campionato corrente']) || 0,
    presenzePrecedente: parseInt(row['Partite giocate']) || 0,
    
    // Caratteristiche
    trend: (row['Trend'] || 'STABLE') as Trend,
    infortunato: row['Infortunato'] === true || row['Infortunato'] === 'True',
    nuovoAcquisto: row['Nuovo acquisto'] === true || row['Nuovo acquisto'] === 'True',
    buonInvestimento: parseInt(row['Buon investimento']) || 0,
    resistenzaInfortuni: parseInt(row['Resistenza infortuni']) || 0,
    consigliatoProssimaGiornata: row['Consigliato prossima giornata'] === true,
    skills: row['Skills'] ? JSON.parse(row['Skills'].replace(/'/g, '"')) : [],
    
    // Previsioni
    goals: parseInt(row['Gol previsti']) || 0,
    assists: parseInt(row['Assist previsti']) || 0,
    
    // Stato
    status: 'available' as PlayerStatus,
    owner: undefined,
    paidPrice: undefined
  })).filter(p => p.nome && p.ruolo && ['P', 'D', 'C', 'A'].includes(p.ruolo));
}

function parseFstatsData(jsonData: any[]): Player[] {
  return jsonData.map((row: any, index) => ({
    id: index + 1,
    nome: row['Nome'] || '',
    ruolo: normalizeRole(row['Ruolo']),
    squadra: row['Squadra'] || '',
    
    // Dati principali FSTATS
    convenienzaPotenziale: parseFloat(row['Convenienza Potenziale']) || 0,
    convenienza: parseFloat(row['Convenienza']) || 0,
    punteggio: 0, // Non presente in FSTATS
    
    // Statistiche
    fantamediaCorrente: parseFloat(row['fanta_avg']) || 0,
    presenzeCorrente: parseInt(row['presences']) || 0,
    
    // Stats avanzate
    goals: parseInt(row['goals']) || 0,
    assists: parseInt(row['assists']) || 0,
    xG: parseFloat(row['xgFromOpenPlays']) || 0,
    xA: parseFloat(row['xA']) || 0,
    yellowCards: parseInt(row['yellowCards']) || 0,
    redCards: parseInt(row['redCards']) || 0,
    fantaindex: parseFloat(row['fantacalcioFantaindex']) || 0,
    
    // Default values per campi mancanti
    trend: 'STABLE' as Trend,
    infortunato: false,
    nuovoAcquisto: false,
    
    // Stato
    status: 'available' as PlayerStatus,
    owner: undefined,
    paidPrice: undefined
  })).filter(p => p.nome && p.ruolo && ['P', 'D', 'C', 'A'].includes(p.ruolo));
}

export function mergePlayerData(fpediaData: Player[], fstatsData: Player[]): Player[] {
  // Crea una mappa dei giocatori FSTATS per nome
  const fstatsMap = new Map<string, Player>();
  fstatsData.forEach(player => {
    // Normalizza il nome per il matching (rimuovi spazi extra, converti in lowercase)
    const normalizedName = player.nome.toLowerCase().trim();
    fstatsMap.set(normalizedName, player);
  });
  
  // Merge: parti da FPEDIA (dati più completi) e arricchisci con FSTATS
  const mergedPlayers = fpediaData.map(fpediaPlayer => {
    const normalizedName = fpediaPlayer.nome.toLowerCase().trim();
    const fstatsPlayer = fstatsMap.get(normalizedName);
    
    if (fstatsPlayer) {
      // Trovato match: unisci i dati
      return {
        ...fpediaPlayer,
        // Sovrascrivi/aggiungi dati da FSTATS
        xG: fstatsPlayer.xG || fpediaPlayer.xG,
        xA: fstatsPlayer.xA || fpediaPlayer.xA,
        yellowCards: fstatsPlayer.yellowCards || fpediaPlayer.yellowCards,
        redCards: fstatsPlayer.redCards || fpediaPlayer.redCards,
        fantaindex: fstatsPlayer.fantaindex || fpediaPlayer.fantaindex,
        
        // Se FSTATS ha dati più aggiornati su gol/assist, usali
        goals: fstatsPlayer.goals || fpediaPlayer.goals,
        assists: fstatsPlayer.assists || fpediaPlayer.assists,
        
        // Media delle convenienze se entrambe presenti
        convenienzaPotenziale: fpediaPlayer.convenienzaPotenziale > 0 && fstatsPlayer.convenienzaPotenziale > 0
          ? (fpediaPlayer.convenienzaPotenziale + fstatsPlayer.convenienzaPotenziale) / 2
          : fpediaPlayer.convenienzaPotenziale || fstatsPlayer.convenienzaPotenziale,
      };
    }
    
    // Nessun match trovato: ritorna solo dati FPEDIA
    return fpediaPlayer;
  });
  
  // Aggiungi giocatori che sono solo in FSTATS (non in FPEDIA)
  fstatsData.forEach(fstatsPlayer => {
    const normalizedName = fstatsPlayer.nome.toLowerCase().trim();
    const existsInFpedia = fpediaData.some(
      fp => fp.nome.toLowerCase().trim() === normalizedName
    );
    
    if (!existsInFpedia) {
      mergedPlayers.push(fstatsPlayer);
    }
  });
  
  // Riassegna gli ID per essere sequenziali
  return mergedPlayers.map((player, index) => ({
    ...player,
    id: index + 1
  }));
}

// Funzione helper per normalizzare i nomi (utile per matching migliore)
export function normalizePlayerName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // Rimuovi spazi multipli
    .replace(/['']/g, "'") // Normalizza apostrofi
    .replace(/[-–—]/g, '-'); // Normalizza trattini
}