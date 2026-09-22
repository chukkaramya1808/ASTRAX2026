import { Cpu } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-10 pb-10 md:pt-14 md:pb-14 text-center px-4 sm:px-6 lg:px-8">
      
      {/* Background radial gold/burgundy glow */}
      <div className="absolute inset-0 pointer-events-none opacity-35 flex items-center justify-center">
        <div className="w-[550px] h-[300px] bg-gradient-to-r from-[#D4AF37]/15 via-[#a8002a]/35 to-[#D4AF37]/15 rounded-full blur-3xl -z-10" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* College Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5a0016]/90 border border-[#D4AF37]/45 shadow-sm mb-4">
          <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#FAF5EE] uppercase">
            Aditya Degree College, Gopalapatnam
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
          <span className="text-[10px] sm:text-[11px] font-mono font-semibold text-[#FFDF73]">Symposium 2026</span>
        </div>

        {/* 1. First Event Name: ASTRA X'26 */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white mb-2 font-serif select-none">
          <span className="text-gold-gradient drop-shadow-[0_4px_25px_rgba(212,175,55,0.45)]">
            ASTRA X'26
          </span>
        </h1>

        {/* Subtitle: AI & ROBOTICS EVENT */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 my-3">
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <h2 className="text-xs sm:text-lg md:text-xl font-bold tracking-[0.25em] text-[#FAF5EE] uppercase font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FFDF73]" />
            AI & ROBOTICS EVENT
          </h2>
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Event Summary Description */}
        <p className="max-w-2xl mx-auto text-xs sm:text-sm md:text-base text-[#F5EBE1] leading-relaxed font-normal">
          The flagship inter-collegiate Artificial Intelligence & Robotics gathering at Aditya Degree College. Compete in chatbot engineering, generative cinema, rapid quiz battles, technical PPT research, parliamentary debate, and live prompt wars.
        </p>

      </div>
    </section>
  );
}
