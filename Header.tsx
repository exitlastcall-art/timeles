import React from 'react';
import { HourglassIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <HourglassIcon className="h-8 w-8 text-gray-400 mr-3" />
          <h1 className="text-2xl font-bold tracking-wider text-white">
            Timeless
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;