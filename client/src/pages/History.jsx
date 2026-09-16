import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const IconFilter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);
const IconSort = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);
const IconSparkle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
  </svg>
);
const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
);
const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
};

const fileTypeBadge = (type) => ({
  pdf: 'bg-[#E879A8]/15 text-[#E879A8] border-[#E879A8]/30',
  docx: 'bg-[#8B5CF6]/15 text-[#F0A6C7] border-[#8B5CF6]/30',
  txt: 'bg-[#F0A6C7]/15 text-[#F0A6C7] border-[#F0A6C7]/30',
}[type] || 'bg-[#2A2433] text-[#A9A1AE] border-[#2A2433]');

const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-rose-400';
const scoreRingColor = (s) => s >= 80 ? '#10B981' : s >= 60 ? '#F59E0B' : '#E879A8';

const highRiskCount = (clauses = []) => clauses.filter((c) => c.severity === 'High').length;

// ── Mini Score Ring ────────────────────────────────────────────────────────────
const MiniRing = ({ score, size = 44 }) => {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#2A2433" strokeWidth="3.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={scoreRingColor(score)} strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className={`text-[10px] font-extrabold z-10 ${scoreColor(score)}`}>{score}</span>
    </div>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="glass-panel rounded-2xl p-5 animate-pulse space-y-3 bg-[#1C1722] border border-[#2A2433]">
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#2A2433] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#2A2433] rounded w-2/3" />
        <div className="h-3 bg-[#2A2433] rounded w-1/3" />
      </div>
      <div className="w-10 h-10 rounded-full bg-[#2A2433] flex-shrink-0" />
    </div>
    <div className="h-3 bg-[#2A2433] rounded w-full" />
    <div className="h-3 bg-[#2A2433] rounded w-4/5" />
  </div>
);

// ── Analysis Card ──────────────────────────────────────────────────────────────
const AnalysisCard = ({ analysis, docInfo }) => {
  const docId = docInfo?._id || (typeof analysis.documentId === 'string' ? analysis.documentId : analysis.documentId?._id);
  const filename = docInfo?.filename || analysis.documentId?.filename || 'Unknown Document';
  const fileType = docInfo?.fileType || analysis.documentId?.fileType || '';
  const highRisks = highRiskCount(analysis.riskClauses);
  const uploadedAt = docInfo?.uploadedAt || analysis.documentId?.uploadedAt;

  return (
    <Link
      to={`/results/${docId}`}
      id={`history-card-${docId}`}
      className="glass-panel glass-panel-hover rounded-2xl p-6 block bg-[#1C1722] border border-[#2A2433] hover:border-[#8B5CF6]/40 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* File type icon */}
        <div className="w-12 h-12 rounded-xl bg-[#100E14] border border-[#2A2433] flex items-center justify-center text-[#8B5CF6] flex-shrink-0 group-hover:border-[#8B5CF6]/40 transition-colors">
          <IconDoc />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-base font-bold text-white truncate max-w-[200px] sm:max-w-[300px] group-hover:text-[#E879A8] transition-colors">
              {filename}
            </h3>
            <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${fileTypeBadge(fileType)}`}>
              {fileType || '—'}
            </span>
          </div>
          <p className="text-xs text-[#A9A1AE] font-medium">
            Analyzed {formatTimeAgo(analysis.createdAt)}
            {uploadedAt ? ` · Uploaded ${formatDate(uploadedAt)}` : ''}
          </p>
        </div>

        {/* Mini score ring */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <MiniRing score={analysis.confidenceScore} size={44} />
          <span className="text-[9px] text-[#A9A1AE] font-bold uppercase tracking-wider">Score</span>
        </div>
      </div>

      {/* Summary preview */}
      {analysis.summary && (
        <p className="mt-3 text-xs text-[#F8F5FA] leading-relaxed line-clamp-2">
          {analysis.summary}
        </p>
      )}

      {/* Tags row */}
      <div className="mt-4 flex items-center flex-wrap gap-2 pt-3 border-t border-[#2A2433]">
        {analysis.keyPoints?.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 text-[#F0A6C7] border border-[#8B5CF6]/30">
            <IconSparkle />
            {analysis.keyPoints.length} key point{analysis.keyPoints.length !== 1 ? 's' : ''}
          </span>
        )}
        {highRisks > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/40">
            <IconWarning />
            {highRisks} high risk
          </span>
        )}
        {analysis.riskClauses?.length > 0 && highRisks === 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40">
            <IconWarning />
            {analysis.riskClauses.length} risk clause{analysis.riskClauses.length !== 1 ? 's' : ''}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#A9A1AE] group-hover:text-[#E879A8] transition-colors">
          <IconEye /> View Analysis
        </span>
      </div>
    </Link>
  );
};

// ── Chip filter button ─────────────────────────────────────────────────────────
const Chip = ({ active, onClick, children, id }) => (
  <button
    id={id}
    onClick={onClick}
    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all duration-150 cursor-pointer ${
      active
        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] border-white/10 text-white shadow-md'
        : 'bg-[#1C1722] border-[#2A2433] text-[#A9A1AE] hover:border-[#8B5CF6]/30 hover:text-[#F8F5FA]'
    }`}
  >
    {children}
    {active && <span className="ml-0.5"><IconX /></span>}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const History = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [docMap, setDocMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & sort state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesRes, docsRes] = await Promise.all([
          axios.get(`${API_URL}/ai/my-analyses`),
          axios.get(`${API_URL}/documents/my-documents`),
        ]);

        const rawAnalyses = analysesRes.data.summaries || [];
        setAnalyses(rawAnalyses);

        const map = {};
        (docsRes.data.documents || []).forEach((doc) => {
          map[doc._id] = doc;
        });
        rawAnalyses.forEach((a) => {
          if (a.documentId && typeof a.documentId === 'object') {
            map[a.documentId._id] = a.documentId;
          }
        });
        setDocMap(map);
      } catch (err) {
        console.error(err);
        setError('Failed to load analysis history.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Computed filtered + sorted list
  const filteredAnalyses = useMemo(() => {
    let list = [...analyses];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const docId = typeof a.documentId === 'object' ? a.documentId._id : a.documentId;
        const doc = docMap[docId];
        const filename = doc?.filename || a.documentId?.filename || '';
        return filename.toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q);
      });
    }

    if (filterType) {
      list = list.filter((a) => {
        const docId = typeof a.documentId === 'object' ? a.documentId._id : a.documentId;
        const doc = docMap[docId];
        return (doc?.fileType || a.documentId?.fileType || '') === filterType;
      });
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':  return new Date(a.createdAt) - new Date(b.createdAt);
        case 'score-desc': return b.confidenceScore - a.confidenceScore;
        case 'score-asc':  return a.confidenceScore - b.confidenceScore;
        default:           return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [analyses, search, filterType, sortBy, docMap]);

  // Stat aggregates
  const avgScore = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.confidenceScore, 0) / analyses.length)
    : 0;
  const totalRisks = analyses.reduce((s, a) => s + (a.riskClauses?.length || 0), 0);
  const totalKeyPoints = analyses.reduce((s, a) => s + (a.keyPoints?.length || 0), 0);

  return (
    <div className="min-h-screen gradient-bg text-[#F8F5FA] flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[#2A2433] bg-[#100E14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#E879A8] text-white font-extrabold text-lg shadow-md shadow-[#8B5CF6]/20">
              D
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#F8F5FA] via-[#F0A6C7] to-[#E879A8] bg-clip-text text-transparent">
              DocSimplifier
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              id="history-nav-upload"
              className="glow-button gap-2 text-xs px-3.5 py-2"
            >
              <IconUpload /> <span className="hidden sm:inline">New Upload</span>
            </Link>
            <Link
              to="/dashboard"
              id="history-nav-dashboard"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors font-semibold"
            >
              <IconBack /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors mb-3">
              <IconBack /> Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Analysis History</h1>
            <p className="text-[#A9A1AE] text-sm mt-1">Browse, search and revisit all your AI-powered document analyses.</p>
          </div>
          {!loading && analyses.length > 0 && (
            <p className="text-xs text-[#A9A1AE] font-bold flex-shrink-0">
              {filteredAnalyses.length} of {analyses.length} result{analyses.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Aggregate stats */}
        {!loading && analyses.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { label: 'Total Analyses', value: analyses.length, text: 'text-[#8B5CF6]' },
              { label: 'Avg. Confidence', value: `${avgScore}%`, text: 'text-[#E879A8]' },
              { label: 'Key Points Extracted', value: totalKeyPoints, text: 'text-[#F0A6C7]' },
              { label: 'Risk Clauses Flagged', value: totalRisks, text: 'text-rose-400' },
            ].map((s) => (
              <div key={s.label} className="glass-panel rounded-2xl p-4 bg-[#1C1722] border border-[#2A2433]">
                <p className={`text-2xl font-extrabold ${s.text}`}>{s.value}</p>
                <p className="text-xs text-[#A9A1AE] font-semibold mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Filter + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center text-[#A9A1AE] pointer-events-none">
              <IconSearch />
            </div>
            <input
              id="history-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by filename or summary content…"
              className="w-full glow-input pl-10 pr-10 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-3.5 flex items-center text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors"
              >
                <IconX />
              </button>
            )}
          </div>

          {/* Sort select */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center text-[#A9A1AE] pointer-events-none">
              <IconSort />
            </div>
            <select
              id="history-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="glow-input pl-10 pr-8 text-sm appearance-none cursor-pointer min-w-[170px]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* File type filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#A9A1AE] font-bold flex items-center gap-1.5">
            <IconFilter /> Filter:
          </span>
          <Chip id="filter-all" active={filterType === ''} onClick={() => setFilterType('')}>All types</Chip>
          <Chip id="filter-pdf" active={filterType === 'pdf'} onClick={() => setFilterType(filterType === 'pdf' ? '' : 'pdf')}>PDF</Chip>
          <Chip id="filter-docx" active={filterType === 'docx'} onClick={() => setFilterType(filterType === 'docx' ? '' : 'docx')}>DOCX</Chip>
          <Chip id="filter-txt" active={filterType === 'txt'} onClick={() => setFilterType(filterType === 'txt' ? '' : 'txt')}>TXT</Chip>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : analyses.length === 0 ? (
          /* Empty state */
          <div className="glass-panel rounded-3xl flex flex-col items-center justify-center py-20 px-6 text-center bg-[#1C1722] border border-[#2A2433]">
            <div className="w-16 h-16 rounded-2xl bg-[#2A2433] border border-[#362E42] flex items-center justify-center text-[#8B5CF6] mb-5">
              <IconSparkle />
            </div>
            <p className="text-white font-bold text-xl">No analysis history yet</p>
            <p className="text-[#A9A1AE] text-sm mt-2 max-w-sm">
              Upload your first document to extract summaries, key takeaways, and risk metrics.
            </p>
            <Link to="/upload" className="glow-button mt-6 gap-2 text-sm" id="history-empty-upload">
              <IconUpload /> Upload a Document
            </Link>
          </div>
        ) : filteredAnalyses.length === 0 ? (
          /* Empty state for search */
          <div className="glass-panel rounded-3xl flex flex-col items-center justify-center py-16 px-6 text-center bg-[#1C1722] border border-[#2A2433]">
            <div className="w-14 h-14 rounded-2xl bg-[#100E14] border border-[#2A2433] flex items-center justify-center text-[#A9A1AE] mb-4">
              <IconSearch />
            </div>
            <p className="text-white font-bold text-lg">No matching results found</p>
            <p className="text-[#A9A1AE] text-sm mt-1.5 max-w-xs">
              Try adjusting your search keywords or clearing active file filters.
            </p>
            <button
              onClick={() => { setSearch(''); setFilterType(''); }}
              className="mt-5 px-4 py-2 rounded-xl bg-[#2A2433] hover:bg-[#362E42] text-[#F8F5FA] text-xs font-bold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAnalyses.map((analysis) => {
              const docId = typeof analysis.documentId === 'object'
                ? analysis.documentId._id
                : analysis.documentId;
              const docInfo = docMap[docId];
              return (
                <AnalysisCard
                  key={analysis._id}
                  analysis={analysis}
                  docInfo={docInfo}
                />
              );
            })}
          </div>
        )}

        <div className="pb-8" />
      </main>
    </div>
  );
};

export default History;
