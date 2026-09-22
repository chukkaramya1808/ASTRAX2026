import { AdityaLogo } from './AdityaLogo';
import { Lock } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onOpenDashboard: () => void;
}

export function Header({
  onOpenAdmin,
  isAdminLoggedIn,
  onOpenDashboard,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#800020]/95 border-b border-[#D4AF37]/35 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: College Logo & Name (Clean - Competitions button removed as requested) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <AdityaLogo size={52} />
        </div>

        {/* Right Action: Admin Login (Student registration removed from here so it shows in ONE place only) */}
        <div className="flex items-center gap-3">
          {isAdminLoggedIn ? (
            <button
              onClick={onOpenDashboard}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/40 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin Dashboard
            </button>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-[#FFDF73] bg-[#5a0016] hover:bg-[#6b001a] border border-[#D4AF37]/45 flex items-center gap-1.5 shadow-sm transition-all hover:border-[#D4AF37]"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
