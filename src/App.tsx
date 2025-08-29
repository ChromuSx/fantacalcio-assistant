// src/App.tsx
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { TopBar } from '@/components/Layout/TopBar';
import { MainPanel } from '@/components/Layout/MainPanel';
import { SidePanel } from '@/components/Layout/SidePanel';
import { ImportModal } from '@/components/Modals/ImportModal';
import { SearchBar } from '@/components/SearchBar';
import { OtherTeamsTracker } from '@/components/OtherTeams/OtherTeamsTracker';
import { AuctionStats } from '@/components/AuctionStats/AuctionStats';
import { RoleFilter } from '@/components/Filters/RoleFilter';
import { useAuctionStore } from '@/stores/auctionStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import { BarChart, Users, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeView, setActiveView] = useState<'auction' | 'teams' | 'stats'>('auction');
  const players = useAuctionStore((state) => state.players);
  
  // Mostra modal import se non ci sono giocatori
  useEffect(() => {
    if (players.length === 0) {
      setShowImportModal(true);
    }
  }, [players.length]);
  
  // Attiva hotkeys
  useHotkeys();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
      
      <TopBar onImportClick={() => setShowImportModal(true)} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveView('auction')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'auction'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <BarChart size={18} />
            Asta Live
          </button>
          <button
            onClick={() => setActiveView('teams')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'teams'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <Users size={18} />
            Squadre
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'stats'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <TrendingUp size={18} />
            Statistiche
          </button>
        </div>
        
        <SearchBar />
        
        <div className="grid grid-cols-12 gap-6 mt-6">
          {activeView === 'auction' && (
            <>
              <div className="col-span-8">
                <MainPanel />
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <RoleFilter />
              </div>
            </>
          )}
          
          {activeView === 'teams' && (
            <>
              <div className="col-span-8">
                <OtherTeamsTracker />
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <AuctionStats />
              </div>
            </>
          )}
          
          {activeView === 'stats' && (
            <>
              <div className="col-span-8">
                <AuctionStats />
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <RoleFilter />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;