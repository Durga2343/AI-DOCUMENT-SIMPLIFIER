import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext, API_URL } from '../context/AuthContext';

// --- Icons ---
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const IconLock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);
const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const IconSparkle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
  </svg>
);

const IconEyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);
const IconEyeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const FormInput = ({ id, label, type = 'text', value, onChange, placeholder, autoComplete, rightElement }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-bold text-[#A9A1AE] uppercase tracking-wider mb-2">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full glow-input pr-10 text-sm"
      />
      {rightElement && (
        <div className="absolute inset-y-0 right-3 flex items-center">{rightElement}</div>
      )}
    </div>
  </div>
);

const Alert = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300',
    error: 'bg-rose-950/40 border-rose-800/40 text-rose-300',
  };
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-semibold ${styles[type]}`}>
      {type === 'success' ? <IconCheck /> : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
      )}
      {message}
    </div>
  );
};

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalDocs: 0, analyzed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [memberSince, setMemberSince] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileAlert, setProfileAlert] = useState({ type: '', message: '' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState({ type: '', message: '' });

  const [deletePassword, setDeletePassword] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState({ type: '', message: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, analysesRes, meRes] = await Promise.all([
          axios.get(`${API_URL}/documents/my-documents`),
          axios.get(`${API_URL}/ai/my-analyses`),
          axios.get(`${API_URL}/auth/me`),
        ]);
        setStats({
          totalDocs: (docsRes.data.documents || []).length,
          analyzed: (analysesRes.data.summaries || []).length,
        });
        setMemberSince(meRes.data.createdAt || null);
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileAlert({ type: '', message: '' });
    if (!name.trim() || !email.trim()) {
      setProfileAlert({ type: 'error', message: 'Name and email cannot be empty.' });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, { name: name.trim(), email: email.trim() });
      if (res.data.success) {
        updateUser({ name: res.data.name, email: res.data.email });
        setProfileAlert({ type: 'success', message: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordAlert({ type: '', message: '' });
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await axios.put(`${API_URL}/auth/profile`, { currentPassword, newPassword });
      if (res.data.success) {
        setPasswordAlert({ type: 'success', message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordAlert({ type: 'error', message: err.response?.data?.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAlert({ type: '', message: '' });
    if (!deletePassword) {
      setDeleteAlert({ type: 'error', message: 'Please enter your password to confirm.' });
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/auth/account`, { data: { password: deletePassword } });
      if (res.data.success) {
        logout();
        navigate('/login');
      }
    } catch (err) {
      setDeleteAlert({ type: 'error', message: err.response?.data?.message || 'Failed to delete account.' });
      setDeleteLoading(false);
    }
  };

  const pwStrength = Math.min(4,
    (newPassword.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(newPassword) ? 1 : 0) +
    (/[0-9]/.test(newPassword) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0)
  );
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-[#F0A6C7]', 'bg-[#8B5CF6]'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberDate = memberSince
    ? new Date(memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen gradient-bg text-[#F8F5FA] flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-[#2A2433] bg-[#100E14]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#E879A8] text-white font-extrabold text-lg shadow-md shadow-[#8B5CF6]/20">
              D
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#F8F5FA] via-[#F0A6C7] to-[#E879A8] bg-clip-text text-transparent">
              DocSimplifier
            </span>
          </Link>
          <Link
            to="/dashboard"
            id="profile-back-dashboard"
            className="flex items-center gap-2 text-xs sm:text-sm text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors font-semibold"
          >
            <IconBack /> Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Header */}
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#A9A1AE] hover:text-[#F8F5FA] transition-colors mb-3">
            <IconBack /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Profile &amp; Settings</h1>
          <p className="text-[#A9A1AE] text-sm mt-1">Manage your account information and preferences.</p>
        </div>

        {/* Avatar & Stats Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 bg-[#1C1722] border border-[#2A2433] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8B5CF6] via-[#C084FC] to-[#E879A8] flex items-center justify-center text-white text-2xl font-extrabold shadow-md select-none">
                {initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#100E14] flex items-center justify-center text-white">
                <IconCheck />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-extrabold text-white">{user?.name}</h2>
              <p className="text-[#A9A1AE] text-sm">{user?.email}</p>
              <p className="text-xs text-[#A9A1AE] font-semibold mt-1">Member since {memberDate}</p>
            </div>

            <div className="flex gap-8 flex-shrink-0">
              {[
                { label: 'Documents', value: stats.totalDocs, icon: <IconDoc />, text: 'text-[#8B5CF6]' },
                { label: 'Analyses', value: stats.analyzed, icon: <IconSparkle />, text: 'text-[#E879A8]' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`flex justify-center mb-1 ${s.text}`}>{s.icon}</div>
                  <p className="text-2xl font-extrabold text-white">
                    {statsLoading
                      ? <span className="inline-block w-6 h-5 rounded bg-[#2A2433] animate-pulse" />
                      : s.value}
                  </p>
                  <p className="text-xs text-[#A9A1AE] font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Info Form */}
        <div className="glass-panel rounded-3xl overflow-hidden bg-[#1C1722] border border-[#2A2433]">
          <div className="px-6 py-5 border-b border-[#2A2433] flex items-center gap-3 bg-[#16121C]">
            <div className="p-2.5 rounded-xl bg-[#8B5CF6]/20 text-[#F0A6C7] border border-[#8B5CF6]/30">
              <IconUser />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Personal Information</h2>
              <p className="text-xs text-[#A9A1AE] font-medium mt-0.5">Update your display name and email address.</p>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="px-6 py-6 space-y-4" id="profile-info-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="profile-name"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
              />
              <FormInput
                id="profile-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <Alert {...profileAlert} />
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                id="save-profile-btn"
                disabled={profileLoading}
                className="glow-button gap-2 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profileLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <IconCheck />}
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-panel rounded-3xl overflow-hidden bg-[#1C1722] border border-[#2A2433]">
          <div className="px-6 py-5 border-b border-[#2A2433] flex items-center gap-3 bg-[#16121C]">
            <div className="p-2.5 rounded-xl bg-[#E879A8]/20 text-[#E879A8] border border-[#E879A8]/30">
              <IconLock />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Change Password</h2>
              <p className="text-xs text-[#A9A1AE] font-medium mt-0.5">Choose a strong password (at least 6 characters).</p>
            </div>
          </div>
          <form onSubmit={handlePasswordChange} className="px-6 py-6 space-y-4" id="change-password-form">
            <FormInput
              id="current-password"
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowCurrent((v) => !v)} className="text-[#A9A1AE] hover:text-white transition-colors">
                  {showCurrent ? <IconEyeOff /> : <IconEyeOpen />}
                </button>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                id="new-password"
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                rightElement={
                  <button type="button" onClick={() => setShowNew((v) => !v)} className="text-[#A9A1AE] hover:text-white transition-colors">
                    {showNew ? <IconEyeOff /> : <IconEyeOpen />}
                  </button>
                }
              />
              <FormInput
                id="confirm-password"
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${lvl <= pwStrength ? strengthColors[pwStrength - 1] : 'bg-[#2A2433]'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#A9A1AE] font-semibold">
                  Password Strength: <span className="text-white">{strengthLabels[pwStrength]}</span>
                </p>
              </div>
            )}

            <Alert {...passwordAlert} />
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                id="change-password-btn"
                disabled={passwordLoading}
                className="glow-button flex items-center gap-2 text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {passwordLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <IconLock />}
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl overflow-hidden border border-rose-900/40 bg-rose-950/20">
          <div className="px-6 py-5 border-b border-rose-900/30 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/40 text-rose-300">
              <IconTrash />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-rose-300">Danger Zone</h2>
              <p className="text-xs text-rose-300/70 font-medium mt-0.5">These actions are permanent and cannot be undone.</p>
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            {!deleteConfirmOpen ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white">Delete Account</p>
                  <p className="text-xs text-[#A9A1AE] mt-0.5">
                    Permanently deletes your account, all documents, and all AI analyses.
                  </p>
                </div>
                <button
                  id="open-delete-account-btn"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-bold transition-all"
                >
                  <IconTrash />
                  Delete Account
                </button>
              </div>
            ) : (
              <div className="space-y-4" id="delete-confirm-section">
                <div className="bg-rose-950/40 border border-rose-800/40 rounded-2xl p-4 text-sm text-rose-200">
                  <p className="font-bold mb-1">⚠ This action is irreversible</p>
                  <p className="text-xs leading-relaxed">
                    Your account, all {stats.totalDocs} document{stats.totalDocs !== 1 ? 's' : ''}, and {stats.analyzed} anal{stats.analyzed !== 1 ? 'yses' : 'ysis'} will be permanently deleted. Enter your password below to confirm.
                  </p>
                </div>
                <FormInput
                  id="delete-account-password"
                  label="Enter Your Password to Confirm"
                  type={showDelete ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your current password"
                  autoComplete="current-password"
                  rightElement={
                    <button type="button" onClick={() => setShowDelete((v) => !v)} className="text-[#A9A1AE] hover:text-white transition-colors">
                      {showDelete ? <IconEyeOff /> : <IconEyeOpen />}
                    </button>
                  }
                />
                <Alert {...deleteAlert} />
                <div className="flex items-center gap-3">
                  <button
                    id="cancel-delete-btn"
                    onClick={() => { setDeleteConfirmOpen(false); setDeletePassword(''); setDeleteAlert({ type: '', message: '' }); }}
                    className="flex-1 py-2.5 rounded-xl bg-[#2A2433] hover:bg-[#362E42] text-[#F8F5FA] text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-delete-btn"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deletePassword}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {deleteLoading
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <IconTrash />}
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete Everything'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pb-8" />
      </main>
    </div>
  );
};

export default Profile;
