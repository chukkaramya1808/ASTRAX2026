import { useState } from 'react';
import { COMPETITIONS } from '../data/competitions';
import { Competition } from '../types';
import { 
  Bot, 
  Film, 
  Brain, 
  Presentation, 
  MessageSquare, 
  Terminal, 
  CheckCircle2, 
  Info,
  Users,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface ArenaCompetitionsProps {
  onSelectCompetition: (compName: string) => void;
  selectedCompetition?: string;
  selectedYear?: string;
}

export function ArenaCompetitions({ onSelectCompetition, selectedCompetition }: ArenaCompetitionsProps) {
  const [activeExpandedId, setActiveExpandedId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-5 h-5 text-[#FFDF73]" />;
      case 'Film': return <Film className="w-5 h-5 text-[#FFDF73]" />;
      case 'Brain': return <Brain className="w-5 h-5 text-[#FFDF73]" />;
      case 'Presentation': return <Presentation className="w-5 h-5 text-[#FFDF73]" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-[#FFDF73]" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-[#FFDF73]" />;
      default: return <Bot className="w-5 h-5 text-[#FFDF73]" />;
    }
  };

  const toggleExpand = (id: string) => {
    setActiveExpandedId(prev => prev === id ? null : id);
  };

  return (
    <section id="arenas-section" className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      
      {/* 2. Section Header: SIX COMPETITIONS */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5a0016] border border-[#D4AF37]/35 text-xs font-semibold uppercase tracking-widest text-[#FFDF73] mb-2 font-mono">
          <span>Official Event Arenas</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FAF5EE] font-serif tracking-tight">
          SIX COMPETITIONS
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#F0DFD5] max-w-xl mx-auto">
          Explore the official roster of six battlegrounds and eligibility rules below.
        </p>
      </div>

      {/* Year Eligibility Overview Ribbon */}
      <div className="mb-6 p-3 rounded-xl bg-[#5a0016]/85 border border-[#D4AF37]/35 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs shadow-md">
        <div className="p-2.5 rounded-lg bg-[#800020]/90 border border-[#D4AF37]/25 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-300 shrink-0" />
          <span className="text-[#FAF5EE]">
            <strong className="text-[#FFDF73]">1st Year:</strong> Neura Quest, Vision-X, AI Crossfire, Prompt Wars
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#800020]/90 border border-[#D4AF37]/25 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 shrink-0" />
          <span className="text-[#FAF5EE]">
            <strong className="text-[#FFDF73]">2nd Year:</strong> Eligible for all 6 Competitions
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#800020]/90 border border-[#D4AF37]/25 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shrink-0" />
          <span className="text-[#FAF5EE]">
            <strong className="text-[#FFDF73]">3rd Year:</strong> Bot - Arena, AI Cineverse
          </span>
        </div>
      </div>

      {/* Two-Column Balanced Rows: [ COMPETITION NAME ] [ COMPETITION DETAILS ] */}
      <div className="space-y-3">
        {COMPETITIONS.map((comp: Competition) => {
          const isSelected = selectedCompetition === comp.name;
          const isExpanded = activeExpandedId === comp.id;

          return (
            <div
              key={comp.id}
              className={`rounded-xl transition-all duration-300 border ${
                isSelected 
                  ? 'bg-[#960026]/95 border-[#FFDF73] shadow-[0_0_25px_rgba(212,175,55,0.35)]' 
                  : 'bg-[#5a0016]/80 hover:bg-[#6b001a]/90 border-[#D4AF37]/30 hover:border-[#D4AF37]/65'
              } backdrop-blur-md overflow-hidden`}
            >
              {/* Primary Two-Column Row */}
              <div className="p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                
                {/* LEFT SIDE: Number + Icon + Competition Name */}
                <div className="md:w-5/12 flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-[#4a0013] text-[#FFDF73] border border-[#D4AF37]/40 tracking-wider">
                    {comp.number}
                  </span>
                  
                  <div className="p-2 rounded-lg bg-[#73001d] border border-[#D4AF37]/30 shrink-0">
                    {getIcon(comp.icon)}
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#FFDF73] font-serif tracking-wide flex items-center gap-2">
                      {comp.name}
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-300 inline" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[#FFDF73] px-1.5 py-0.5 rounded bg-[#4a0013] border border-[#D4AF37]/25">
                        {comp.eligibleYears.join(' & ')}
                      </span>
                      <span className="text-[10px] text-[#EAD7C5] font-mono hidden sm:inline-block">
                        {comp.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Divider on Desktop */}
                <div className="hidden md:block w-px h-10 bg-gradient-to-b from-transparent via-[#D4AF37]/40 to-transparent" />

                {/* RIGHT SIDE: Description & Action Buttons */}
                <div className="md:w-7/12 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-[#FAF5EE] leading-relaxed">
                    {comp.shortDesc}
                  </p>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => toggleExpand(comp.id)}
                      className="px-2.5 py-1.5 text-xs text-[#FFDF73] hover:text-white rounded border border-[#D4AF37]/35 hover:bg-white/10 flex items-center gap-1 transition-colors"
                      title="View details & rules"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Less' : 'Rules'}</span>
                    </button>

                    <button
                      onClick={() => onSelectCompetition(comp.name)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'gold-btn text-[#190309]'
                      }`}
                    >
                      <span>{isSelected ? 'Selected' : 'Select'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Expandable Rules Tray */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-2 border-t border-[#D4AF37]/25 bg-[#4a0013]/95 animate-in fade-in duration-200">
                  <div className="text-xs text-[#F5EBE1] mb-2 leading-relaxed">
                    {comp.detailedDesc}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2.5">
                    <div className="p-2 rounded bg-[#630018] border border-[#D4AF37]/25 flex items-center gap-2 text-[#FAF5EE]">
                      <Users className="w-3.5 h-3.5 text-[#FFDF73] shrink-0" />
                      <span><strong>Format:</strong> {comp.teamFormat}</span>
                    </div>
                    <div className="p-2 rounded bg-[#630018] border border-[#D4AF37]/25 flex items-center gap-2 text-[#FAF5EE]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#FFDF73] shrink-0" />
                      <span><strong>Eligibility:</strong> {comp.eligibleYears.join(' & ')}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-[#FFDF73] uppercase tracking-wider block font-mono">
                      Rules:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-[#EAD7C5]">
                      {comp.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
}
