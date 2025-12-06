import React from 'react';
import { AppView } from '../types';
import { MapPin, Calendar, Clock, ArrowRight, Camera, Gamepad2, CloudRain, Wind } from 'lucide-react';
import { SocialShare } from './SocialShare';

interface DashboardProps {
  setView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const time = new Date().getHours();
  const greeting = time < 12 ? 'Good morning' : time < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full space-y-8 animate-fade-in relative z-10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6 pb-6 border-b border-sapphire/10">
        <div className="text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-quicksand font-bold uppercase tracking-widest text-xs mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                London, UK • {dateStr}
             </div>
             <h1 className="text-4xl md:text-7xl font-serif font-bold text-swanwing leading-tight tracking-tight">
                {greeting}, <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-quicksand via-[#f0dcb0] to-shellstone">Mixologist.</span>
             </h1>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-4">
            <SocialShare title="London Mixologist" text="Mixing drinks the London way." />
            
            <div className="flex items-center gap-4 md:gap-6 bg-sapphire/10 backdrop-blur-md px-4 md:px-6 py-3 rounded-2xl border border-white/5 shadow-lg">
                <div className="text-right">
                    <div className="text-2xl md:text-3xl font-serif text-swanwing leading-none">12°C</div>
                    <div className="text-shellstone text-[10px] md:text-xs font-bold mt-1">Light Rain</div>
                </div>
                <div className="h-8 md:h-10 w-px bg-sapphire/30"></div>
                <CloudRain size={28} className="text-shellstone md:w-8 md:h-8" />
            </div>
        </div>
      </header>

      {/* Hero Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[500px]">
          
          {/* Primary Action: Generator (Large) */}
          <div 
              onClick={() => setView(AppView.GENERATOR)}
              className="md:col-span-8 relative h-80 md:h-full rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 shadow-2xl transition-all hover:shadow-quicksand/10"
          >
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-royalblue via-royalblue/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-royalblue/80 to-transparent opacity-60"></div>
              
              <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl z-10">
                  <div className="flex items-center gap-3 mb-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="bg-quicksand text-royalblue text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-quicksand/20">AI POWERED</span>
                      <span className="text-quicksand text-xs font-bold uppercase tracking-widest text-shadow">My Bar</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-swanwing mb-6 leading-[0.9] group-hover:text-white transition-colors drop-shadow-lg">
                      What are we <br/>drinking tonight?
                  </h2>
                  <p className="text-shellstone text-lg md:text-xl mb-8 line-clamp-2 max-w-xl leading-relaxed text-shadow-sm group-hover:text-swanwing transition-colors">
                      Input your ingredients. Our AI bartender will craft the perfect bespoke recipe instantly.
                  </p>
                  <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full text-swanwing font-bold uppercase tracking-widest text-sm group-hover:bg-quicksand group-hover:text-royalblue group-hover:border-quicksand transition-all duration-300">
                      Start Mixing <ArrowRight size={18} />
                  </div>
              </div>
          </div>

          {/* Secondary Actions: Vertical Stack */}
          <div className="md:col-span-4 flex flex-col gap-6 h-full">
              
              {/* Vision (Top) */}
              <div 
                  onClick={() => setView(AppView.VISION)}
                  className="flex-1 relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-white/5 bg-gradient-to-br from-sapphire/20 to-royalblue/50 hover:from-sapphire/30 hover:to-royalblue/60 transition-all p-8 flex flex-col justify-between shadow-xl"
              >
                   <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-700 rotate-12">
                      <Camera size={180} />
                   </div>
                   
                   <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 mb-4 group-hover:scale-110 transition-transform shadow-lg">
                      <Camera size={24} className="text-quicksand" />
                   </div>
                   
                   <div className="z-10 mt-auto">
                      <h3 className="text-3xl font-serif font-bold text-swanwing mb-2">Tipsy Vision</h3>
                      <p className="text-sm text-shellstone font-medium leading-relaxed">Snap a photo of your bar shelf. We'll identify what you have and suggest recipes.</p>
                   </div>
              </div>

              {/* Bottom Row inside Stack */}
               <div className="h-40 md:h-48 grid grid-cols-2 gap-6">
                  <div 
                      onClick={() => setView(AppView.SHOPPING)}
                      className="bg-gradient-to-br from-emerald-900/30 to-royalblue/30 hover:to-emerald-900/40 border border-white/5 rounded-[2rem] p-6 cursor-pointer transition-all flex flex-col justify-center items-center text-center group shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
                  >
                      <MapPin size={32} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                      <span className="font-bold text-swanwing text-sm md:text-base">Find Stores</span>
                  </div>
                  <div 
                      onClick={() => setView(AppView.GAMES)}
                      className="bg-gradient-to-br from-purple-900/30 to-royalblue/30 hover:to-purple-900/40 border border-white/5 rounded-[2rem] p-6 cursor-pointer transition-all flex flex-col justify-center items-center text-center group shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
                  >
                      <Gamepad2 size={32} className="text-purple-400 mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]" />
                      <span className="font-bold text-swanwing text-sm md:text-base">Party Games</span>
                  </div>
               </div>

          </div>
      </div>

      {/* Curated Collection */}
      <div className="pt-4">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-serif font-bold text-swanwing">Curated for London</h3>
                <p className="text-shellstone text-sm mt-1">Trending serves in Soho, Shoreditch & Mayfair.</p>
              </div>
              <button onClick={() => setView(AppView.GENERATOR)} className="hidden md:flex items-center gap-2 text-sm text-quicksand hover:text-white font-bold transition-colors bg-sapphire/10 px-4 py-2 rounded-full hover:bg-sapphire/30">
                View Full Menu <ArrowRight size={14} />
              </button>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                  { title: "The Shoreditch Sour", type: "Whiskey", time: "5m", img: "whiskey", location: "East London" },
                  { title: "Soho Spritz", type: "Prosecco", time: "3m", img: "cocktail", location: "Central" },
                  { title: "Mayfair Martini", type: "Gin", time: "8m", img: "martini", location: "West End" },
                  { title: "Camden Cool", type: "Rum", time: "6m", img: "mojito", location: "North" },
              ].map((item, i) => (
                  <div key={i} className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <img 
                          src={`https://picsum.photos/seed/${item.img}${i}/400/600`} 
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-royalblue via-royalblue/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                      
                      <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          {item.location}
                      </div>

                      <div className="absolute bottom-0 left-0 p-6 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-[10px] font-bold bg-quicksand/90 text-royalblue px-2 py-1 rounded mb-2 inline-block shadow-lg">
                              {item.type}
                          </span>
                          <h4 className="text-xl font-bold text-swanwing group-hover:text-white transition-colors mb-1">{item.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-shellstone/80 group-hover:text-shellstone font-medium">
                              <span className="flex items-center gap-1"><Clock size={12} /> {item.time}</span>
                              <span>•</span>
                              <span>Moderate</span>
                          </div>
                      </div>
                  </div>
              ))}
           </div>
      </div>
    </div>
  );
};