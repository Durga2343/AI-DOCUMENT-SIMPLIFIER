import React, { useState, useRef, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  const fileInputRef = useRef(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle Drag Over & Enter
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Process selected file helper
  const processFile = (selectedFile) => {
    setError('');
    setSuccess(false);

    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['pdf', 'docx', 'txt'];

    if (!validExtensions.includes(fileExt)) {
      setError('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
      setFile(null);
      return;
    }

    // 10MB limit check
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Maximum allowed size is 10MB.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  // Handle Drag Drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Selector Change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger File Input Click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle Upload Submission — uploads then auto-processes with AI
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Step 1: Upload & extract text
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const docId = response.data.document._id;
        setUploadedDoc(response.data.document);
        setFile(null);
        setUploading(false);

        // Step 2: Trigger AI analysis
        setAnalyzing(true);
        await axios.post(`${API_URL}/ai/process/${docId}`);

        // Step 3: Navigate to results
        navigate(`/results/${docId}`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to process file. Please try again.';
      setError(msg);
      setUploading(false);
      setAnalyzing(false);
    }
  };

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
            <span className="text-xs sm:text-sm text-[#A9A1AE] font-medium hidden sm:inline">Logged in as {user?.name}</span>
            <Link
              to="/dashboard"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#1C1722] border border-[#2A2433] text-[#A9A1AE] hover:text-[#F8F5FA] hover:border-[#8B5CF6]/40 transition-all"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-[#8B5CF6]">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="glass-panel rounded-3xl p-8 sm:p-12 shadow-xl bg-[#1C1722] border border-[#2A2433] relative overflow-hidden">

          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Upload Document</h1>
            <p className="text-[#A9A1AE] text-sm mt-2 leading-relaxed">
              Upload legal agreements, contracts, or technical guidelines in PDF, DOCX, or TXT format. Gemini AI will extract plain-English summaries, key clauses, and risk metrics.
            </p>

            {/* Success Banner */}
            {success && (
              <div className="mt-6 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-sm space-y-3">
                <div className="flex items-center gap-2.5 font-bold text-base">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 flex-shrink-0 text-emerald-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span>Upload &amp; Extraction Successful!</span>
                </div>
                <p className="text-[#F8F5FA]">
                  The document <strong className="text-white">"{uploadedDoc?.filename}"</strong> was uploaded and processed.
                </p>
                <div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-all text-xs"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-sm flex items-center gap-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-rose-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleChange}
                accept=".pdf,.docx,.txt"
              />

              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={onButtonClick}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] ${
                  dragActive
                    ? 'border-[#E879A8] bg-[#E879A8]/10'
                    : 'border-[#2A2433] bg-[#16121C] hover:border-[#8B5CF6]/50 hover:bg-[#1C1722]'
                }`}
              >
                <div className="p-4 rounded-2xl bg-[#2A2433] text-[#E879A8] mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                  </svg>
                </div>

                {file ? (
                  <div className="space-y-1">
                    <p className="text-white font-bold text-base">{file.name}</p>
                    <p className="text-[#E879A8] text-xs font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[#F8F5FA] font-semibold text-sm sm:text-base">
                      Drag &amp; drop document here, or <span className="text-[#E879A8] underline font-bold">browse</span>
                    </p>
                    <p className="text-[#A9A1AE] text-xs font-medium">PDF, DOCX, or TXT (up to 10MB)</p>
                  </div>
                )}
              </div>

              {/* File details action card */}
              {file && (
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-[#16121C] border border-[#2A2433] gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2.5 rounded-xl bg-[#8B5CF6]/20 text-[#F0A6C7] border border-[#8B5CF6]/30 text-xs font-extrabold uppercase tracking-wider">
                      {file.name.split('.').pop()}
                    </div>
                    <div className="truncate max-w-[240px] sm:max-w-[320px]">
                      <p className="text-[#F8F5FA] font-bold text-sm truncate">{file.name}</p>
                      <p className="text-[#F0A6C7] text-xs font-semibold">Ready for parsing &amp; AI breakdown</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-transparent hover:bg-[#2A2433] text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading || analyzing}
                      id="submit-upload-btn"
                      className="glow-button px-5 py-2 text-xs font-bold flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </>
                      ) : analyzing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span>Analyzing with Gemini AI...</span>
                        </>
                      ) : (
                        <span>Upload &amp; Analyze</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upload;
