import React from 'react';
import { Capsule, CapsuleFile } from '../types';
import CapsuleCard from './CapsuleCard';

interface CapsuleListProps {
  capsules: Capsule[];
  onDelete: (id: string) => void;
  onSeal: (id: string) => void;
  onViewFile: (file: CapsuleFile) => void;
}

const CapsuleList: React.FC<CapsuleListProps> = ({ capsules, onDelete, onSeal, onViewFile }) => {
  const sortedCapsules = [...capsules].sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sortedCapsules.map((capsule) => (
        <CapsuleCard 
            key={capsule.id} 
            capsule={capsule} 
            onDelete={onDelete}
            onSeal={onSeal}
            onViewFile={onViewFile}
        />
      ))}
    </div>
  );
};

export default CapsuleList;