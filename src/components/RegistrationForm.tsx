import React, { useState, useEffect, useMemo } from 'react';
import { COMPETITIONS, isEligibleForCompetition } from '../data/competitions';
import { 
  CheckCircle, 
  AlertCircle, 
  Send, 
  ShieldAlert, 
  Download, 
  Sparkles,
  Building2,
  Lock,
  Award
} from 'lucide-react';

interface RegistrationFormProps {
  preselectedCompetition?: string;
  onRegistrationSuccess?: () => void;
}

export function RegistrationForm({ preselectedCompetition, onRegistrationSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    student_name: '',
    college: 'Aditya Degree College, Gopalapatnam',
    course: '',
    year: '1st Year',
    suc_code: '',
    competition: 'NEURA QUEST'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sucError, setSucError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Compute allowed competitions for the current year
  const eligibleCompetitions = useMemo(() => {
    const yr = formData.year.trim().toLowerCase();
    if (yr.includes('3rd') || yr.includes('3') || yr.includes('third')) {
      return COMPETITIONS.filter(c => c.name === 'BOT - ARENA' || c.name === 'AI CINEVERSE');
    }
    if (yr.includes('1st') || yr.includes('1') || yr.includes('first')) {
      return COMPETITIONS.filter(c => ['NEURA QUEST', 'VISION-X', 'AI CROSSFIRE', 'PROMPT WARS'].includes(c.name));
    }
    // 2nd year: all 6
    return COMPETITIONS;
  }, [formData.year]);

  // Adjust selected competition if it becomes invalid when switching year
  useEffect(() => {
    const isCurEligible = eligibleCompetitions.some(c => c.name === formData.competition);
    if (!isCurEligible && eligibleCompetitions.length > 0) {
      setFormData(prev => ({ ...prev, competition: eligibleCompetitions[0].name }));
    }
  }, [formData.year, eligibleCompetitions]);

  // Handle external selection from competitions arena
  useEffect(() => {
    if (preselectedCompetition) {
      // Check if eligible for current year
      if (isEligibleForCompetition(formData.year, preselectedCompetition)) {
        setFormData(prev => ({ ...prev, competition: preselectedCompetition }));
      } else {
        // Auto-switch year to match the selected competition's eligibility
        if (preselectedCompetition === 'BOT - ARENA' || preselectedCompetition === 'AI CINEVERSE') {
          if (formData.year.includes('1st')) {
            setFormData(prev => ({ ...prev, year: '3rd Year', competition: preselectedCompetition }));
          } else {
            setFormData(prev => ({ ...prev, competition: preselectedCompetition }));
          }
        } else {
          if (formData.year.includes('3rd')) {
            setFormData(prev => ({ ...prev, year: '1st Year', competition: preselectedCompetition }));
          } else {
            setFormData(prev => ({ ...prev, competition: preselectedCompetition }));
          }
        }
      }
    }
  }, [preselectedCompetition]);

  // Handle SUC Code change with strict numeric validation (10 digits)
  const handleSucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericVal = rawVal.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, suc_code: numericVal }));

    if (numericVal.length === 0) {
      setSucError('SUC Code is required.');
    } else if (numericVal.length < 10) {
      setSucError(`SUC Code must contain exactly 10 digits (${numericVal.length}/10 entered).`);
    } else {
      setSucError(null);
    }
  };

  const handleInputChange = (field: string, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client Validations
    if (!formData.student_name.trim()) {
      setErrorMessage('Please enter your full student name.');
      return;
    }
    if (!formData.college.trim()) {
      setErrorMessage('Please enter your college name.');
      return;
    }
    if (!formData.course.trim()) {
      setErrorMessage('Please enter your course (e.g. B.Sc Computer Science, BCA).');
      return;
    }
    if (!formData.year.trim()) {
      setErrorMessage('Please select or enter your year (1st Year, 2nd Year, or 3rd Year).');
      return;
    }
    if (!/^\d{10}$/.test(formData.suc_code)) {
      setSucError('SUC Code must contain exactly 10 digits.');
      setErrorMessage('SUC Code must contain exactly 10 digits (numbers only).');
      return;
    }

    // Eligibility Check
    if (!isEligibleForCompetition(formData.year, formData.competition)) {
      if (formData.year.includes('3rd')) {
        setErrorMessage('Eligibility Rule: 3rd Year students can ONLY participate in BOT - ARENA or AI CINEVERSE.');
      } else if (formData.year.includes('1st')) {
        setErrorMessage('Eligibility Rule: 1st Year students can ONLY participate in NEURA QUEST, VISION-X, AI CROSSFIRE, or PROMPT WARS.');
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage(data.error || 'This student has already registered for a competition.');
        } else {
          setErrorMessage(data.error || 'Registration failed. Please check your information.');
        }
        setLoading(false);
        return;
      }

      setSuccessData(data.registration || {
        ...formData,
        registered_at: new Date().toISOString()
      });
      setLoading(false);

      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMessage('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      student_name: '',
      college: 'Aditya Degree College, Gopalapatnam',
      course: '',
      year: '1st Year',
      suc_code: '',
      competition: 'NEURA QUEST'
    });
    setSuccessData(null);
    setErrorMessage(null);
    setSucError(null);
  };

  return (
    <section id="registration-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Section Header - The single place where student registration is shown! */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#5a0016] border border-[#D4AF37]/40 text-xs font-semibold uppercase tracking-widest text-[#FFDF73] mb-2 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Registration Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#FAF5EE] font-serif tracking-tight">
          STUDENT REGISTRATION
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-[#F0DFD5] max-w-lg mx-auto">
          Aditya Degree College, Gopalapatnam • One student can register for <strong>only one</strong> competition.
        </p>
      </div>

      {/* SUCCESS CONFIRMATION PASS */}
      {successData ? (
        <div className="rounded-2xl bg-gradient-to-b from-[#6b001a] to-[#4d0013] border-2 border-[#D4AF37] p-6 sm:p-10 shadow-2xl text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-950/90 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/50">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-[#FFDF73] font-serif tracking-wide mb-1">
            Registration Successful!
          </h3>
          <p className="text-xs sm:text-sm text-[#EAD7C5] mb-6">
            You are officially registered for <strong className="text-[#FFDF73] font-mono">{successData.competition}</strong> at ASTRA X'26.
          </p>

          {/* Student Pass Badge Card */}
          <div className="max-w-md mx-auto rounded-xl bg-[#FAF5EE] text-[#1E040D] p-5 shadow-lg border border-[#DFC99E] text-left mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#800020] text-[#FFDF73] text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-bl-lg">
              Official Entry Pass
            </div>

            <div className="text-[11px] font-mono font-bold text-[#800020] uppercase tracking-wider mb-2">
              ADITYA DEGREE COLLEGE, GOPALAPATNAM • ASTRA X'26
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[#DFC99E]/60 pb-1.5">
                <span className="text-[#684E42] text-xs">Student Name:</span>
                <span className="font-bold text-[#1E040D]">{successData.student_name}</span>
              </div>
              <div className="flex justify-between border-b border-[#DFC99E]/60 pb-1.5">
                <span className="text-[#684E42] text-xs">College:</span>
                <span className="font-medium text-[#1E040D] text-right">{successData.college || 'Aditya Degree College, Gopalapatnam'}</span>
              </div>
              <div className="flex justify-between border-b border-[#DFC99E]/60 pb-1.5">
                <span className="text-[#684E42] text-xs">SUC Code:</span>
                <span className="font-mono font-bold text-[#800020]">{successData.suc_code}</span>
              </div>
              <div className="flex justify-between border-b border-[#DFC99E]/60 pb-1.5">
                <span className="text-[#684E42] text-xs">Course & Year:</span>
                <span className="font-medium text-[#1E040D]">{successData.course} ({successData.year})</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#684E42] text-xs">Competition:</span>
                <span className="font-black text-xs px-2.5 py-1 rounded bg-[#800020] text-[#FFDF73] font-mono">
                  {successData.competition}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#DFC99E] flex items-center justify-between text-[11px] text-[#684E42]">
              <span className="flex items-center gap-1 font-mono font-bold text-[#800020]">
                Verified Student Entry
              </span>
              <span className="italic">Report at event desk</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#FAF5EE] text-[#1E040D] font-bold text-xs hover:bg-white flex items-center justify-center gap-1.5 border border-[#DFC99E] shadow"
            >
              <Download className="w-4 h-4 text-[#800020]" />
              Print / Save Pass
            </button>

            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg gold-btn text-xs font-bold shadow"
            >
              Register Another Student
            </button>
          </div>
        </div>
      ) : (
        /* REGISTRATION FORM CARD (SHOWN ONLY ONCE) */
        <div className="rounded-2xl glass-wine-card p-5 sm:p-9 shadow-2xl relative">
          
          {/* Single Entry Rule Banner */}
          <div className="mb-6 p-3.5 rounded-xl bg-[#5a0016] border border-[#D4AF37]/40 flex items-start gap-3 shadow-sm">
            <ShieldAlert className="w-5 h-5 text-[#FFDF73] shrink-0 mt-0.5" />
            <div className="text-xs text-[#FAF5EE] leading-relaxed">
              <strong className="text-[#FFDF73] block mb-0.5 font-mono uppercase tracking-wide">
                Single Entry Rule Enforced
              </strong>
              One student can register for <strong>ONLY ONE competition</strong>. Duplicate submissions with the same SUC Code will be automatically blocked.
            </div>
          </div>

          {/* Year-Specific Eligibility Notification */}
          <div className="mb-6 p-3 rounded-xl bg-[#500014] border border-[#D4AF37]/30 text-xs text-[#FAF5EE] flex items-center gap-2.5">
            <Award className="w-4 h-4 text-[#FFDF73] shrink-0" />
            <span>
              {formData.year.includes('3rd') && (
                <><strong>3rd Year Rule:</strong> You are eligible to register for <strong>BOT - ARENA</strong> or <strong>AI CINEVERSE</strong>.</>
              )}
              {formData.year.includes('1st') && (
                <><strong>1st Year Rule:</strong> You are eligible to register for <strong>NEURA QUEST</strong>, <strong>VISION-X</strong>, <strong>AI CROSSFIRE</strong>, or <strong>PROMPT WARS</strong>.</>
              )}
              {formData.year.includes('2nd') && (
                <><strong>2nd Year Rule:</strong> You are eligible to participate in <strong>all 6 competitions</strong>.</>
              )}
            </span>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/90 border border-red-500/70 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in shake duration-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block text-red-100">Registration Error</strong>
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Field 1: Student Name */}
            <div>
              <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider mb-1.5 font-mono">
                Student Name <span className="text-[#E5C05B]">*</span>
              </label>
              <input
                type="text"
                value={formData.student_name}
                onChange={(e) => handleInputChange('student_name', e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
              />
            </div>

            {/* Field 2: College ("and add college" as requested!) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#E5C05B]" />
                  College <span className="text-[#E5C05B]">*</span>
                </label>
                <span className="text-[10px] text-[#C4A496]">Enter or edit college</span>
              </div>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                placeholder="Enter your college name"
                className="w-full px-4 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
              />
            </div>

            {/* Field 3: Course (Manual text input, NO dropdown) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider font-mono">
                  Course <span className="text-[#E5C05B]">*</span>
                </label>
                <span className="text-[10px] text-[#C4A496]">Manual text input</span>
              </div>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => handleInputChange('course', e.target.value)}
                placeholder="Enter your course"
                className="w-full px-4 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
              />
              {/* Helpful chips for quick fill */}
              <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-[#C4A496]">Suggestions:</span>
                {['B.Sc Computer Science', 'BCA', 'B.Sc AI', 'B.Sc Data Science', 'B.Sc Electronics', 'MCA'].map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => handleInputChange('course', c)}
                    className="px-2 py-0.5 text-[10px] rounded bg-[#520014] text-[#FFDF73] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 4: Year (Final Year REMOVED as requested!) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider font-mono">
                  Year <span className="text-[#E5C05B]">*</span>
                </label>
                <span className="text-[10px] text-[#FFDF73]">1st, 2nd, or 3rd Year only</span>
              </div>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                placeholder="Enter your year"
                className="w-full px-4 py-2.5 rounded-xl cream-input text-sm font-medium shadow-sm"
                required
              />
              {/* Quick Select Buttons for the THREE allowed years only */}
              <div className="mt-2 flex gap-2">
                {['1st Year', '2nd Year', '3rd Year'].map(yr => (
                  <button
                    type="button"
                    key={yr}
                    onClick={() => handleInputChange('year', yr)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-mono transition-all ${
                      formData.year === yr 
                        ? 'bg-[#E5C05B] text-[#1E040D] font-bold border-[#E5C05B] shadow' 
                        : 'bg-[#520014] text-[#FAF5EE] border-[#D4AF37]/30 hover:border-[#D4AF37]'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 5: SU/C Code (Exactly 10 Digits Validation) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider font-mono">
                  SU/C Code <span className="text-[#E5C05B]">*</span>
                </label>
                <span className={`text-[11px] font-mono ${
                  formData.suc_code.length === 10 ? 'text-emerald-400 font-bold' : 'text-[#FFDF73]'
                }`}>
                  {formData.suc_code.length}/10 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={formData.suc_code}
                onChange={handleSucChange}
                placeholder="Enter your SU/C code"
                className={`w-full px-4 py-2.5 rounded-xl cream-input font-mono text-sm tracking-widest font-semibold shadow-sm ${
                  sucError ? 'border-red-500 focus:border-red-500' : ''
                }`}
                required
              />
              {sucError ? (
                <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {sucError}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#EAD7C5]">
                  Aditya Degree College SUC Code must contain exactly 10 digits (numbers only).
                </p>
              )}
            </div>

            {/* Field 6: Participating Competition (Filtered by Year Eligibility!) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#FDFBF7] uppercase tracking-wider font-mono">
                  Participating Competition <span className="text-[#E5C05B]">*</span>
                </label>
                <span className="text-[10px] text-[#FFDF73]">
                  {eligibleCompetitions.length} options available for {formData.year}
                </span>
              </div>
              <input
                type="text"
                value={formData.competition}
                onChange={(e) => handleInputChange('competition', e.target.value)}
                placeholder="Enter participating competition"
                className="w-full px-4 py-2.5 rounded-xl cream-input text-sm font-bold text-[#800020] shadow-sm mb-2.5"
                required
              />

              {/* Grid of Eligible Competitions for this student's year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {COMPETITIONS.map(c => {
                  const isEligible = eligibleCompetitions.some(ec => ec.id === c.id);
                  const isCur = formData.competition === c.name;

                  return (
                    <button
                      type="button"
                      key={c.id}
                      disabled={!isEligible}
                      onClick={() => handleInputChange('competition', c.name)}
                      className={`p-2 rounded-lg text-xs font-mono text-left transition-all border ${
                        !isEligible
                          ? 'opacity-35 bg-[#400010] border-gray-800 text-gray-400 cursor-not-allowed'
                          : isCur
                            ? 'bg-[#E5C05B] text-[#1E040D] font-bold border-[#E5C05B] shadow'
                            : 'bg-[#520014] text-[#FAF5EE] border-[#D4AF37]/35 hover:border-[#D4AF37] hover:bg-[#66001a]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] opacity-75">{c.number}</span>
                        {!isEligible && (
                          <span className="text-[9px] text-red-300 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> Ineligible
                          </span>
                        )}
                      </div>
                      <span className="truncate block font-bold mt-0.5">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || formData.suc_code.length !== 10}
                className="w-full py-3.5 rounded-xl gold-btn text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#190309] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying & Registering...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Registration</span>
                  </>
                )}
              </button>
              {formData.suc_code.length > 0 && formData.suc_code.length !== 10 && (
                <p className="text-center text-xs text-[#E5C05B] mt-2">
                  Please complete all 10 digits of your SUC Code to submit.
                </p>
              )}
            </div>

          </form>

        </div>
      )}

    </section>
  );
}
