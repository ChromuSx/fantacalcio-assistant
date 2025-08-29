// src/components/Modals/ImportModal.tsx
import { useRef, useState } from 'react';
import { Upload, X, FileSpreadsheet, Check } from 'lucide-react';
import { useAuctionStore } from '@/stores/auctionStore';
import { parseExcelFile, mergePlayerData } from '@/utils/dataParser';
import toast from 'react-hot-toast';

interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const fpediaInputRef = useRef<HTMLInputElement>(null);
  const fstatsInputRef = useRef<HTMLInputElement>(null);
  const { setPlayers } = useAuctionStore();
  
  const [fpediaData, setFpediaData] = useState<any[]>([]);
  const [fstatsData, setFstatsData] = useState<any[]>([]);
  const [fpediaLoaded, setFpediaLoaded] = useState(false);
  const [fstatsLoaded, setFstatsLoaded] = useState(false);
  
  const handleFpediaImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const players = await parseExcelFile(file, 'fpedia');
      setFpediaData(players);
      setFpediaLoaded(true);
      toast.success(`FPEDIA: ${players.length} giocatori caricati`);
    } catch (error) {
      console.error('Errore import FPEDIA:', error);
      toast.error('Errore nel caricamento del file FPEDIA');
    }
  };
  
  const handleFstatsImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const players = await parseExcelFile(file, 'fstats');
      setFstatsData(players);
      setFstatsLoaded(true);
      toast.success(`FSTATS: ${players.length} giocatori caricati`);
    } catch (error) {
      console.error('Errore import FSTATS:', error);
      toast.error('Errore nel caricamento del file FSTATS');
    }
  };
  
  const handleMergeAndImport = () => {
    if (!fpediaLoaded && !fstatsLoaded) {
      toast.error('Carica almeno un file!');
      return;
    }
    
    // Merge dei dati se abbiamo entrambi, altrimenti usa quello che c'è
    let finalData;
    if (fpediaLoaded && fstatsLoaded) {
      finalData = mergePlayerData(fpediaData, fstatsData);
      toast.success('Dati uniti con successo!');
    } else if (fpediaLoaded) {
      finalData = fpediaData;
    } else {
      finalData = fstatsData;
    }
    
    setPlayers(finalData);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full">
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
          Puoi caricare uno o entrambi i file. Se carichi entrambi, i dati verranno uniti automaticamente per avere informazioni complete.
        </p>
        
        <div className="space-y-4">
          {/* FPEDIA Import */}
          <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${
            fpediaLoaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className={fpediaLoaded ? 'text-green-600' : 'text-gray-400'} size={32} />
                <div>
                  <h3 className="font-semibold">fpedia_analysis.xlsx</h3>
                  <p className="text-sm text-gray-500">
                    Convenienza, infortuni, trend, valutazioni
                  </p>
                </div>
              </div>
              {fpediaLoaded && <Check className="text-green-600" size={24} />}
            </div>
            
            <input
              ref={fpediaInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFpediaImport}
              className="hidden"
            />
            
            <button
              onClick={() => fpediaInputRef.current?.click()}
              className={`mt-4 w-full py-2 px-4 rounded-lg transition ${
                fpediaLoaded 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {fpediaLoaded ? '✓ Caricato - Clicca per cambiare' : 'Carica FPEDIA'}
            </button>
          </div>
          
          {/* FSTATS Import */}
          <div className={`border-2 border-dashed rounded-lg p-6 transition-all ${
            fstatsLoaded ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className={fstatsLoaded ? 'text-green-600' : 'text-gray-400'} size={32} />
                <div>
                  <h3 className="font-semibold">FSTATS_analysis.xlsx</h3>
                  <p className="text-sm text-gray-500">
                    xG, xA, statistiche avanzate, fantaindex
                  </p>
                </div>
              </div>
              {fstatsLoaded && <Check className="text-green-600" size={24} />}
            </div>
            
            <input
              ref={fstatsInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFstatsImport}
              className="hidden"
            />
            
            <button
              onClick={() => fstatsInputRef.current?.click()}
              className={`mt-4 w-full py-2 px-4 rounded-lg transition ${
                fstatsLoaded 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {fstatsLoaded ? '✓ Caricato - Clicca per cambiare' : 'Carica FSTATS'}
            </button>
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Consiglio:</strong> Carica entrambi i file per avere dati completi. 
            FPEDIA fornisce le valutazioni per il fantacalcio, FSTATS aggiunge metriche avanzate.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annulla
          </button>
          <button
            onClick={handleMergeAndImport}
            disabled={!fpediaLoaded && !fstatsLoaded}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              (fpediaLoaded || fstatsLoaded)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {fpediaLoaded && fstatsLoaded 
              ? 'Unisci e Importa' 
              : 'Importa Dati'}
          </button>
        </div>
      </div>
    </div>
  );
}