import { AdityaLogo } from './AdityaLogo';
import { Lock, ArrowUp, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onScrollToTop: () => void;
}

export function Footer({ onOpenAdmin, onScrollToTop }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#D4AF37]/35 bg-[#520014]/95 backdrop-blur-md text-[#EAD7C5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* Col 1: College Info */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-3">
            <AdityaLogo size={42} />
          </div>
          <p className="text-xs text-[#C4A496] leading-relaxed max-w-md">
            ASTRA X'26 is the flagship inter-collegiate Artificial Intelligence and Robotics symposium at Aditya Degree College, Gopalapatnam.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-[#EAD7C5]">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              Gopalapatnam Campus, Visakhapatnam
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              astra2026@aditya.ac.in
            </span>
          </div>
        </div>

        {/* Col 2: Six Competitions Roster */}
        <div>
          <h5 className="text-xs font-mono font-bold text-[#FFDF73] uppercase tracking-wider mb-3">
            Six Competitions
          </h5>
          <ul className="space-y-1.5 text-xs text-[#C4A496]">
            <li>01 • BOT - ARENA (3rd & 2nd Yr)</li>
            <li>02 • AI CINEVERSE (3rd & 2nd Yr)</li>
            <li>03 • NEURA QUEST (1st & 2nd Yr)</li>
            <li>04 • VISION-X (1st & 2nd Yr)</li>
            <li>05 • AI CROSSFIRE (1st & 2nd Yr)</li>
            <li>06 • PROMPT WARS (1st & 2nd Yr)</li>
          </ul>
        </div>

        {/* Col 3: Event Administration */}
        <div>
          <h5 className="text-xs font-mono font-bold text-[#FFDF73] uppercase tracking-wider mb-3">
            Administration
          </h5>
          <p className="text-xs text-[#C4A496] mb-3 leading-relaxed">
            Student details are strictly restricted to authorized administrators (Ramya / Varshu).
          </p>
          <button
            onClick={onOpenAdmin}
            className="px-3.5 py-2 rounded-lg bg-[#6b001a] hover:bg-[#800020] text-xs font-bold text-[#FFDF73] border border-[#D4AF37]/40 flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Admin Portal Login</span>
          </button>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-[#D4AF37]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9E8276]">
        <p>
          © 2026 Aditya Degree College, Gopalapatnam. ASTRA X'26 AI & Robotics Event.
        </p>

        <button
          onClick={onScrollToTop}
          className="flex items-center gap-1 text-[#E5C05B] hover:text-white transition-colors"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}
