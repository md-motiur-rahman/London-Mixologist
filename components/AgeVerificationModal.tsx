import React from 'react';
import { AppView } from '../types';

interface AgeVerificationModalProps {
  onVerify: () => void;
  onNavigate: (view: AppView) => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify, onNavigate }) => {
  const handleNo = () => {
    // Redirect away or close tab
    window.location.href = 'https://www.google.com';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-royalblue/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-swanwing rounded-xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-quicksand relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-royalblue mb-8">
          Are you of legal drinking age?
        </h2>
        
        <div className="flex gap-4 justify-center mb-8">
          <button 
            onClick={onVerify}
            className="w-32 py-3 bg-royalblue text-quicksand font-bold rounded-lg hover:bg-sapphire hover:scale-105 transition-all shadow-lg border border-transparent"
          >
            YES
          </button>
          <button 
            onClick={handleNo}
            className="w-32 py-3 bg-sapphire text-swanwing font-bold rounded-lg hover:bg-royalblue hover:scale-105 transition-all shadow-lg border border-transparent"
          >
            NO
          </button>
        </div>

        <div className="text-xs text-royalblue/70 leading-relaxed space-y-2 font-medium">
          <p>
            By entering this site you agree to our terms of use which include our{' '}
            <button onClick={() => onNavigate(AppView.COOKIE_POLICY)} className="underline cursor-pointer hover:text-quicksand bg-transparent border-none p-0 inline">cookie policy</button>,{' '}
            <button onClick={() => onNavigate(AppView.DISCLAIMER)} className="underline cursor-pointer hover:text-quicksand bg-transparent border-none p-0 inline">disclaimer</button>,{' '}
            <button onClick={() => onNavigate(AppView.PRIVACY_POLICY)} className="underline cursor-pointer hover:text-quicksand bg-transparent border-none p-0 inline">privacy policy</button>, and{' '}
            <button onClick={() => onNavigate(AppView.TERMS)} className="underline cursor-pointer hover:text-quicksand bg-transparent border-none p-0 inline">terms and conditions</button>.
          </p>
          
          <p className="opacity-80 mt-4 text-[10px]">
            This site is for personal use by persons who are lawfully permitted to consume alcoholic beverages in their country of access.
          </p>
        </div>
      </div>
    </div>
  );
};
