interface AdityaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function AdityaLogo({ className = '', size = 52, showText = true }: AdityaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* High-fidelity SVG of Aditya Degree College Gopalapatnam Logo */}
      <div 
        className="relative shrink-0 rounded-full shadow-md bg-white overflow-hidden p-0.5"
        style={{ width: size, height: size }}
        title="Aditya Degree College, Gopalapatnam"
      >
        <svg 
          viewBox="0 0 320 320" 
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Red Ring */}
          <circle cx="160" cy="160" r="154" fill="#FFFFFF" stroke="#E63920" strokeWidth="12" />
          
          {/* Inner decorative border */}
          <circle cx="160" cy="160" r="147" fill="none" stroke="#FDE8D7" strokeWidth="2" />

          {/* Top Arc Telugu Text Path */}
          <path id="teluguArc" d="M 40,160 A 120,120 0 0,1 280,160" fill="none" stroke="none" />
          <text fill="#003882" fontSize="13.5" fontWeight="bold" letterSpacing="0.8">
            <textPath href="#teluguArc" startOffset="50%" textAnchor="middle">
              ఆనన్దమయో జ్ఞానమయో విజ్ఞానమయ ఆదిత్య
            </textPath>
          </text>

          {/* Sunburst Rays */}
          <g opacity="0.85">
            {/* Center origin at (160, 115) */}
            <path d="M160 115 L120 70 L130 65 Z" fill="#F8A870" />
            <path d="M160 115 L145 60 L155 58 Z" fill="#F8A870" />
            <path d="M160 115 L165 58 L175 60 Z" fill="#F8A870" />
            <path d="M160 115 L190 65 L200 70 Z" fill="#F8A870" />
            <path d="M160 115 L210 78 L220 86 Z" fill="#F8A870" />
            <path d="M160 115 L100 86 L110 78 Z" fill="#F8A870" />
            <path d="M160 115 L88 100 L95 92 Z" fill="#F8A870" />
            <path d="M160 115 L225 92 L232 100 Z" fill="#F8A870" />
          </g>

          {/* Sacred Emblem atop lotus */}
          <g transform="translate(160, 96)">
            {/* Lotus petals */}
            <path d="M -24 16 C -18 4, -8 4, 0 16 C 8 4, 18 4, 24 16 C 14 20, -14 20, -24 16 Z" fill="#E84A5F" stroke="#003882" strokeWidth="1.2" />
            <path d="M -12 14 C -6 2, 6 2, 12 14 Z" fill="#F9A8D4" />
            
            {/* Om / Cross symbol in blue and red */}
            <circle cx="0" cy="-6" r="14" fill="#E53935" opacity="0.95" />
            <path d="M -4 -16 L 4 -16 M 0 -20 L 0 4 M -8 -6 L 8 -6" stroke="#003882" strokeWidth="3" strokeLinecap="round" />
            <circle cx="0" cy="-6" r="3" fill="#FFFFFF" />
          </g>

          {/* Green Geometric ADITYA Monogram / Logo */}
          <g transform="translate(48, 116)">
            {/* ADITYA line art in green */}
            <path 
              d="M 12 40 L 26 8 L 40 40 M 18 28 L 34 28 M 46 40 L 46 8 C 66 8 66 40 46 40 M 74 8 L 94 8 M 84 8 L 84 40 M 102 8 L 122 8 M 112 8 L 112 40 M 130 8 L 140 26 L 150 8 M 140 26 L 140 40 M 158 40 L 172 8 L 186 40 M 164 28 L 180 28" 
              fill="none" 
              stroke="#008836" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Green base underline */}
            <path d="M 8 43 L 194 43" stroke="#008836" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Blue Ribbon Banner: "ENLIGHTENS THE NESCIENCE" */}
          <g transform="translate(30, 168)">
            {/* Swallowtail Ribbon background */}
            <path 
              d="M 10 0 L 250 0 L 240 8 L 250 16 L 10 16 L 20 8 Z" 
              fill="#083088" 
            />
            {/* Ribbon Text */}
            <text 
              x="130" 
              y="12" 
              textAnchor="middle" 
              fill="#FFFFFF" 
              fontSize="9.5" 
              fontWeight="bold" 
              fontFamily="Arial, sans-serif" 
              letterSpacing="1.2"
            >
              ENLIGHTENS THE NESCIENCE
            </text>
          </g>

          {/* RED BOLD: ADITYA */}
          <text 
            x="160" 
            y="226" 
            textAnchor="middle" 
            fill="#E52028" 
            fontSize="38" 
            fontWeight="900" 
            fontFamily="'Arial Black', Impact, sans-serif" 
            letterSpacing="1"
          >
            ADITYA
          </text>

          {/* BLUE BOLD: DEGREE COLLEGE */}
          <text 
            x="160" 
            y="249" 
            textAnchor="middle" 
            fill="#002D80" 
            fontSize="18" 
            fontWeight="800" 
            fontFamily="Arial, sans-serif" 
            letterSpacing="0.8"
          >
            DEGREE COLLEGE
          </text>

          {/* RED BOLD: GOPALAPATNAM */}
          <text 
            x="160" 
            y="270" 
            textAnchor="middle" 
            fill="#E52028" 
            fontSize="18" 
            fontWeight="800" 
            fontFamily="Arial, sans-serif" 
            letterSpacing="0.8"
          >
            GOPALAPATNAM
          </text>
        </svg>
      </div>

      {/* College Name & Branch */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#E5C05B] uppercase font-mono">
            Gopalapatnam Campus
          </span>
          <span className="text-base sm:text-lg md:text-xl font-black text-[#FDFBF7] tracking-tight font-serif">
            ADITYA DEGREE COLLEGE
          </span>
          <span className="text-[11px] font-bold text-[#E5C05B] tracking-wide uppercase">
            Gopalapatnam
          </span>
        </div>
      )}
    </div>
  );
}
