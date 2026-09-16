import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

// --- Icons ---
const IconUpload = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
  </svg>
);
const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const IconSparkle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const IconLoader = () => (
  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
);
const IconChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

// File type badge color (Plum & Rose scheme)
const fileTypeBadge = (type) => {
  const map = {
    pdf: 'bg-[#E879A8]/15 text-[#E879A8] border-[#E879A8]/30',
    docx: 'bg-[#8B5CF6]/15 text-[#F0A6C7] border-[#8B5CF6]/30',
    txt: 'bg-[#F0A6C7]/15 text-[#F0A6C7] border-[#F0A6C7]/30',
  };
  return map[type] || 'bg-[#2A2433] text-[#A9A1AE] border-[#2A2433]';
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  // Fetch documents and their existing analyses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, analysesRes] = await Promise.all([
          axios.get(`${API_URL}/documents/my-documents`),
          axios.get(`${API_URL}/ai/my-analyses`),
        ]);

        const docs = docsRes.data.documents || [];
        setDocuments(docs);

        // Build a map: documentId -> summary
        const analysesByDoc = {};
        (analysesRes.data.summaries || []).forEach((s) => {
          const docId = s.documentId?._id || s.documentId;
          analysesByDoc[docId] = s;
        });
        setAnalyses(analysesByDoc);
      } catch (err) {
        console.error(err);
        setError('Failed to load your documents.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProcess = async (docId) => {
    setProcessingId(docId);
    setError('');
    try {
      await axios.post(`${API_URL}/ai/process/${docId}`);
      navigate(`/results/${docId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process document.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this document and its analysis? This cannot be undone.')) return;
    setDeletingId(docId);
    try {
      await axios.delete(`${API_URL}/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setAnalyses((prev) => {
        const next = { ...prev };
        delete next[docId];
        return next;
      });
    } catch (err) {
      setError('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  const totalDocs = documents.length;
  const processedDocs = Object.keys(analyses).length;
  const pendingDocs = totalDocs - processedDocs;

  return (
    <div className="min-h-screen gradient-bg text-[#F8F5FA] flex flex-col">
      {/* Top Header Navbar */}
      <header className="border-b border-[#2A2433] bg-[#100E14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#E879A8] text-white font-extrabold text-xl shadow-md shadow-[#8B5CF6]/20">
              D
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#F8F5FA] via-[#F0A6C7] to-[#E879A8] bg-clip-text text-transparent">
              DocSimplifier
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/profile"
              id="nav-profile-link"
              className="text-right hidden sm:block group hover:opacity-90 transition-opacity"
            >
              <p className="text-sm font-semibold text-[#F8F5FA] group-hover:text-white transition-colors">{user?.name}</p>
              <p className="text-xs text-[#A9A1AE] group-hover:text-[#F0A6C7] transition-colors">{user?.email}</p>
            </Link>
            <Link
              to="/profile"
              id="nav-profile-avatar"
              className="sm:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#E879A8] flex items-center justify-center text-white text-xs font-bold shadow-md hover:opacity-90 transition-opacity select-none"
            >
              {(user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
            </Link>
            <Link
              to="/history"
              id="nav-history-link"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1C1722] border border-[#2A2433] text-[#A9A1AE] hover:text-[#F8F5FA] hover:border-[#8B5CF6]/40 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#8B5CF6]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              History
            </Link>
            <Link
              to="/upload"
              className="glow-button gap-2 text-xs sm:text-sm px-3.5 py-2 sm:px-4 sm:py-2"
              id="nav-upload-btn"
            >
              <IconUpload />
              <span className="hidden sm:inline">New Upload</span>
            </Link>
            <button
              onClick={logout}
              id="logout-btn"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1C1722] border border-[#2A2433] text-[#A9A1AE] hover:text-[#F8F5FA] hover:border-[#E879A8]/40 hover:bg-[#E879A8]/10 active:scale-[0.98] transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-[#8B5CF6] via-[#F0A6C7] to-[#E879A8] bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-2 text-[#A9A1AE] text-sm sm:text-base">
            Upload and simplify legal agreements, contracts &amp; technical guidelines with Gemini AI.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {[
            { label: 'Total Documents', value: totalDocs, icon: <IconDoc />, text: 'text-[#8B5CF6]' },
            { label: 'Analyses Completed', value: processedDocs, icon: <IconSparkle />, text: 'text-[#E879A8]' },
            { label: 'Pending Analysis', value: pendingDocs, icon: <IconDoc />, text: 'text-[#F0A6C7]' },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel glass-panel-hover rounded-2xl p-6 bg-[#1C1722] border border-[#2A2433]">
              <div className={`${stat.text} mb-3 flex items-center justify-between`}>
                <div className="p-2.5 rounded-xl bg-[#100E14] border border-[#2A2433]">{stat.icon}</div>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
              <p className="text-[#A9A1AE] text-sm font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-sm flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Documents List */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-xl bg-[#1C1722] border border-[#2A2433]">
          <div className="px-6 py-5 border-b border-[#2A2433] flex items-center justify-between bg-[#16121C]">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <IconDoc />
              Your Documents
            </h2>
            <div className="flex items-center gap-4">
              <Link
                to="/history"
                id="view-history-btn"
                className="flex items-center gap-1.5 text-xs sm:text-sm text-[#E879A8] hover:text-[#F0A6C7] transition-colors font-semibold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                View History
              </Link>
              <Link
                to="/upload"
                id="upload-new-doc-btn"
                className="flex items-center gap-1.5 text-xs sm:text-sm text-[#8B5CF6] hover:text-[#F0A6C7] transition-colors font-semibold"
              >
                <IconUpload />
                Upload New
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#A9A1AE]">
              <div className="w-8 h-8 border-3 border-[#2A2433] border-t-[#8B5CF6] rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading your documents...</span>
            </div>
          ) : documents.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#2A2433] border border-[#362E42] flex items-center justify-center text-[#8B5CF6] mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <p className="text-white font-bold text-xl">No documents uploaded yet</p>
              <p className="text-[#A9A1AE] text-sm mt-2 max-w-md">
                Upload your first PDF, DOCX, or TXT file to extract plain-English summaries, risk analyses, and FAQs.
              </p>
              <Link to="/upload" className="glow-button mt-6 gap-2 text-sm" id="empty-state-upload-btn">
                <IconUpload />
                Upload Your First Document
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#2A2433]">
              {documents.map((doc) => {
                const hasAnalysis = !!analyses[doc._id];
                const isProcessing = processingId === doc._id;
                const isDeleting = deletingId === doc._id;

                return (
                  <div
                    key={doc._id}
                    className="group px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-[#241E2C]/50 transition-colors duration-150"
                  >
                    {/* File icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-[#100E14] border border-[#2A2433] flex items-center justify-center text-[#8B5CF6] group-hover:border-[#8B5CF6]/40 transition-colors">
                        <IconDoc />
                      </div>
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold text-base truncate max-w-[280px] sm:max-w-[360px]">{doc.filename}</p>
                        <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${fileTypeBadge(doc.fileType)}`}>
                          {doc.fileType}
                        </span>
                        {hasAnalysis && (
                          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                            ✓ Analyzed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#A9A1AE] mt-1">Uploaded {formatDate(doc.uploadedAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {hasAnalysis ? (
                        <Link
                          to={`/results/${doc._id}`}
                          id={`view-results-${doc._id}`}
                          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 text-[#F0A6C7] border border-[#8B5CF6]/30 transition-all shadow-sm"
                        >
                          <IconEye />
                          View Analysis
                          <IconChevronRight />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleProcess(doc._id)}
                          disabled={isProcessing || !!processingId}
                          id={`process-doc-${doc._id}`}
                          className="glow-button px-3.5 py-2 text-xs gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <>
                              <IconLoader />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <IconSparkle />
                              Analyze with AI
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc._id)}
                        disabled={isDeleting || isProcessing}
                        id={`delete-doc-${doc._id}`}
                        className="flex items-center gap-1 p-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-800/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Document"
                      >
                        {isDeleting ? <IconLoader /> : <IconTrash />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
