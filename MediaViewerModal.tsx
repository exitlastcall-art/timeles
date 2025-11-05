import React from 'react';
import { CapsuleFile } from '../types';
import { XMarkIcon, ArrowLeftIcon } from './Icons';

interface MediaViewerModalProps {
  file: CapsuleFile;
  onClose: () => void;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({ file, onClose }) => {
    const fileSrc = `data:${file.type};base64,${file.data}`;
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="bg-black border border-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-800">
                    <h3 className="text-lg text-gray-300 truncate">{file.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Close viewer">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>
                <div className="p-2 sm:p-4 flex-grow flex items-center justify-center bg-gray-900/50">
                    {isVideo && <video src={fileSrc} controls autoPlay className="max-w-full max-h-[78vh]" />}
                    {isAudio && <audio src={fileSrc} controls autoPlay className="w-full max-w-lg" />}
                    {isImage && <img src={fileSrc} alt={file.name} className="max-w-full max-h-[78vh] object-contain" />}
                    {!isVideo && !isAudio && !isImage && (
                        <div className="text-center text-gray-300 p-8">
                            <h3 className="text-2xl mb-2">{file.name}</h3>
                            <p className="text-gray-500 mb-8">Preview not available for this file type.</p>
                            <a href={fileSrc} download={file.name} className="inline-block bg-gray-200 hover:bg-white text-black font-semibold py-3 px-8 rounded-md transition duration-300 text-lg">
                                Download
                            </a>
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 p-4 flex justify-end items-center border-t border-gray-800 bg-black/50">
                    <button 
                        onClick={onClose}
                        className="bg-transparent hover:bg-gray-900 text-gray-400 font-semibold py-3 px-6 rounded-md transition duration-200 text-lg border border-gray-700 flex items-center"
                        aria-label="Go back to list"
                    >
                        <ArrowLeftIcon className="h-6 w-6 mr-2" />
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaViewerModal;