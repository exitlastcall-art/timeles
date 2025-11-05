import React from 'react';
import { Capsule, CapsuleFile } from '../types';
import { LockClosedIcon, TrashIcon, CalendarIcon, UserIcon, WaveformIcon, EnvelopeIcon, HomeIcon, VideoCameraIcon, PaperClipIcon } from './Icons';

interface CapsuleCardProps {
  capsule: Capsule;
  onDelete: (id: string) => void;
  onSeal: (id: string) => void;
  onViewFile: (file: CapsuleFile) => void;
}

const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onDelete, onSeal, onViewFile }) => {
  const deliveryDate = new Date(capsule.deliveryDate);
  const isPast = deliveryDate < new Date();
  
  const formatDate = (date: Date) => {
      return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      });
  }

  const attachment = capsule.file;
  const isAudio = attachment?.type.startsWith('audio/');
  const isVideo = attachment?.type.startsWith('video/');
  const isPhysical = capsule.deliveryMethod === 'physical';
  const hasCustomLetterDesign = isPhysical && capsule.coverImageUrl && !capsule.coverImageUrl.includes('picsum.photos');

  const getAttachmentButton = () => {
    if (!attachment) return null;

    let icon = <PaperClipIcon className="h-6 w-6 mr-3" />;
    let label = 'View Attachment';

    if (isAudio) {
        icon = <WaveformIcon className="h-6 w-6 mr-3" />;
        label = 'Play Recording';
    } else if (isVideo) {
        icon = <VideoCameraIcon className="h-6 w-6 mr-3" />;
        label = 'Play Video';
    }

    return (
        <div className="mb-6">
            <button 
                onClick={() => onViewFile(attachment)}
                className="w-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-md transition duration-200 text-base"
                aria-label={label}
            >
                {icon}
                {label}
            </button>
        </div>
    );
  }

  return (
    <div className={`
      bg-black rounded-lg shadow-lg overflow-hidden transition-all duration-300 flex flex-col border
      ${capsule.isSealed ? 'border-gray-600' : 'border-gray-800 hover:border-gray-700'}
    `}>
      <div className="relative">
        {isPhysical && !hasCustomLetterDesign ? (
          <div className="bg-gray-900 h-48 flex items-center justify-center">
              <EnvelopeIcon className="h-24 w-24 text-gray-700"/>
          </div>
        ) : (
          <img src={capsule.coverImageUrl} alt={isPhysical ? "Letter Design" : "Capsule Cover"} className="w-full h-48 object-cover" />
        )}

        {capsule.isSealed && (
          <div className="absolute top-4 right-4 bg-gray-200 text-black px-4 py-2 rounded-md text-sm font-semibold flex items-center shadow-lg">
            <LockClosedIcon className="h-5 w-5 mr-2" />
            {isPhysical ? 'MAILED' : 'SEALED'}
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 flex flex-col flex-grow">
        <div className="flex items-center text-base text-gray-400 mb-4">
            <UserIcon className="h-6 w-6 mr-3 text-gray-500"/>
            <span>{isPhysical ? 'To' : 'For'}: {capsule.recipientName}</span>
        </div>
        
        {capsule.recipientAddress && (
          <div className="flex items-start text-base text-gray-400 mb-4">
              <HomeIcon className="h-6 w-6 mr-3 text-gray-500 flex-shrink-0 mt-1"/>
              <span className="break-words">{capsule.recipientAddress}</span>
          </div>
        )}

        <div className={`flex items-center text-base mb-6 ${isPast ? 'text-gray-600' : 'text-gray-400'}`}>
            <CalendarIcon className="h-6 w-6 mr-3 text-gray-500"/>
            <span>{isPhysical ? 'Mails on' : 'Opens on'}: {formatDate(deliveryDate)}</span>
        </div>
        
        <p className="text-gray-300 text-base mb-8 h-24 overflow-hidden text-ellipsis flex-grow">
            {capsule.message}
        </p>
        
        {getAttachmentButton()}

        <div className="flex justify-end space-x-3 pt-5 border-t border-gray-800">
          {!capsule.isSealed && (
            <>
              <button 
                onClick={() => onSeal(capsule.id)}
                className="flex items-center bg-gray-200 hover:bg-white text-black font-semibold py-2 px-5 rounded-md transition duration-200 text-base"
                aria-label={isPhysical ? "Mail letter" : "Seal capsule"}
              >
                <LockClosedIcon className="h-5 w-5 mr-2" />
                {isPhysical ? 'Mail Letter' : 'Seal'}
              </button>
              <button 
                onClick={() => onDelete(capsule.id)}
                className="flex items-center bg-transparent hover:bg-gray-900 text-gray-400 font-semibold py-2 px-5 rounded-md transition duration-200 text-base border border-gray-700"
                aria-label="Delete capsule"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </button>
            </>
          )}
          {capsule.isSealed && (
            <p className="text-base text-gray-500 font-medium">Ready for the future.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapsuleCard;