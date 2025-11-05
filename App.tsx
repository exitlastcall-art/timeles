import React, { useState, useEffect, useCallback } from 'react';
import { Capsule, CapsuleFile, Plan } from './types';
import Header from './components/Header';
import CapsuleList from './components/CapsuleList';
import CreateCapsuleModal from './components/CreateCapsuleModal';
import { PlusIcon } from './components/Icons';
import Intro from './components/Intro';
import MediaViewerModal from './components/MediaViewerModal';

const App: React.FC = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plan, setPlan] = useState<Plan>(() => (localStorage.getItem('userPlan') as Plan) || 'starter');
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('hasVisited'));
  const [viewingFile, setViewingFile] = useState<CapsuleFile | null>(null);

  useEffect(() => {
    try {
      const storedCapsules = localStorage.getItem('timeCapsules');
      if (storedCapsules) {
        setCapsules(JSON.parse(storedCapsules));
      }
    } catch (error) {
      console.error("Failed to load capsules from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('timeCapsules', JSON.stringify(capsules));
    } catch (error) {
      console.error("Failed to save capsules to localStorage", error);
    }
  }, [capsules]);

  const addCapsule = useCallback((newCapsule: Capsule) => {
    setCapsules(prevCapsules => [...prevCapsules, newCapsule]);
    setIsModalOpen(false);
  }, []);

  const deleteCapsule = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to delete this capsule? This action cannot be undone.")) {
        setCapsules(prevCapsules => prevCapsules.filter(capsule => capsule.id !== id));
    }
  }, []);
  
  const sealCapsule = useCallback((id: string) => {
    if (window.confirm("Are you sure you want to seal this capsule? Once sealed, it cannot be edited or deleted.")) {
        setCapsules(prevCapsules => 
          prevCapsules.map(capsule => 
            capsule.id === id ? { ...capsule, isSealed: true } : capsule
          )
        );
    }
  }, []);

  const handleStart = (selectedPlan: Plan) => {
    localStorage.setItem('hasVisited', 'true');
    localStorage.setItem('userPlan', selectedPlan);
    setPlan(selectedPlan);
    setShowIntro(false);
  };

  const handleViewFile = useCallback((file: CapsuleFile) => {
    setViewingFile(file);
  }, []);

  if (showIntro) {
    return <Intro onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-28"> {/* Add padding for FAB */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Your Time Capsules</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex bg-gray-200 hover:bg-white text-black font-semibold py-4 px-8 rounded-md items-center transition duration-300 ease-in-out transform hover:scale-105 text-lg"
            aria-label="Create new time capsule"
          >
            <PlusIcon className="h-6 w-6 mr-3" />
            Create New
          </button>
        </div>
        
        <CapsuleList 
          capsules={capsules} 
          onDelete={deleteCapsule}
          onSeal={sealCapsule}
          onViewFile={handleViewFile}
        />

        {capsules.length === 0 && (
          <div className="text-center py-20 px-6 bg-black/50 rounded-lg shadow-xl mt-8 border border-gray-800">
            <h2 className="text-4xl text-gray-300 mb-4">No capsules yet.</h2>
            <p className="text-xl text-gray-500 mb-8 max-w-lg mx-auto">Click "Create New" to start preserving your memories for the future. What moments will you capture today?</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gray-200 hover:bg-white text-black font-semibold py-4 px-8 rounded-md flex items-center transition duration-300 ease-in-out transform hover:scale-105 mx-auto text-lg"
            >
              <PlusIcon className="h-6 w-6 mr-3" />
              Create Your First Capsule
            </button>
          </div>
        )}
      </main>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 bg-gray-200 hover:bg-white text-black p-4 rounded-full shadow-lg z-20 transition-transform duration-300 transform hover:scale-110"
        aria-label="Create new time capsule"
      >
        <PlusIcon className="h-8 w-8" />
      </button>

      {isModalOpen && (
        <CreateCapsuleModal
          plan={plan}
          onClose={() => setIsModalOpen(false)}
          onSave={addCapsule}
        />
      )}

      {viewingFile && (
        <MediaViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
};

export default App;