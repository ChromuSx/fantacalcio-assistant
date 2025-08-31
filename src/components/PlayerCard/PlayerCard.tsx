// src/components/PlayerCard/PlayerCard.tsx
import { useState, useMemo } from 'react';
import { Player, Recommendation } from '@/types';
import { useAuctionStore } from '@/stores/auctionStore';
import { QuickAssignModal } from '@/components/Modals/QuickAssignModal';
import { 
  TrendingUp, TrendingDown, Minus, AlertTriangle, 
  Heart, Star, Target, Users, Coins, MoreVertical,
  BookOpen, Eye, Plus
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { AddToWatchlist } from '../Watchlist/AddToWatchlist';

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [otherOwner, setOtherOwner] = useState<string>('');
  const [showQuickAssign, setShowQuickAssign] = useState(false);
  
  const { 
    calculateMaxPrice, 
    purchasePlayer, 
    budgetRemaining,
    getPlayerNotes,
    watchlists,
    isPlayerInWatchlist,
    addToWatchlist,
    removeFromWatchlist
  } = useAuctionStore();
  
  const maxPrice = calculateMaxPrice(player);
  const playerNotes = useMemo(() => getPlayerNotes(player.id), [player.id, getPlayerNotes]);
  
  // Controlla in quali watchlist è presente il giocatore
  const playerWatchlists = useMemo(() => {
    return watchlists.filter(w => isPlayerInWatchlist(player.id, w.id));
  }, [watchlists, player.id, isPlayerInWatchlist]);
  
  // Calcola raccomandazione migliorata
  const getRecommendation = (): Recommendation => {
    if (player.fantaindex) {
      const score = (player.convenienzaPotenziale + player.fantaindex) / 2;
      if (score > 75) return 'COMPRA';
      if (score > 55) return 'VALUTA';
      return 'LASCIA';
    }
    
    if (player.convenienzaPotenziale > 70) return 'COMPRA';
    if (player.convenienzaPotenziale > 50) return 'VALUTA';
    return 'LASCIA';
  };
  
  const recommendation = getRecommendation();
  
  const recommendationConfig = {
    COMPRA: { color: 'bg-green-500', text: 'COMPRA', icon: '🟢' },
    VALUTA: { color: 'bg-yellow-500', text: 'VALUTA', icon: '🟡' },
    LASCIA: { color: 'bg-red-500', text: 'LASCIA', icon: '🔴' }
  };
  
  const handlePurchase = (owner: string) => {
    const price = parseInt(purchasePrice);
    
    if (!price || price <= 0) {
      toast.error('Inserisci un prezzo valido');
      return;
    }
    
    if (owner === 'me' && price > budgetRemaining) {
      toast.error('Budget insufficiente!');
      return;
    }
    
    purchasePlayer(player, price, owner);
    toast.success(`${player.nome} acquistato per ${price} crediti`);
    setPurchasePrice('');
    setOtherOwner('');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header con raccomandazione */}
      <div className={clsx(
        "px-6 py-4 text-white flex justify-between items-center",
        recommendationConfig[recommendation].color
      )}>
        <div>
          <h2 className="text-2xl font-bold">{player.nome}</h2>
          <p className="opacity-90">
            {player.squadra} - Ruolo: {player.ruolo}
            {player.quotazione && (
              <span className="ml-3 px-2 py-1 bg-white/20 rounded text-sm">
                📊 Quotazione: {player.quotazione}€
              </span>
            )}
          </p>
          
          {/* Indicatori Note e Watchlist */}
          <div className="flex gap-2 mt-2">
            {playerNotes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm">
                <BookOpen size={14} />
                {playerNotes.length} note
              </span>
            )}
            {playerWatchlists.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm">
                <Eye size={14} />
                In {playerWatchlists.length} watchlist
              </span>
            )}
          </div>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-1">{recommendationConfig[recommendation].icon}</div>
          <div className="text-xl font-bold">{recommendationConfig[recommendation].text}</div>
        </div>
      </div>
      
      {/* Watchlist badges */}
      {playerWatchlists.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b flex gap-2 flex-wrap">
          {playerWatchlists.slice(0, 3).map(watchlist => (
            <span
              key={watchlist.id}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
              style={{ 
                backgroundColor: `${watchlist.color}20`,
                color: watchlist.color
              }}
            >
              <span>{watchlist.icon}</span>
              {watchlist.name}
            </span>
          ))}
          {playerWatchlists.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-gray-200 text-gray-600">
              +{playerWatchlists.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Statistiche principali */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Star className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <p className="text-sm text-gray-600">Convenienza</p>
            <p className="text-2xl font-bold text-purple-600">
              {player.convenienzaPotenziale.toFixed(1)}
            </p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Target className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <p className="text-sm text-gray-600">Fantamedia</p>
            <p className="text-2xl font-bold text-blue-600">
              {player.fantamediaCorrente.toFixed(2)}
            </p>
            {player.fmTotGare && (
              <p className="text-xs text-gray-500 mt-1">
                Tot: {player.fmTotGare.toFixed(2)}
              </p>
            )}
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <p className="text-sm text-gray-600">Presenze</p>
            <p className="text-2xl font-bold text-green-600">
              {player.presenzeCorrente}
            </p>
          </div>
          
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <Coins className="w-6 h-6 mx-auto mb-1 text-amber-600" />
            <p className="text-sm text-gray-600">Max consigliato</p>
            <p className="text-2xl font-bold text-amber-600">
              {maxPrice}
            </p>
            {player.valorePrezzo && (
              <p className="text-xs text-gray-500 mt-1">
                V/P: {player.valorePrezzo.toFixed(1)}
              </p>
            )}
          </div>
        </div>
        
        {/* Tags informativi */}
        <div className="flex flex-wrap gap-2 mb-6">
          {player.infortunato && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              <AlertTriangle size={14} />
              Infortunato
            </span>
          )}
          
          {player.nuovoAcquisto && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              🆕 Nuovo acquisto
            </span>
          )}
          
          {player.trend === 'UP' && (
            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <TrendingUp size={14} />
              Trend positivo
            </span>
          )}
          
          {player.trend === 'DOWN' && (
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
              <TrendingDown size={14} />
              Trend negativo
            </span>
          )}
          
          {player.resistenzaInfortuni && player.resistenzaInfortuni > 70 && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <Heart size={14} />
              Resistente
            </span>
          )}
          
          {player.goalsMin && player.goalsMax ? (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
              ⚽ {player.goalsMin}-{player.goalsMax} gol previsti
            </span>
          ) : player.goals && player.goals > 5 && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
              ⚽ {player.goals} gol
            </span>
          )}

          {player.assistsMin && player.assistsMax ? (
            <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
              🎯 {player.assistsMin}-{player.assistsMax} assist previsti
            </span>
          ) : player.assists && player.assists > 3 && (
            <span className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm">
              🎯 {player.assists} assist
            </span>
          )}
          
          {player.yellowCards && player.yellowCards > 5 && (
            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              🟨 {player.yellowCards} gialli
            </span>
          )}
          
          {player.redCards && player.redCards > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              🟥 {player.redCards} rossi
            </span>
          )}
        </div>
        
        {/* Note Summary */}
        {playerNotes.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-sm text-purple-800 mb-2 flex items-center gap-2">
              <BookOpen size={16} />
              Riepilogo Note ({playerNotes.length})
            </h4>
            <div className="space-y-1">
              {playerNotes.slice(0, 2).map(note => (
                <p key={note.id} className="text-sm text-purple-700">
                  • {note.content.substring(0, 100)}...
                </p>
              ))}
              {playerNotes.length > 2 && (
                <p className="text-sm text-purple-600 italic">
                  +{playerNotes.length - 2} altre note disponibili
                </p>
              )}
            </div>
          </div>
        )}
        
{/* Statistiche aggiuntive se disponibili */}
        {(player.xG || player.xA || player.fantaindex || player.scoreAffare || player.indiceAggiustato) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-600 mb-2">Metriche avanzate</h4>
            <div className="grid grid-cols-2 gap-4">
              {player.scoreAffare && (
                <div className="col-span-2 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    🏆 Score Affare
                    {player.affidabilitaDati && player.affidabilitaDati < 100 && (
                      <span className="text-xs text-gray-500">
                        (affidabilità: {player.affidabilitaDati}%)
                      </span>
                    )}
                  </span>
                  <p className="font-bold text-2xl text-amber-700">
                    {player.scoreAffare.toFixed(1)}
                    <span className="text-sm font-normal text-gray-600">/100</span>
                  </p>
                </div>
              )}
              {player.indiceAggiustato && (
                <div>
                  <span className="text-sm text-gray-500">Indice Performance</span>
                  <p className="font-semibold text-purple-600">
                    {player.indiceAggiustato.toFixed(1)}
                    {player.indiceUnificato && (
                      <span className="text-xs text-gray-500 ml-1">
                        (base: {player.indiceUnificato.toFixed(1)})
                      </span>
                    )}
                  </p>
                </div>
              )}
              {player.xG && (
                <div>
                  <span className="text-sm text-gray-500">Expected Goals (xG)</span>
                  <p className="font-semibold">{player.xG.toFixed(2)}</p>
                </div>
              )}
              {player.xA && (
                <div>
                  <span className="text-sm text-gray-500">Expected Assists (xA)</span>
                  <p className="font-semibold">{player.xA.toFixed(2)}</p>
                </div>
              )}
              {player.fantaindex && (
                <div>
                  <span className="text-sm text-gray-500">Fantaindex</span>
                  <p className="font-semibold">{player.fantaindex.toFixed(1)}</p>
                </div>
              )}
              {player.fonteDati && (
                <div className="col-span-2 text-center pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Fonte dati: {player.fonteDati === 'Entrambe' ? '✅ Completa (fpedia + fstats)' : player.fonteDati}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Sezione acquisto */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-700 mb-3">Acquista giocatore</h3>
          
          <div className="flex gap-3">
            <input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Prezzo"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              max={budgetRemaining}
            />
            
            <button
              onClick={() => handlePurchase('me')}
              disabled={!purchasePrice}
              className={clsx(
                "px-6 py-2 rounded-lg font-semibold transition",
                purchasePrice
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              💰 Mio
            </button>
            
            <button
              onClick={() => {
                const owner = prompt('Nome del proprietario:');
                if (owner) handlePurchase(owner);
              }}
              disabled={!purchasePrice}
              className={clsx(
                "px-6 py-2 rounded-lg font-semibold transition",
                purchasePrice
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              👥 Altri
            </button>

            <AddToWatchlist 
              player={player} 
              variant="dropdown"
              size="md"
            />
            
            <button
              onClick={() => setShowQuickAssign(true)}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              title="Assegnazione rapida"
            >
              <MoreVertical size={18} />
            </button>
          </div>
          
          {/* Suggerimento prezzo */}
          {purchasePrice && parseInt(purchasePrice) > maxPrice && (
            <p className="mt-2 text-sm text-orange-600">
              ⚠️ Stai offrendo più del prezzo massimo consigliato ({maxPrice})
            </p>
          )}
        </div>
      </div>
      
      {/* Quick Assign Modal */}
      {showQuickAssign && (
        <QuickAssignModal 
          player={player} 
          onClose={() => setShowQuickAssign(false)} 
        />
      )}
    </div>
  );
}