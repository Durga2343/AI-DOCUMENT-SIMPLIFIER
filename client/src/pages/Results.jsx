import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import DocumentAssistant from '../components/DocumentAssistant';

// --- Icon components ---
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-[#E879A8]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const IconWarning = ({ severity }) => {
  const colors = { High: 'text-rose-400', Medium: 'text-amber-400', Low: 'text-[#F0A6C7]' };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={`w-5 h-5 flex-shrink-0 ${colors[severity] || 'text-amber-400'}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
};
const IconQuestion = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-[#8B5CF6] flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);
const IconSparkle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-[#8B5CF6]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);
const IconCopy = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
  </svg>
);

const severityBadge = (severity) => {
  const map = {
    High: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    Medium: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    Low: 'bg-[#8B5CF6]/20 text-[#F0A6C7] border-[#8B5CF6]/30',
  };
  return map[severity] || 'bg-[#2A2433] text-[#A9A1AE] border-[#2A2433]';
};

const ScoreRing = ({ score }) => {
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#E879A8';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="36" fill="none" stroke="#2A2433" strokeWidth="8" />
        <circle
          cx="48" cy="48" r="36" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <span className="text-2xl font-extrabold text-white">{score}</span>
        <span className="text-xs text-[#A9A1AE] block -mt-0.5 font-semibold">/ 100</span>
      </div>
    </div>
  );
};

// Collapsible section
const Section = ({ id, icon, title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-xl bg-[#1C1722] border border-[#2A2433]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-[#241E2C]/50 transition-colors"
        id={id}
      >
        <div className="flex items-center gap-3 text-white font-extrabold text-base">
          {icon}
          {title}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
          stroke="currentColor" className={`w-4 h-4 text-[#A9A1AE] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 border-t border-[#2A2433] pt-4">{children}</div>}
    </div>
  );
};

const Results = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_URL}/ai/result/${documentId}`);
        if (res.data.success) {
          setSummary(res.data.summary);
          setDocInfo(res.data.summary.documentId);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            const processRes = await axios.post(`${API_URL}/ai/process/${documentId}`);
            if (processRes.data.success) {
              setSummary(processRes.data.summary);
              setDocInfo(processRes.data.summary.documentId);
            }
          } catch (processErr) {
            setError(processErr.response?.data?.message || 'Could not generate analysis.');
          }
        } else {
          setError(err.response?.data?.message || 'Failed to load analysis.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [documentId]);

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center text-[#A9A1AE] gap-4">
        <div className="w-12 h-12 border-4 border-[#2A2433] border-t-[#8B5CF6] rounded-full animate-spin" />
        <p className="text-lg font-extrabold text-white">Analyzing document with Gemini AI...</p>
        <p className="text-sm text-[#A9A1AE]">Extracting summary, plain-English text, FAQs and risk metrics.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center bg-[#1C1722] border border-[#2A2433]">
          <div className="text-rose-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
          <p className="text-[#A9A1AE] text-sm mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="glow-button text-sm gap-2">
            <IconBack /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  const filename = docInfo?.filename || 'Document';
  const fileType = docInfo?.fileType || '';
  const processSecs = summary.processingTimeMs ? (summary.processingTimeMs / 1000).toFixed(1) : null;

  return (
    <div className="min-h-screen gradient-bg text-[#F8F5FA] flex flex-col">
      {/* Top Navbar */}
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
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAssistant(!showAssistant)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                showAssistant 
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#E879A8] text-white shadow-md' 
                  : 'bg-[#1C1722] border border-[#2A2433] text-[#E879A8] hover:bg-[#241E2C]'
              }`}
            >
              <IconSparkle />
              <span className="hidden sm:inline">{showAssistant ? 'Hide Assistant' : 'Smart Assistant'}</span>
            </button>
            <Link
              to="/dashboard"
              id="results-back-btn"
              className="flex items-center gap-1.5 text-xs sm:text-sm text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors font-semibold"
            >
              <IconBack /> <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6 relative">
        {/* Main Content */}
        <main className={`flex-1 space-y-6 transition-all duration-300 ${showAssistant ? 'lg:w-2/3 max-w-full' : 'max-w-5xl mx-auto w-full'}`}>
          {/* Document Header Card */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-[#1C1722] border border-[#2A2433]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#F0A6C7] border border-[#8B5CF6]/30">
                    {fileType}
                  </span>
                  {processSecs && (
                    <span className="text-xs text-[#A9A1AE] font-medium">Processed in {processSecs}s</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">{filename}</h1>
                <p className="text-[#A9A1AE] text-xs sm:text-sm mt-1 font-medium">AI Breakdown by Gemini — {new Date(summary.createdAt).toLocaleString()}</p>
              </div>

              {/* Confidence Score Ring */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0 p-3 rounded-2xl bg-[#100E14] border border-[#2A2433]">
                <ScoreRing score={summary.confidenceScore} />
                <p className="text-[11px] text-[#A9A1AE] font-bold uppercase tracking-wider">Confidence Score</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <Section id="section-summary" icon={<IconSparkle />} title="Executive Summary">
            <div className="relative">
              <p className="text-[#F8F5FA] leading-relaxed text-base">{summary.summary}</p>
              <button
                onClick={() => copyToClipboard(summary.summary, 'summary')}
                id="copy-summary-btn"
                className="mt-4 flex items-center gap-1.5 text-xs text-[#A9A1AE] hover:text-[#E879A8] transition-colors font-semibold"
              >
                <IconCopy />
                {copiedSection === 'summary' ? 'Copied to clipboard!' : 'Copy summary'}
              </button>
            </div>
          </Section>

          {/* Key Points */}
          {summary.keyPoints?.length > 0 && (
            <Section id="section-keypoints" icon={<IconCheckCircle />} title="Key Takeaways">
              <ul className="space-y-3">
                {summary.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#F8F5FA]">
                    <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 flex items-center justify-center text-[#F0A6C7] text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Risk Clauses */}
          {summary.riskClauses?.length > 0 && (
            <Section id="section-risks" icon={<IconWarning severity="High" />} title={`Risk Clauses & Red Flags (${summary.riskClauses.length})`}>
              <div className="space-y-4">
                {summary.riskClauses.map((risk, i) => (
                  <div
                    key={i}
                    className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                      risk.severity === 'High'
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                        : risk.severity === 'Medium'
                        ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                        : 'bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#F0A6C7]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <IconWarning severity={risk.severity} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${severityBadge(risk.severity)}`}>
                            {risk.severity} Severity Risk
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white mb-1.5 italic">"{risk.clause}"</p>
                        <p className="text-xs sm:text-sm text-[#A9A1AE] leading-relaxed">{risk.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* FAQs */}
          {summary.faqs?.length > 0 && (
            <Section id="section-faqs" icon={<IconQuestion />} title="Frequently Asked Questions">
              <div className="space-y-4">
                {summary.faqs.map((faq, i) => (
                  <div key={i} className="border border-[#2A2433] rounded-2xl p-4 sm:p-5 bg-[#100E14]">
                    <p className="text-sm font-bold text-[#E879A8] mb-2 flex items-center gap-2">
                      <IconQuestion />
                      {faq.question}
                    </p>
                    <p className="text-sm text-[#F8F5FA] leading-relaxed pl-7">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Simplified Full Text */}
          {summary.simplifiedText && (
            <Section id="section-simplified" icon={<IconSparkle />} title="Plain-English Rewrite" defaultOpen={false}>
              <div className="relative">
                <div className="bg-[#100E14] rounded-2xl p-5 border border-[#2A2433] text-sm text-[#F8F5FA] leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto custom-scroll">
                  {summary.simplifiedText}
                </div>
                <button
                  onClick={() => copyToClipboard(summary.simplifiedText, 'simplified')}
                  id="copy-simplified-btn"
                  className="mt-3 flex items-center gap-1.5 text-xs text-[#A9A1AE] hover:text-[#E879A8] transition-colors font-semibold"
                >
                  <IconCopy />
                  {copiedSection === 'simplified' ? 'Copied to clipboard!' : 'Copy plain-English text'}
                </button>
              </div>
            </Section>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 pb-12">
            <Link to="/dashboard" className="text-sm font-semibold text-[#A9A1AE] hover:text-white transition-colors flex items-center gap-2">
              <IconBack /> Back to documents
            </Link>
            <Link to="/upload" className="glow-button text-sm gap-2" id="analyze-another-btn">
              Analyze Another Document
            </Link>
          </div>
        </main>

        {/* Sidebar Assistant Drawer */}
        {showAssistant && (
          <aside className="w-full lg:w-1/3 h-[620px] lg:h-[calc(100vh-7rem)] lg:sticky top-24 z-40 mb-10 lg:mb-0">
            <DocumentAssistant documentId={documentId} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default Results;
