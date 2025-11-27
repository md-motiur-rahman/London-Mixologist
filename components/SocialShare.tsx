import React, { useState } from 'react';
import { Share2, Check, Mail } from 'lucide-react';

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

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // User cancelled or error
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
    <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-sapphire/20 hover:bg-quicksand hover:text-royalblue border border-sapphire/30 text-xs font-bold text-shellstone transition-all active:scale-95 shadow-sm hover:shadow-quicksand/20 ${className}`}
          title="Share"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          <span className="hidden sm:inline">{copied ? 'Copied Link' : 'Share'}</span>
          <span className="sm:hidden">{copied ? 'Copied' : 'Share'}</span>
        </button>

        <button
          onClick={handleEmailShare}
          className={`p-2 rounded-full bg-sapphire/20 hover:bg-quicksand hover:text-royalblue border border-sapphire/30 text-shellstone transition-all active:scale-95 shadow-sm hover:shadow-quicksand/20 ${className}`}
          title="Share via Email"
        >
          <Mail size={16} />
        </button>
    </div>
  );
};