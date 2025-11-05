import React, { useState, useRef, useEffect } from 'react';
import { Capsule, CapsuleFile, Plan } from '../types';
import { generateHeartfeltMessage, generateCoverImage } from '../services/geminiService';
// FIX: Imported WaveformIcon to fix "Cannot find name 'WaveformIcon'" error.
import { XMarkIcon, SparklesIcon, PaperClipIcon, UserIcon, EnvelopeIcon, CalendarIcon, CloudArrowUpIcon, MicrophoneIcon, ComputerDesktopIcon, HomeIcon, VideoCameraIcon, WaveformIcon, ArrowLeftIcon } from './Icons';

interface CreateCapsuleModalProps {
  onClose: () => void;
  onSave: (capsule: Capsule) => void;
  plan: Plan;
}

const CreateCapsuleModal: React.FC<CreateCapsuleModalProps> = ({ onClose, onSave, plan }) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'digital' | 'physical'>('digital');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<CapsuleFile | undefined>(undefined);
  const [fileName, setFileName] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [messagePrompt, setMessagePrompt] = useState('');
  const [error, setError] = useState('');
  
  const [useAiMessage, setUseAiMessage] = useState(false);
  const [coverImageOption, setCoverImageOption] = useState<'ai' | 'upload'>('ai');
  const [customCoverImage, setCustomCoverImage] = useState<string | undefined>(undefined);
  const [customCoverImageName, setCustomCoverImageName] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup interval on unmount
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (audioUrl) clearRecording();
        setFileName(selectedFile.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target?.result as string;
            setFile({
                name: selectedFile.name,
                type: selectedFile.type,
                data: base64Data.split(',')[1]
            });
        };
        reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
        setError('');
        setCustomCoverImageName(selectedFile.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Data = e.target?.result as string;
            setCustomCoverImage(base64Data);
        };
        reader.readAsDataURL(selectedFile);
    } else if (selectedFile) {
        setError("Please select a valid image file (e.g., JPG, PNG, GIF).");
        setCustomCoverImageName('');
        setCustomCoverImage(undefined);
    }
  };

  const handleGenerateMessage = async () => {
    if (!messagePrompt) {
        setError("Please enter a prompt for the message generation.");
        return;
    }
    setError('');
    setIsGeneratingMessage(true);
    try {
        const generated = await generateHeartfeltMessage(messagePrompt);
        setMessage(generated);
    } catch (e) {
        console.error(e);
        setError("Failed to generate message. Please try again.");
    } finally {
        setIsGeneratingMessage(false);
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.addEventListener("dataavailable", event => {
        audioChunksRef.current.push(event.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            setFile({
                name: `voice-recording-${Date.now()}.webm`,
                type: audioBlob.type,
                data: base64Data.split(',')[1]
            });
            setFileName(`Voice Recording (${formatTime(recordingSeconds)})`);
        }

        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access was denied. Please allow microphone access in your browser settings.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };
  
  const clearRecording = () => {
    setAudioUrl(null);
    setFile(undefined);
    setFileName('');
    setRecordingSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }


  const validateForm = () => {
    const baseFieldsValid = recipientName && deliveryDate && message;
    if (!baseFieldsValid) {
        setError("Please fill in all required fields: Recipient Name, Delivery Date, and Message.");
        return false;
    }
    if (deliveryMethod === 'digital' && !recipientEmail) {
        setError("Please provide the recipient's email for digital delivery.");
        return false;
    }
    if (deliveryMethod === 'physical' && !recipientAddress) {
        setError("Please provide the recipient's physical address for letter delivery.");
        return false;
    }
    if (new Date(deliveryDate) <= new Date()) {
        setError("Delivery date must be in the future.");
        return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    setError('');
    try {
        let coverImageUrl = `https://picsum.photos/seed/${Date.now()}/512/512?grayscale`;

        // Digital capsules always get an AI-generated cover.
        if (deliveryMethod === 'digital') {
            coverImageUrl = await generateCoverImage(message);
        } 
        // Physical letters use the selected design option.
        else {
            if (coverImageOption === 'upload' && customCoverImage) {
                coverImageUrl = customCoverImage;
            } else if (coverImageOption === 'ai') {
                coverImageUrl = await generateCoverImage(message);
            }
        }

        const newCapsule: Capsule = {
            id: new Date().toISOString() + Math.random(),
            recipientName,
            recipientEmail: deliveryMethod === 'digital' ? recipientEmail : undefined,
            recipientAddress: deliveryMethod === 'physical' ? recipientAddress : undefined,
            deliveryDate,
            message,
            file: deliveryMethod === 'digital' ? file : undefined,
            coverImageUrl,
            isSealed: false,
            deliveryMethod,
        };
        onSave(newCapsule);
    } catch (e) {
        console.error(e);
        setError("Failed to create capsule. Could not generate or process the cover/letter image.");
        setIsSaving(false);
    }
  };

  const getLetterPrice = () => {
    switch(plan) {
        case 'starter': return '$0.99';
        case 'plus': return '$0.99';
        case 'legacy': return '$0.99';
        default: return 'N/A';
    }
  };

  const hasAttachment = !!file;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="bg-black border border-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 p-6 sm:p-8 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-3xl text-white">Create a New Capsule</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-white" aria-label="Close modal">
                    <XMarkIcon className="h-8 w-8" />
                </button>
            </div>
            
            <div className="flex-grow p-6 sm:p-10 space-y-8 sm:space-y-10 overflow-y-auto">
                {error && <div className="bg-gray-900 border border-gray-700 text-gray-200 px-4 py-3 rounded-md text-base">{error}</div>}

                {/* Step 1: Delivery Method */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-800 pb-3">1. How should this be delivered?</h3>
                     <div className="flex gap-4">
                        <button 
                            onClick={() => setDeliveryMethod('digital')}
                            className={`w-1/2 py-4 px-5 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg ${deliveryMethod === 'digital' ? 'bg-gray-200 text-black ring-2 ring-offset-2 ring-offset-black ring-gray-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700'}`}
                        >
                           <ComputerDesktopIcon className="h-6 w-6"/> Digital Capsule
                        </button>
                        <button 
                            onClick={() => setDeliveryMethod('physical')}
                            className={`w-1/2 py-4 px-5 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base sm:text-lg ${deliveryMethod === 'physical' ? 'bg-gray-200 text-black ring-2 ring-offset-2 ring-offset-black ring-gray-400' : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700'}`}
                        >
                            <EnvelopeIcon className="h-6 w-6"/> Physical Letter
                        </button>
                     </div>
                </div>

                {/* Step 2: Recipient Details */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-800 pb-3">2. Who is this for?</h3>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600" />
                        <input
                            type="text"
                            placeholder="Recipient's Name"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-4 pl-14 pr-4 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg"
                        />
                    </div>
                    {deliveryMethod === 'digital' && (
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600" />
                            <input
                                type="email"
                                placeholder="Recipient's Email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-4 pl-14 pr-4 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg"
                            />
                        </div>
                    )}
                    {deliveryMethod === 'physical' && (
                        <div className="relative">
                            <HomeIcon className="absolute left-4 top-5 h-6 w-6 text-gray-600" />
                            <textarea
                                placeholder="Recipient's Full Physical Address"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-4 pl-14 pr-4 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg resize-none"
                            />
                        </div>
                    )}
                    <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600" />
                        <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-4 pl-14 pr-4 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg"
                        />
                    </div>
                </div>

                {/* Step 3: Your Message */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                      <h3 className="text-xl font-semibold text-gray-300">3. What do you want to say?</h3>
                      <div className="flex items-center">
                          <label htmlFor="ai-toggle" className="mr-3 text-gray-400 text-sm sm:text-base">Use AI Assistant</label>
                          <button
                              role="switch"
                              aria-checked={useAiMessage}
                              id="ai-toggle"
                              onClick={() => setUseAiMessage(!useAiMessage)}
                              className={`${useAiMessage ? 'bg-gray-400' : 'bg-gray-700'} relative inline-flex h-7 w-12 items-center rounded-full transition-colors`}
                          >
                              <span className={`${useAiMessage ? 'translate-x-6' : 'translate-x-1'} inline-block h-5 w-5 transform rounded-full bg-white transition-transform`} />
                          </button>
                      </div>
                    </div>

                    {useAiMessage && (
                        <div className="bg-gray-900 p-4 rounded-md border border-gray-700 space-y-3">
                            <textarea
                                placeholder="e.g., 'Wish my daughter a happy 18th birthday, tell her how proud I am...'"
                                value={messagePrompt}
                                onChange={(e) => setMessagePrompt(e.target.value)}
                                rows={2}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md p-3 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg"
                            />
                            <button
                                onClick={handleGenerateMessage}
                                disabled={isGeneratingMessage}
                                className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            >
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                {isGeneratingMessage ? 'Generating...' : 'Generate Message'}
                            </button>
                        </div>
                    )}
                    
                    <textarea
                        placeholder="Your heartfelt message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-4 text-white placeholder-gray-500 focus:ring-gray-400 focus:border-gray-400 text-base sm:text-lg"
                    />
                </div>

                {/* Step 4: Add an Attachment (Digital Only) */}
                {deliveryMethod === 'digital' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-800 pb-3">4. Add an Attachment (Optional)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Record Audio */}
                            <div className="flex flex-col items-center justify-center bg-gray-900 p-4 rounded-md border border-gray-700">
                                {isRecording ? (
                                    <>
                                        <div className="flex items-center text-lg text-red-500 mb-3">
                                            <WaveformIcon className="h-6 w-6 mr-2 animate-pulse" />
                                            <span>Recording... {formatTime(recordingSeconds)}</span>
                                        </div>
                                        <button onClick={stopRecording} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Stop</button>
                                    </>
                                ) : audioUrl ? (
                                    <>
                                        <audio src={audioUrl} controls className="w-full mb-3" />
                                        <button onClick={clearRecording} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">Clear</button>
                                    </>
                                ) : (
                                    <>
                                       <MicrophoneIcon className="h-8 w-8 text-gray-500 mb-2" />
                                        <button onClick={startRecording} disabled={hasAttachment} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed">Record Audio</button>
                                    </>
                                )}
                            </div>
                            {/* Upload Video */}
                            <div 
                                onClick={() => !hasAttachment && videoInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center bg-gray-900 p-4 rounded-md border border-gray-700 text-center ${hasAttachment ? 'opacity-50' : 'cursor-pointer hover:bg-gray-800'}`}
                            >
                                <VideoCameraIcon className="h-8 w-8 text-gray-500 mb-2" />
                                <span className="text-gray-300 font-bold">Upload Video</span>
                                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleFileChange} className="hidden" disabled={hasAttachment} />
                            </div>
                            {/* Upload File */}
                             <div 
                                onClick={() => !hasAttachment && fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center bg-gray-900 p-4 rounded-md border border-gray-700 text-center ${hasAttachment ? 'opacity-50' : 'cursor-pointer hover:bg-gray-800'}`}
                            >
                                <PaperClipIcon className="h-8 w-8 text-gray-500 mb-2" />
                                <span className="text-gray-300 font-bold">Upload File</span>
                                <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" disabled={hasAttachment}/>
                            </div>
                        </div>
                         {fileName && <p className="text-center text-gray-400 mt-4 text-sm">Attached: {fileName}</p>}
                    </div>
                )}
                
                {/* Step 4: Design your Letter (Physical Only) */}
                {deliveryMethod === 'physical' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-300 border-b border-gray-800 pb-3">4. Design your Letter</h3>
                      <div className="flex gap-4">
                            <button 
                                onClick={() => setCoverImageOption('ai')}
                                className={`w-1/2 py-4 px-5 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base ${coverImageOption === 'ai' ? 'bg-gray-700 text-white ring-2 ring-offset-2 ring-offset-black ring-gray-500' : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700'}`}
                            >
                               <SparklesIcon className="h-6 w-6"/> AI Generated Design
                            </button>
                            <button 
                                onClick={() => setCoverImageOption('upload')}
                                className={`w-1/2 py-4 px-5 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-3 text-base ${coverImageOption === 'upload' ? 'bg-gray-700 text-white ring-2 ring-offset-2 ring-offset-black ring-gray-500' : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-700'}`}
                            >
                                <CloudArrowUpIcon className="h-6 w-6"/> Upload Custom Design
                            </button>
                         </div>
                         {coverImageOption === 'upload' && (
                            <div 
                                onClick={() => coverImageInputRef.current?.click()}
                                className="mt-4 flex justify-center items-center w-full h-32 px-6 py-4 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:bg-gray-900"
                            >
                                <div className="text-center">
                                    <CloudArrowUpIcon className="mx-auto h-10 w-10 text-gray-500" />
                                    <p className="mt-2 text-sm text-gray-400">
                                        <span className="font-semibold text-gray-300">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">{customCoverImageName || 'PNG, JPG, GIF up to 10MB'}</p>
                                </div>
                                <input
                                    ref={coverImageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverImageChange}
                                    className="hidden"
                                />
                            </div>
                         )}
                    </div>
                )}
            </div>

            <div className="flex-shrink-0 p-6 sm:p-8 flex justify-end items-center border-t border-gray-800 bg-black/50">
                <button 
                    onClick={onClose}
                    className="bg-transparent hover:bg-gray-900 text-gray-400 font-semibold py-3 px-6 rounded-md transition duration-200 text-lg mr-4 border border-gray-700 flex items-center"
                >
                    <ArrowLeftIcon className="h-6 w-6 mr-2" />
                    Back
                </button>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gray-200 hover:bg-white text-black font-semibold py-3 px-8 rounded-md transition duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : (deliveryMethod === 'physical' ? `Save Letter (${getLetterPrice()})` : 'Save Capsule')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default CreateCapsuleModal;