import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { MapPin, LogOut } from 'lucide-react';
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
    if (user?.username === 'B006') return "RU";
    return user?.username?.substring(0, 2).toUpperCase() || "US";
  };

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
          
          {/* User Info Header matching screenshots */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
              {getInitials()}
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                {user?.username === 'B006' ? 'Ruuban Raja' : `Member ${user?.username}`}
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                ruubanraja@gmail.com
              </p>
              <p className="text-[10px] text-brand font-black tracking-wider uppercase mt-1">
                +1 (555) 342-9988
              </p>
            </div>
          </div>

          {/* Delivery Target Dropoff Card matching screenshots */}
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
                  className="w-full text-xs p-2.5 border border-brand/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-slate-800 bg-white"
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
                      {batch?.location ? batch.location : 'No dropoff address set in DB yet. Tap CHANGE to set location.'}
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

          {/* Registered Members Card matching screenshots */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              👥 REGISTERED MEMBERS ({members.length})
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
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {m.memberId}
                    </span>
                  </div>

                  <span className="bg-orange-50 text-brand border border-orange-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sign Out Card matching screenshots */}
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
