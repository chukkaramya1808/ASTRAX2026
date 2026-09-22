import { useState, useEffect, useMemo } from 'react';
import { Registration, AdminUser } from '../types';
import { COMPETITIONS } from '../data/competitions';
import { AdityaLogo } from './AdityaLogo';
import { 
  LogOut, 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Users, 
  ArrowLeft,
  AlertTriangle,
  Award,
  Layers,
  Printer,
  Building2,
  Calendar
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onBackToSite: () => void;
}

export function AdminDashboard({ adminUser, onLogout, onBackToSite }: AdminDashboardProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<Registration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch registrations from API
  const fetchRegistrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/registrations', {
        headers: {
          Authorization: `Bearer ${adminUser.token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          onLogout();
          return;
        }
        throw new Error('Failed to fetch registrations.');
      }

      const data = await res.json();
      setRegistrations(data.registrations || []);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading dashboard data.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [adminUser.token]);

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminUser.token}`
        }
      });

      if (!res.ok) {
        throw new Error('Could not delete record.');
      }

      setRegistrations(prev => prev.filter(r => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      setIsDeleting(false);
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
      setIsDeleting(false);
    }
  };

  // Derive unique courses
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    registrations.forEach(r => {
      if (r.course) set.add(r.course.trim());
    });
    return Array.from(set).sort();
  }, [registrations]);

  // Competition counts
  const competitionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    COMPETITIONS.forEach(c => { counts[c.name] = 0; });
    registrations.forEach(r => {
      if (counts[r.competition] !== undefined) {
        counts[r.competition]++;
      } else {
        counts[r.competition] = (counts[r.competition] || 0) + 1;
      }
    });
    return counts;
  }, [registrations]);

  // Year counts
  const yearCounts = useMemo(() => {
    const counts = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0 };
    registrations.forEach(r => {
      const yr = (r.year || '').toLowerCase();
      if (yr.includes('1') || yr.includes('first')) counts['1st Year']++;
      else if (yr.includes('2') || yr.includes('second')) counts['2nd Year']++;
      else if (yr.includes('3') || yr.includes('third')) counts['3rd Year']++;
    });
    return counts;
  }, [registrations]);

  // Filtered List with intelligent natural language year search!
  // "and admin lo when we type first year then it should give first years students who atre registeret and same like 2nd and third"
  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return registrations.filter(r => {
      const rYearLower = (r.year || '').toLowerCase();
      const rNameLower = (r.student_name || '').toLowerCase();
      const rSuc = r.suc_code || '';
      const rCourse = (r.course || '').toLowerCase();
      const rCollege = (r.college || '').toLowerCase();

      // Intelligent Year query matching
      let matchesSearch = true;
      if (query) {
        const isQueryingFirst = ['first year', '1st year', '1st', 'first'].some(q => query === q || query.startsWith(q));
        const isQueryingSecond = ['second year', '2nd year', '2nd', 'second'].some(q => query === q || query.startsWith(q));
        const isQueryingThird = ['third year', '3rd year', '3rd', 'third'].some(q => query === q || query.startsWith(q));

        if (isQueryingFirst) {
          matchesSearch = rYearLower.includes('1') || rYearLower.includes('first');
        } else if (isQueryingSecond) {
          matchesSearch = rYearLower.includes('2') || rYearLower.includes('second');
        } else if (isQueryingThird) {
          matchesSearch = rYearLower.includes('3') || rYearLower.includes('third');
        } else {
          matchesSearch = 
            rNameLower.includes(query) ||
            rSuc.includes(query) ||
            rCourse.includes(query) ||
            rCollege.includes(query) ||
            rYearLower.includes(query);
        }
      }

      // Filter by Competition Tab
      const matchesComp = 
        selectedCompFilter === 'ALL' || r.competition === selectedCompFilter;

      // Filter by Year Filter
      let matchesYear = true;
      if (selectedYearFilter !== 'ALL') {
        if (selectedYearFilter === '1st Year') {
          matchesYear = rYearLower.includes('1') || rYearLower.includes('first');
        } else if (selectedYearFilter === '2nd Year') {
          matchesYear = rYearLower.includes('2') || rYearLower.includes('second');
        } else if (selectedYearFilter === '3rd Year') {
          matchesYear = rYearLower.includes('3') || rYearLower.includes('third');
        }
      }

      // Filter by Course
      const matchesCourse = 
        selectedCourseFilter === 'ALL' || r.course === selectedCourseFilter;

      return matchesSearch && matchesComp && matchesYear && matchesCourse;
    });
  }, [registrations, searchTerm, selectedCompFilter, selectedYearFilter, selectedCourseFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export.');
      return;
    }

    const headers = ['ID', 'Student Name', 'College', 'Course', 'Year', 'SUC Code', 'Participating Competition', 'Registered At'];
    const rows = filteredRegistrations.map(r => [
      r.id,
      `"${r.student_name.replace(/"/g, '""')}"`,
      `"${(r.college || 'Aditya Degree College, Gopalapatnam').replace(/"/g, '""')}"`,
      `"${r.course.replace(/"/g, '""')}"`,
      `"${r.year.replace(/"/g, '""')}"`,
      `"${r.suc_code}"`,
      `"${r.competition.replace(/"/g, '""')}"`,
      `"${new Date(r.registered_at).toLocaleString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `astra_x26_registrations_${selectedCompFilter.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#800020] text-[#FAF5EE] flex flex-col font-sans">
      
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 bg-[#5a0016]/95 border-b border-[#D4AF37]/35 backdrop-blur-md px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        
        <div className="flex items-center gap-3">
          <AdityaLogo size={42} showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#FFDF73] font-serif tracking-tight">
                ASTRA X'26 — Admin Dashboard
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-[#F0DFD5]">
              Aditya Degree College, Gopalapatnam • Coordinator: <strong className="text-white capitalize">{adminUser.username}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToSite}
            className="px-3 py-1.5 rounded-lg bg-[#6b001a] hover:bg-[#800020] text-xs font-semibold text-[#FAF5EE] border border-[#D4AF37]/35 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FFDF73]" />
            <span>Event Page</span>
          </button>

          <button
            onClick={fetchRegistrations}
            title="Refresh records"
            className="p-2 rounded-lg bg-[#6b001a] hover:bg-[#800020] text-xs text-[#FFDF73] border border-[#D4AF37]/35 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-xs font-bold text-red-200 border border-red-500/40 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

      </header>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">

        {/* METRICS & QUICK YEAR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          
          {/* Total Registrations */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-gradient-to-br from-[#3D0E1D] to-[#250711] border border-[#D4AF37]/50 shadow-md">
            <span className="text-[10px] font-mono text-[#E5C05B] uppercase tracking-wider block">
              Total Registrations
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {registrations.length}
              </span>
              <Users className="w-4 h-4 text-[#E5C05B]" />
            </div>
            <span className="text-[10px] text-[#C4A496] block">All Participants</span>
          </div>

          {/* 6 Competitions Quick Stats */}
          {COMPETITIONS.map(c => {
            const count = competitionCounts[c.name] || 0;
            const isFilterActive = selectedCompFilter === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompFilter(isFilterActive ? 'ALL' : c.name)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isFilterActive
                    ? 'bg-[#E5C05B] text-[#1E040D] border-[#E5C05B] shadow-lg ring-2 ring-[#E5C05B]/30'
                    : 'bg-[#240610] text-[#FAF5EE] border-[#D4AF37]/25 hover:border-[#D4AF37]/60 hover:bg-[#300917]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isFilterActive ? 'text-[#1E040D]' : 'text-[#E5C05B]'}`}>
                    {c.number}
                  </span>
                  <span className="text-xs font-mono font-black">
                    {count}
                  </span>
                </div>
                <div className="font-bold text-xs truncate mt-1">
                  {c.name}
                </div>
                <span className={`text-[9px] block ${isFilterActive ? 'text-[#4A1024]' : 'text-[#C4A496]'}`}>
                  {count} Participants
                </span>
              </button>
            );
          })}

        </div>

        {/* YEAR QUICK FILTER TABS as requested:
            "and admin lo when we type first year then it should give first years students who atre registeret and same like 2nd and third"
        */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#240610]/90 p-3 rounded-xl border border-[#D4AF37]/25">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E5C05B]" />
            <span className="text-xs font-mono font-bold text-[#E5C05B] uppercase tracking-wider">
              Filter by Year:
            </span>
            <div className="flex gap-1.5">
              {[
                { id: 'ALL', label: `All Years (${registrations.length})` },
                { id: '1st Year', label: `1st Year (${yearCounts['1st Year']})` },
                { id: '2nd Year', label: `2nd Year (${yearCounts['2nd Year']})` },
                { id: '3rd Year', label: `3rd Year (${yearCounts['3rd Year']})` }
              ].map(y => (
                <button
                  key={y.id}
                  onClick={() => setSelectedYearFilter(y.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedYearFilter === y.id
                      ? 'bg-[#E5C05B] text-[#1E040D] shadow-sm'
                      : 'bg-[#180309] text-[#FAF5EE] border border-[#D4AF37]/25 hover:border-[#D4AF37]'
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-[#C4A496]">
            Showing <strong>{filteredRegistrations.length}</strong> matching students
          </div>
        </div>

        {/* COMPETITION TABS NAVIGATION */}
        <div className="bg-[#240610]/80 p-2 rounded-xl border border-[#D4AF37]/20 flex flex-wrap items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCompFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCompFilter === 'ALL'
                ? 'bg-[#D4AF37] text-[#1E040D] shadow-sm'
                : 'text-[#FAF5EE] hover:bg-white/5'
            }`}
          >
            All Competitions ({registrations.length})
          </button>

          {COMPETITIONS.map(c => {
            const count = competitionCounts[c.name] || 0;
            const active = selectedCompFilter === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCompFilter(c.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-[#D4AF37] text-[#1E040D] font-bold shadow-sm'
                    : 'text-[#EAD7C5] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{c.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  active ? 'bg-[#1E040D] text-[#FFDF73]' : 'bg-[#3A0D1B] text-[#E5C05B]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#240610] p-4 rounded-xl border border-[#D4AF37]/25 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search Input: Handles "first year", "2nd year", "3rd year", Name, SUC, College */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-[#7A6054] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type name, SUC, or 'first year' / '2nd year' / '3rd year'..."
                className="w-full pl-9 pr-4 py-2 rounded-lg cream-input text-xs font-medium"
              />
            </div>

            {/* Filter by Course */}
            <div>
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg cream-input text-xs font-medium"
              >
                <option value="ALL">All Courses</option>
                {uniqueCourses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Year Dropdown */}
            <div>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg cream-input text-xs font-medium"
              >
                <option value="ALL">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
            </div>

            {/* Actions: Export & Print */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                title="Download CSV spreadsheet"
                className="flex-1 px-3 py-2 rounded-lg gold-btn text-xs font-bold flex items-center justify-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => window.print()}
                title="Print table"
                className="px-3 py-2 rounded-lg bg-[#3A0D1B] hover:bg-[#4D1124] text-xs font-bold text-[#FFDF73] border border-[#D4AF37]/30 flex items-center justify-center"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Active Filter Tags */}
          {(searchTerm || selectedCompFilter !== 'ALL' || selectedYearFilter !== 'ALL' || selectedCourseFilter !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D4AF37]/15 text-xs">
              <span className="text-[11px] text-[#C4A496]">Active Filters:</span>
              {selectedYearFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-[#3D0F1E] border border-[#D4AF37]/30 text-[#E5C05B] text-[10px]">
                  Year: {selectedYearFilter}
                </span>
              )}
              {selectedCompFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-[#3D0F1E] border border-[#D4AF37]/30 text-[#E5C05B] text-[10px]">
                  Competition: {selectedCompFilter}
                </span>
              )}
              {selectedCourseFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded bg-[#3D0F1E] border border-[#D4AF37]/30 text-[#E5C05B] text-[10px]">
                  Course: {selectedCourseFilter}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-0.5 rounded bg-[#3D0F1E] border border-[#D4AF37]/30 text-[#E5C05B] text-[10px]">
                  Search: "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCompFilter('ALL');
                  setSelectedYearFilter('ALL');
                  setSelectedCourseFilter('ALL');
                }}
                className="text-[10px] text-[#E5C05B] underline hover:text-white"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* REGISTRATIONS TABLE with COLLEGE COLUMN */}
        <div className="bg-[#240610] rounded-xl border border-[#D4AF37]/25 overflow-hidden shadow-xl">
          
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#FAF5EE] uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E5C05B]" />
              <span>Registered Students Roster ({filteredRegistrations.length})</span>
            </h2>
            <span className="text-xs text-[#C4A496]">
              Showing {filteredRegistrations.length} of {registrations.length} registrations
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#E5C05B]">
              <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono">Synchronizing registrations database...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-300">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchRegistrations}
                className="mt-3 px-4 py-1.5 rounded-lg gold-btn text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-[#C4A496]">
              <Users className="w-10 h-10 mx-auto mb-2 text-[#D4AF37]/40" />
              <p className="text-sm font-semibold text-[#FAF5EE]">
                {registrations.length === 0 ? 'No registrations yet (starts at 0).' : 'No registrations match your search criteria.'}
              </p>
              <p className="text-xs mt-1">
                {registrations.length === 0 ? 'New student registrations will appear here in real time.' : 'Try changing your filter or query.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1C040C] text-[#E5C05B] font-mono uppercase tracking-wider text-[11px] border-b border-[#D4AF37]/25">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">College</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Year</th>
                    <th className="py-3 px-3">SUC Code</th>
                    <th className="py-3 px-3">Participating Competition</th>
                    <th className="py-3 px-3">Registered At</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/15">
                  {filteredRegistrations.map((reg, idx) => (
                    <tr 
                      key={reg.id}
                      className="hover:bg-[#340A18]/60 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono text-[#D8C4B4]">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-[#FDFBF7]">
                        {reg.student_name}
                      </td>
                      <td className="py-3 px-3 text-[#EAD7C5] max-w-[180px] truncate" title={reg.college}>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#E5C05B] shrink-0" />
                          <span className="truncate">{reg.college || 'Aditya Degree College'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#EAD7C5]">{reg.course}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#330A17] text-[#FFDF73] text-[10px] font-mono border border-[#D4AF37]/25">
                          {reg.year}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#E5C05B]">
                        {reg.suc_code}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-[#FFDF73] font-serif">
                          <Award className="w-3.5 h-3.5 text-[#E5C05B]" />
                          {reg.competition}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#C4A496] font-mono text-[11px]">
                        {new Date(reg.registered_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setDeleteTarget(reg)}
                          title="Delete Registration"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-950/60 border border-transparent hover:border-red-500/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      {/* DELETE CONFIRMATION OVERLAY */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#260812] border-2 border-red-500/60 p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-950 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center">
              Confirm Deletion
            </h3>
            <p className="text-xs text-[#EAD7C5] text-center mt-2">
              Are you sure you want to remove the registration for:
            </p>
            <div className="mt-3 p-3 rounded-lg bg-[#180309] border border-[#D4AF37]/20 text-center font-mono text-xs">
              <strong className="text-white block text-sm">{deleteTarget.student_name}</strong>
              <span className="text-[#E5C05B]">SUC: {deleteTarget.suc_code}</span> • <span className="text-[#C4A496]">{deleteTarget.competition}</span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg bg-[#3A0D1B] hover:bg-[#4E1124] text-xs font-semibold text-white border border-[#D4AF37]/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
