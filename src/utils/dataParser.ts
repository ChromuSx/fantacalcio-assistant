// src/utils/dataParser.ts
import * as XLSX from 'xlsx';
import { Player, Role, Trend, PlayerStatus } from '@/types';

export async function parseExcelFile(file: File, sheetName?: string): Promise<Player[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Usa il foglio specificato o il primo disponibile
        const targetSheet = sheetName || workbook.SheetNames[0];
        const sheet = workbook.Sheets[targetSheet];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        console.log(`Parsing sheet "${targetSheet}", found ${jsonData.length} rows`);
        
        const players = parseUnifiedData(jsonData);
        
        console.log(`Parsed ${players.length} valid players`);
        resolve(players);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsArrayBuffer(file);
  });
}

// Ottieni la lista dei fogli disponibili
export async function getSheetNames(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Errore lettura file'));
    reader.readAsArrayBuffer(file);
  });
}

function normalizeRole(role: string): Role {
  const normalized = role?.toString().toUpperCase().trim();
  
  if (['P', 'D', 'C', 'A'].includes(normalized)) {
    return normalized as Role;
  }
  
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

function parseUnifiedData(jsonData: any[]): Player[] {
  return jsonData.map((row: any, index) => {
    // Parsing Gol/Assist previsti (formato "min/max")
    let goalsMin = 0, goalsMax = 0, assistsMin = 0, assistsMax = 0;
    
    if (row['Gol previsti']) {
      if (typeof row['Gol previsti'] === 'string' && row['Gol previsti'].includes('/')) {
        const parts = row['Gol previsti'].split('/');
        goalsMin = parseInt(parts[0]) || 0;
        goalsMax = parseInt(parts[1]) || goalsMin;
      } else {
        goalsMax = parseInt(row['Gol previsti']) || 0;
        goalsMin = goalsMax;
      }
    }
    
    if (row['Assist previsti']) {
      if (typeof row['Assist previsti'] === 'string' && row['Assist previsti'].includes('/')) {
        const parts = row['Assist previsti'].split('/');
        assistsMin = parseInt(parts[0]) || 0;
        assistsMax = parseInt(parts[1]) || assistsMin;
      } else {
        assistsMax = parseInt(row['Assist previsti']) || 0;
        assistsMin = assistsMax;
      }
    }
    
    // Parsing delle skills (possono essere un array JSON come stringa)
    let skills = [];
    if (row['Skills']) {
      try {
        if (typeof row['Skills'] === 'string') {
          skills = JSON.parse(row['Skills'].replace(/'/g, '"'));
        } else if (Array.isArray(row['Skills'])) {
          skills = row['Skills'];
        }
      } catch (e) {
        console.warn('Errore parsing skills:', row['Skills']);
      }
    }
    
    return {
      id: index + 1,
      nome: row['Nome'] || '',
      ruolo: normalizeRole(row['Ruolo']),
      squadra: row['Squadra'] || '',
      
      // Quotazione e valore
      quotazione: parseFloat(row['quotazione_attuale']) || 0,
      valorePrezzo: parseFloat(row['Valore_su_Prezzo']) || 0,
      
      // Dati principali
      convenienzaPotenziale: parseFloat(row['Convenienza Potenziale']) || 0,
      convenienza: parseFloat(row['Convenienza']) || 0,
      punteggio: parseFloat(row['Punteggio']) || 0,
      
      // Fantamedie
      fantamediaCorrente: parseFloat(row['Fantamedia anno 2024-2025']) || 
                          parseFloat(row['fanta_avg']) || 0,
      fantamediaPrecedente: parseFloat(row['Fantamedia anno 2023-2024']) || 0,
      fantavotoMedio: parseFloat(row['fantavoto_medio']) || 0,
      fmTotGare: parseFloat(row['FM su tot gare 2024-2025']) || 0,
      presenzeCorrente: parseInt(row['Presenze campionato corrente']) || 
                        parseInt(row['presences']) || 0,
      presenzePrecedente: parseInt(row['Presenze 2024-2025']) || 0,
      
      // Caratteristiche
      skills: skills,
      trend: (row['Trend'] || 'STABLE') as Trend,
      infortunato: row['Infortunato'] === true || row['Infortunato'] === 'True',
      nuovoAcquisto: row['Nuovo acquisto'] === true || row['Nuovo acquisto'] === 'True',
      buonInvestimento: parseInt(row['Buon investimento']) || 0,
      resistenzaInfortuni: parseInt(row['Resistenza infortuni']) || 0,
      consigliatoProssimaGiornata: row['Consigliato prossima giornata'] === true,
      
      // Previsioni
      goals: parseInt(row['goals']) || goalsMax || 0,
      assists: parseInt(row['assists']) || assistsMax || 0,
      goalsMin,
      goalsMax,
      assistsMin,
      assistsMax,
      
      // Metriche avanzate
      xG: parseFloat(row['xgFromOpenPlays']) || 0,
      xA: parseFloat(row['xA']) || 0,
      yellowCards: parseInt(row['yellowCards']) || 0,
      redCards: parseInt(row['redCards']) || 0,
      fantaindex: parseFloat(row['fantacalcioFantaindex']) || 0,
      
      // NUOVI CAMPI dal file unificato
      scoreAffare: parseFloat(row['Score_Affare']) || 0,
      indiceUnificato: parseFloat(row['Indice_Unificato']) || 0,
      indiceAggiustato: parseFloat(row['Indice_Aggiustato']) || 0,
      affidabilitaDati: parseFloat(row['Affidabilita_Dati']) || 100,
      fonteDati: (row['Fonte_Dati'] || 'Entrambe') as 'Entrambe' | 'fpedia' | 'fstats',
      
      // Stato
      status: 'available' as PlayerStatus,
      owner: undefined,
      paidPrice: undefined
    };
  }).filter(p => p.nome && p.ruolo && ['P', 'D', 'C', 'A'].includes(p.ruolo));
}

// Esporta anche una funzione per caricare fogli specifici
export async function loadSpecificSheets(file: File): Promise<{[key: string]: Player[]}> {
  const sheetsToLoad = [
    'Tutti',
    'Super_Affari',
    'Top10_Per_Ruolo',
    'Occasioni_LowCost',
    'Titolari_Affidabili'
  ];
  
  const result: {[key: string]: Player[]} = {};
  
  for (const sheetName of sheetsToLoad) {
    try {
      const players = await parseExcelFile(file, sheetName);
      result[sheetName] = players;
    } catch (e) {
      console.warn(`Impossibile caricare foglio ${sheetName}:`, e);
    }
  }
  
  return result;
}