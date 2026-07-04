import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { MapPin, LogOut, KeyRound, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BatchInfo {
  batchId: string;
  batchName: string;
  phone: string;
  mealSchedule: string;
  location: string;
  deliveryPartner: string;
}

interface Member {
  memberId: string;
  name: string;
  phone: string;
  isLead: boolean;
  status: string;
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<BatchInfo | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const loadProfile = async () => {
    if (!user?.batchId) return;
    setLoading(true);
    try {
      const res = await api.get(`/batches/${user.batchId}/detail`);
      if (res.data) {
        setBatch(res.data.batch || null);
        setMembers(res.data.members || []);
      }
    } catch {
      window.alert('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // Format initials for avatar
  const getInitials = () => {
    return user?.username?.substring(0, 2).toUpperCase() || 'US';
  };

  // ── Location edit ──────────────────────────────────────────────────────────
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput]         = useState('');
  const [savingLocation, setSavingLocation]       = useState(false);

  const handleSaveLocation = async () => {
    setSavingLocation(true);
    try {
      const res = await api.put('/batches/location', { location: locationInput });
      if (res.data) {
        setBatch(res.data);
      }
      setIsEditingLocation(false);
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Failed to update delivery location');
    } finally {
      setSavingLocation(false);
    }
  };

  // ── Change Password ────────────────────────────────────────────────────────
  const [showChangePwd, setShowChangePwd]         = useState(false);
  const [currentPwd, setCurrentPwd]               = useState('');
  const [newPwd, setNewPwd]                       = useState('');
  const [confirmPwd, setConfirmPwd]               = useState('');
  const [showCurrentPwd, setShowCurrentPwd]       = useState(false);
  const [showNewPwd, setShowNewPwd]               = useState(false);
  const [showConfirmPwd, setShowConfirmPwd]       = useState(false);
  const [pwdLoading, setPwdLoading]               = useState(false);
  const [pwdError, setPwdError]                   = useState('');
  const [pwdSuccess, setPwdSuccess]               = useState(false);

  const resetPwdForm = () => {
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    setShowCurrentPwd(false); setShowNewPwd(false); setShowConfirmPwd(false);
    setPwdError(''); setPwdSuccess(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (!currentPwd || !newPwd || !confirmPwd) {
      setPwdError('All fields are required.'); return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError('New password and confirmation do not match.'); return;
    }
    if (newPwd.length < 6) {
      setPwdError('New password must be at least 6 characters.'); return;
    }
    setPwdLoading(true);
    try {
      await api.post('/auth/user/change-password', {
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmPassword: confirmPwd,
      });
      setPwdSuccess(true);
      // After 2s, log out so they re-login with the new password
      setTimeout(async () => {
        await logout();
        navigate('/user/login');
      }, 2000);
    } catch (err: any) {
      setPwdError(err.response?.data?.message || 'Failed to change password. Try again.');
    } finally {
      setPwdLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 pb-14 space-y-5 overflow-y-auto h-full flex flex-col bg-[#f8fafc]">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Batch Profile</h1>
        <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
          Manage and view details regarding your delivery dropoff target and roommates
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading profile…</span>
        </div>
      ) : (
        <div className="flex-1 space-y-4">

          {/* ── User Info Header ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {user?.username || 'User'}
              </h2>
              <p className="text-[11px] text-brand font-bold tracking-wider uppercase mt-0.5">
                {user?.batchId ? `Batch ${user.batchId}` : user?.username}
              </p>
              {batch?.phone ? (
                <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-wider">
                  📞 {batch.phone}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 font-medium italic mt-1">
                  No contact number registered
                </p>
              )}
            </div>
          </div>

          {/* ── Delivery Target Dropoff Card ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-2">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              DELIVERY TARGET DROPOFF
            </div>

            {isEditingLocation ? (
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter dropoff location details..."
                  className="w-full text-[16px] p-2.5 border border-brand/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-slate-800 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingLocation(false)}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveLocation}
                    disabled={savingLocation}
                    className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider text-white bg-brand hover:bg-brand-dark cursor-pointer disabled:opacity-50"
                  >
                    {savingLocation ? 'SAVING...' : 'SAVE LOCATION'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 leading-snug">
                      {batch?.batchName || `Batch ${user?.batchId}`}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed mt-0.5">
                      {batch?.location ? batch.location : 'No dropoff address set. Tap CHANGE to set location.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLocationInput(batch?.location || '');
                    setIsEditingLocation(true);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-3xs"
                >
                  CHANGE
                </button>
              </div>
            )}
          </div>

          {/* ── Change Password Card ── */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs overflow-hidden">
            {/* Header row — always visible */}
            <button
              onClick={() => { setShowChangePwd(!showChangePwd); resetPwdForm(); }}
              className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Change Password</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">Update your account password</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition ${showChangePwd ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>
                {showChangePwd ? 'CANCEL' : 'CHANGE'}
              </span>
            </button>

            {/* Expanded form */}
            {showChangePwd && (
              <form onSubmit={handleChangePassword} className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">

                {/* Success state */}
                {pwdSuccess ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                    <p className="text-sm font-black text-emerald-700">Password Changed!</p>
                    <p className="text-[11px] text-slate-500 text-center">Logging you out now…</p>
                  </div>
                ) : (
                  <>
                    {/* Error */}
                    {pwdError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <p className="text-[11px] text-red-700 font-semibold">{pwdError}</p>
                      </div>
                    )}

                    {/* Current Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? 'text' : 'password'}
                          value={currentPwd}
                          onChange={(e) => setCurrentPwd(e.target.value)}
                          placeholder="Enter current password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="w-full h-11 rounded-xl px-3 pr-10 text-[16px] text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand transition"
                        />
                        <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand cursor-pointer">
                          {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPwd}
                          onChange={(e) => setNewPwd(e.target.value)}
                          placeholder="Min. 6 characters"
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="w-full h-11 rounded-xl px-3 pr-10 text-[16px] text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand transition"
                        />
                        <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand cursor-pointer">
                          {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPwd ? 'text' : 'password'}
                          value={confirmPwd}
                          onChange={(e) => setConfirmPwd(e.target.value)}
                          placeholder="Re-enter new password"
                          autoCapitalize="none"
                          autoCorrect="off"
                          className="w-full h-11 rounded-xl px-3 pr-10 text-[16px] text-slate-800 bg-slate-50 border border-slate-200 focus:outline-none focus:border-brand transition"
                        />
                        <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand cursor-pointer">
                          {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Live match indicator */}
                      {confirmPwd.length > 0 && (
                        <p className={`text-[9px] font-bold mt-0.5 ${newPwd === confirmPwd ? 'text-emerald-600' : 'text-red-500'}`}>
                          {newPwd === confirmPwd ? '✔ Passwords match' : '✖ Passwords do not match'}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={pwdLoading}
                      className="w-full py-2.5 rounded-xl bg-brand text-white text-xs font-black uppercase tracking-widest hover:bg-brand-dark transition disabled:opacity-50 cursor-pointer"
                    >
                      {pwdLoading ? 'Updating…' : 'Update Password'}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          {/* ── Registered Members Card ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              ◈ REGISTERED MEMBERS ({members.length})
            </div>

            <div className="space-y-2.5">
              {members.map((m) => (
                <div key={m.memberId} className="flex items-center bg-slate-50/50 border border-slate-100 rounded-xl p-3 gap-3 hover:bg-slate-50 transition">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    {m.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-800 truncate">{m.name}</span>
                      {m.isLead && (
                        <span className="bg-brand/10 text-brand text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                          LEAD
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="bg-orange-50 text-brand border border-orange-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Sign Out Card ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Account Session
              </h4>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                Sign out of your active member session
              </p>
            </div>

            <button
              onClick={async () => {
                await logout();
                navigate('/user/login');
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-3xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SIGN OUT</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
