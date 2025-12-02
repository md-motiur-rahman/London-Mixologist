import React, { useState } from 'react';
import { Share2, Check, Mail, Copy } from 'lucide-react';

interface SocialShareProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  title = "London Mixologist", 
  text = "Check out this AI-powered bartender app!", 
  url = window.location.href,
  className = ""
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }
  };

  const handleEmailShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className={`inline-flex items-center bg-sapphire/20 backdrop-blur-md rounded-full border border-sapphire/30 p-1 shadow-sm transition-all hover:shadow-quicksand/10 hover:border-quicksand/30 ${className}`}>
        {/* Main Share / Copy Button */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-quicksand hover:text-royalblue text-xs font-bold text-shellstone transition-all duration-300 group"
          title="Share or Copy Link"
        >
          {copied ? <Check size={14} className="text-emerald-400 group-hover:text-royalblue" /> : <Share2 size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
          <span className="sm:hidden">{copied ? 'Copied' : 'Share'}</span>
        </button>

        <div className="w-px h-4 bg-sapphire/30 mx-1"></div>

        {/* Email Button */}
        <button
          onClick={handleEmailShare}
          className="p-2 rounded-full hover:bg-quicksand hover:text-royalblue text-shellstone transition-all duration-300"
          title="Share via Email"
        >
          <Mail size={14} />
        </button>
    </div>
  );
};