// src/App.tsx
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { TopBar } from '@/components/Layout/TopBar';
import { MainPanel } from '@/components/Layout/MainPanel';
import { SidePanel } from '@/components/Layout/SidePanel';
import { ImportModal } from '@/components/Modals/ImportModal';
import { SearchBar } from '@/components/SearchBar';
import { useAuctionStore } from '@/stores/auctionStore';
import { useHotkeys } from '@/hooks/useHotkeys';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);
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
        <SearchBar />
        
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-8">
            <MainPanel />
          </div>
          <div className="col-span-4">
            <SidePanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;