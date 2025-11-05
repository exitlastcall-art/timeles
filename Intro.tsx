import React, { useEffect } from 'react';
import { HourglassIcon, CheckIcon } from './Icons';
import { Plan } from '../types';
import { generateWelcomeSong } from '../services/geminiService';

interface IntroProps {
  onStart: (plan: Plan) => void;
}

// --- Audio Decoding Helpers ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const Intro: React.FC<IntroProps> = ({ onStart }) => {

  useEffect(() => {
    const playWelcomeSong = async () => {
      if (!process.env.API_KEY) return;

      try {
        const base64Audio = await generateWelcomeSong();
        if (base64Audio) {
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);

            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1,
            );
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            source.start();
        }
      } catch (error) {
        console.error("Failed to play welcome song:", error);
      }
    };

    playWelcomeSong();
  }, []);


  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center justify-center p-4 text-center overflow-hidden">
      <div className="relative z-10 animate-fade-in-up w-full">
        <div className="flex items-center justify-center mb-6">
          <HourglassIcon className="h-16 w-16 text-gray-400" />
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Timeless
        </h1>
        <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-400 mb-12">
          Capture today's moments, messages, and memories. Seal them in a digital capsule and send them to the future.
        </p>

        {/* Pricing Plans */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* Free Plan */}
          <div className="bg-black/80 p-8 rounded-xl border border-gray-800 flex flex-col">
            <h3 className="text-2xl font-bold text-white">Starter</h3>
            <p className="text-4xl font-bold my-4">$0 <span className="text-base font-normal text-gray-500">/ forever</span></p>
            <p className="text-gray-400 min-h-[3rem] mb-6">Perfect for getting started and preserving your first precious memories.</p>
            <ul className="space-y-3 text-gray-300 flex-grow">
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> 100 Capsules</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> 25MB Storage</li>
            </ul>
            <button
              onClick={() => onStart('starter')}
              className="mt-8 w-full bg-transparent hover:bg-gray-900 text-gray-300 font-semibold py-3 px-6 rounded-md text-lg transition duration-300 border border-gray-700"
            >
              Start for Free
            </button>
          </div>

          {/* Legacy Plan (Highlighted) */}
          <div className="bg-black/80 p-8 rounded-xl border-2 border-gray-500 flex flex-col relative">
             <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                <div className="bg-gray-500 text-white text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Best Value
                </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-200">Legacy</h3>
            <p className="text-4xl font-bold my-4">$9.99 <span className="text-base font-normal text-gray-500">/ month</span></p>
            <p className="text-gray-400 min-h-[3rem] mb-6">The ultimate plan for creating a lasting legacy with no limitations.</p>
            <ul className="space-y-3 text-gray-300 flex-grow">
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Premium "Legacy" Access</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Unlimited Capsules</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Unlimited Storage</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Unlimited Private Videos</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Voice Recording Messages</li>
            </ul>
            <button
              onClick={() => onStart('legacy')}
              className="mt-8 w-full bg-gray-200 hover:bg-white text-black font-semibold py-3 px-6 rounded-md text-lg transition duration-300"
            >
              Choose Plan
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="bg-black/80 p-8 rounded-xl border border-gray-800 flex flex-col">
            <h3 className="text-2xl font-bold text-white">Plus</h3>
            <p className="text-4xl font-bold my-4">$3.99 <span className="text-base font-normal text-gray-500">/ month</span></p>
            <p className="text-gray-400 min-h-[3rem] mb-6">Unlock more storage and the power of video to tell your story.</p>
            <ul className="space-y-3 text-gray-300 flex-grow">
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Unlimited Capsules</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> 1GB Storage</li>
              <li className="flex items-center"><CheckIcon className="h-6 w-6 text-gray-500 mr-3" /> Unlock Private Video</li>
            </ul>
            <button
              onClick={() => onStart('plus')}
              className="mt-8 w-full bg-gray-200 hover:bg-white text-black font-semibold py-3 px-6 rounded-md text-lg transition duration-300"
            >
              Choose Plan
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Intro;