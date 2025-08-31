// src/components/Modals/ImportModal.tsx
import { useRef, useState, useEffect } from 'react';
import { Upload, X, FileSpreadsheet, Check, ChevronDown, Lightbulb } from 'lucide-react';
import { useAuctionStore } from '@/stores/auctionStore';
import { parseExcelFile, getSheetNames } from '@/utils/dataParser';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setPlayers } = useAuctionStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('Tutti');
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  // Descrizioni dei fogli
  const sheetDescriptions: {[key: string]: string} = {
    'Tutti': '🗂️ Tutti i giocatori con dati completi',
    'P_Top50': '🥅 I migliori 50 portieri',
    'D_Top50': '🛡️ I migliori 50 difensori',
    'C_Top50': '⚡ I migliori 50 centrocampisti',
    'A_Top50': '⚽ I migliori 50 attaccanti',
    'Super_Affari': '💎 I migliori affari secondo Score_Affare',
    'Top10_Per_Ruolo': '🏆 Top 10 per ogni ruolo',
    'Occasioni_LowCost': '💰 Occasioni a basso prezzo',
    'Titolari_Affidabili': '✅ Titolari con alta affidabilità',
    'Nuovi_e_Giovani': '🆕 Nuovi acquisti e giovani promesse',
    'Top_Movimento': '📈 Giocatori con trend positivo',
    'Fascia_Low_1-10': '📊 Fascia prezzo 1-10 crediti',
    'Fascia_Mid_11-20': '📊 Fascia prezzo 11-20 crediti'
  };
  
  // Carica il file e ottieni i fogli disponibili
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      const sheets = await getSheetNames(selectedFile);
      setSheetNames(sheets);
      
      // Seleziona "Tutti" di default se disponibile
      if (sheets.includes('Tutti')) {
        setSelectedSheet('Tutti');
      } else {
        setSelectedSheet(sheets[0]);
      }
      
      toast.success(`File caricato: ${sheets.length} fogli trovati`);
    } catch (error) {
      console.error('Errore caricamento file:', error);
      toast.error('Errore nel caricamento del file');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Anteprima dei dati dal foglio selezionato
  useEffect(() => {
    if (file && selectedSheet) {
      loadPreview();
    }
  }, [selectedSheet, file]);
  
  const loadPreview = async () => {
    if (!file) return;
    
    setIsLoading(true);
    try {
      const players = await parseExcelFile(file, selectedSheet);
      
      // Statistiche per l'anteprima
      const stats = {
        total: players.length,
        byRole: {
          P: players.filter(p => p.ruolo === 'P').length,
          D: players.filter(p => p.ruolo === 'D').length,
          C: players.filter(p => p.ruolo === 'C').length,
          A: players.filter(p => p.ruolo === 'A').length
        },
        avgConvenienza: players.reduce((sum, p) => sum + p.convenienzaPotenziale, 0) / players.length,
        avgScoreAffare: players.filter(p => p.scoreAffare).reduce((sum, p) => sum + (p.scoreAffare || 0), 0) / players.filter(p => p.scoreAffare).length,
        withFullData: players.filter(p => p.fonteDati === 'Entrambe').length,
        topPlayers: players.sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale).slice(0, 5)
      };
      
      setPreviewData(stats);
    } catch (error) {
      console.error('Errore anteprima:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Importa i dati
  const handleImport = async () => {
    if (!file || !selectedSheet) {
      toast.error('Seleziona un file e un foglio');
      return;
    }
    
    setIsLoading(true);
    try {
      const players = await parseExcelFile(file, selectedSheet);
      setPlayers(players);
      toast.success(`${players.length} giocatori importati con successo!`);
      onClose();
    } catch (error) {
      console.error('Errore importazione:', error);
      toast.error('Errore durante l\'importazione');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Importa Dati Giocatori</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Carica il file Excel unificato con tutti i dati dei giocatori. 
          Puoi scegliere quale foglio importare in base alle tue esigenze.
        </p>
        
        {/* Selezione File */}
        <div className={clsx(
          "border-2 border-dashed rounded-lg p-6 transition-all mb-6",
          file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className={file ? 'text-green-600' : 'text-gray-400'} size={32} />
              <div>
                <h3 className="font-semibold">
                  {file ? file.name : 'analisi_unificata_fantacalcio.xlsx'}
                </h3>
                <p className="text-sm text-gray-500">
                  File Excel con dati unificati fpedia + fstats
                </p>
              </div>
            </div>
            {file && <Check className="text-green-600" size={24} />}
          </div>
          
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => inputRef.current?.click()}
            className={clsx(
              "mt-4 w-full py-2 px-4 rounded-lg transition",
              file 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
            disabled={isLoading}
          >
            {file ? '✓ Cambia File' : 'Seleziona File'}
          </button>
        </div>
        
        {/* Selezione Foglio */}
        {sheetNames.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona il foglio da importare:
            </label>
            <div className="grid grid-cols-2 gap-3">
              {sheetNames.map(sheet => (
                <button
                  key={sheet}
                  onClick={() => setSelectedSheet(sheet)}
                  className={clsx(
                    "p-3 rounded-lg border-2 transition-all text-left",
                    selectedSheet === sheet
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="font-semibold">{sheet}</div>
                  {sheetDescriptions[sheet] && (
                    <div className="text-sm text-gray-600 mt-1">
                      {sheetDescriptions[sheet]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Anteprima Dati */}
        {previewData && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Lightbulb size={18} />
              Anteprima Foglio: {selectedSheet}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Totale giocatori:</span>
                <span className="ml-2 font-semibold">{previewData.total}</span>
              </div>
              <div>
                <span className="text-gray-600">Convenienza media:</span>
                <span className="ml-2 font-semibold">
                  {previewData.avgConvenienza.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Per ruolo:</span>
                <span className="ml-2 font-semibold">
                  P:{previewData.byRole.P} D:{previewData.byRole.D} 
                  C:{previewData.byRole.C} A:{previewData.byRole.A}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Score Affare medio:</span>
                <span className="ml-2 font-semibold">
                  {previewData.avgScoreAffare ? previewData.avgScoreAffare.toFixed(1) : 'N/D'}
                </span>
              </div>
            </div>
            
            {previewData.topPlayers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Top 5 per convenienza:</p>
                <div className="space-y-1">
                  {previewData.topPlayers.map((p: any, idx: number) => (
                    <div key={idx} className="text-sm flex justify-between">
                      <span>{idx + 1}. {p.nome} ({p.ruolo})</span>
                      <span className="font-semibold text-purple-600">
                        {p.convenienzaPotenziale.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Info Box */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            💡 <strong>Suggerimento:</strong> Usa "Tutti" per avere tutti i giocatori, 
            oppure scegli un foglio specifico come "Super_Affari" per una selezione 
            già filtrata dei migliori affari.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annulla
          </button>
          <button
            onClick={handleImport}
            disabled={!file || !selectedSheet || isLoading}
            className={clsx(
              "flex-1 py-3 px-4 rounded-lg font-semibold transition",
              file && selectedSheet && !isLoading
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isLoading ? 'Caricamento...' : 'Importa Dati'}
          </button>
        </div>
      </div>
    </div>
  );
}