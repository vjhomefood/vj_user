import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Coffee, Sun, Moon, MapPin, LogOut, RefreshCw, AlertCircle,
  Truck, User, Phone, Package, LayoutDashboard, ChevronDown,
  ChevronUp, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface MealDetail {
  qty: number;
  count: number;
}

interface Task {
  batchId: string;
  batchName: string;
  location: string;
  phone: string;
  meals: {
    bf: MealDetail;
    lunch: MealDetail;
    dinner: MealDetail;
  };
  status: {
    bf: 'Pending' | 'On Delivery' | 'Delivered';
    lunch: 'Pending' | 'On Delivery' | 'Delivered';
    dinner: 'Pending' | 'On Delivery' | 'Delivered';
  };
}

interface ProfileBatch {
  batchId: string;
  batchName: string;
  location: string;
  phone: string;
  mealSchedule: string;
  memberCount: number;
}

interface DriverProfile {
  username: string;
  name: string;
  phone: string;
  batchCount: number;
  batches: ProfileBatch[];
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusClasses = (status: string) => {
  switch (status) {
    case 'Delivered':   return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'On Delivery': return 'bg-blue-50 text-blue-700 border-blue-200';
    default:            return 'bg-slate-50 text-slate-400 border-slate-200';
  }
};

const mealLabel = (ms: string) => {
  const map: Record<string, string> = {
    BLD: 'Breakfast · Lunch · Dinner',
    BL:  'Breakfast · Lunch',
    BD:  'Breakfast · Dinner',
    LD:  'Lunch · Dinner',
    L:   'Lunch only',
  };
  return map[ms] || ms;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DeliveryDashboardScreen() {
  const user    = useAuthStore((state) => state.user);
  const logout  = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  type Tab = 'route' | 'profile';
  const [activeTab, setActiveTab] = useState<Tab>('route');

  // Route-sheet state
  const [date,      setDate]      = useState('');
  const [tasks,     setTasks]     = useState<Task[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  // Custom Delivery Dashboard states
  const [selectedSession, setSelectedSession] = useState<'bf' | 'lunch' | 'dinner'>('bf');
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [isArranging, setIsArranging] = useState(false);

  // Profile state
  const [profile,        setProfile]        = useState<DriverProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load route sheet ──
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/delivery/dashboard');
      setDate(res.data?.date || '');
      const fetchedTasks: Task[] = res.data?.tasks || [];

      // Sort fetchedTasks by saved localStorage order
      const savedOrder = localStorage.getItem('vj_batch_order');
      if (savedOrder) {
        try {
          const orderArray: string[] = JSON.parse(savedOrder);
          fetchedTasks.sort((a, b) => {
            const idxA = orderArray.indexOf(a.batchId);
            const idxB = orderArray.indexOf(b.batchId);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
          });
        } catch (e) {
          console.error(e);
        }
      }
      setTasks(fetchedTasks);
    } catch {
      triggerToast('⚠️ Failed to load delivery route sheet');
    } finally {
      setLoading(false);
    }
  };

  // ── Move Task in arrangement mode ──
  const moveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTasks.length) return;

    // Swap
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;

    setTasks(newTasks);

    // Save preferred sequence to localStorage
    const orderIds = newTasks.map(t => t.batchId);
    localStorage.setItem('vj_batch_order', JSON.stringify(orderIds));
    triggerToast('✅ Route order updated!');
  };

  // ── Load profile ──
  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await api.get('/orders/delivery/profile');
      setProfile(res.data || null);
    } catch {
      triggerToast('⚠️ Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  useEffect(() => {
    if (activeTab === 'profile' && !profile) loadProfile();
  }, [activeTab]);

  // ── Single status cycle ──
  const handleStatusCycle = async (batchId: string, session: 'bf' | 'lunch' | 'dinner', currentStatus: string) => {
    let next: 'Pending' | 'On Delivery' | 'Delivered' = 'On Delivery';
    if (currentStatus === 'On Delivery') next = 'Delivered';
    else if (currentStatus === 'Delivered') next = 'Pending';

    const key = `${batchId}-${session}`;
    setUpdating(key);
    try {
      await api.post('/orders/delivery/update-status', { batchId, session, status: next });
      setTasks(prev => prev.map(t =>
        t.batchId === batchId ? { ...t, status: { ...t.status, [session]: next } } : t
      ));
    } catch (err: any) {
      triggerToast(err.response?.data?.message || '⚠️ Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  // ── Bulk "On Delivery All" ──
  const handleMarkAllOnDelivery = async () => {
    if (tasks.length === 0) return;
    setMarkingAll(true);
    let count = 0;
    try {
      for (const task of tasks) {
        for (const session of ['bf', 'lunch', 'dinner'] as const) {
          if (task.status[session] === 'Pending') {
            await api.post('/orders/delivery/update-status', { batchId: task.batchId, session, status: 'On Delivery' });
            count++;
          }
        }
      }
      await loadDashboard();
      triggerToast(count > 0
        ? `✅ ${count} session(s) marked as On Delivery!`
        : '✅ All sessions already in progress or delivered');
    } catch (err: any) {
      triggerToast(err.response?.data?.message || '⚠️ Failed to update some sessions');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/deliverypartner/login');
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 relative overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="absolute top-14 left-3 right-3 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-slate-700 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-brand shrink-0" />
          <p className="flex-1 font-semibold">{toast}</p>
        </div>
      )}

      {/* ── Header ── */}
      <header className="bg-brand text-white h-[56px] px-4 shrink-0 shadow-md flex items-center justify-between relative z-50">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider py-1.5 px-3 bg-white/10 border border-white/20 rounded-full select-none">
            Driver Portal
          </span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none pointer-events-none">
          <img src="/vj-logo-transparent.png" alt="VJ Logo" className="h-11 object-contain" />
        </div>
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition border border-white/20"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 text-white" />
        </button>
      </header>

      {/* ── Tab Bar ── */}
      <div className="flex bg-white border-b border-slate-200 shrink-0">
        {([
          { id: 'route',   Icon: LayoutDashboard, label: 'Route Sheet' },
          { id: 'profile', Icon: User,             label: 'My Profile' },
        ] as { id: Tab; Icon: React.ElementType; label: string }[]).map(({ id, Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-black uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === id
                ? 'border-brand text-brand'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto pb-8">

        {/* ══ ROUTE SHEET TAB ══ */}
        {activeTab === 'route' && (
          <div className="p-4 space-y-4 animate-fade-in">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight">Route Sheet</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Today: {date || '…'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsArranging(!isArranging)}
                  disabled={loading || tasks.length === 0}
                  className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition cursor-pointer ${
                    isArranging
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Arrange Batches Sequence"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>{isArranging ? 'Done' : 'Arrange'}</span>
                </button>
                <button
                  onClick={handleMarkAllOnDelivery}
                  disabled={markingAll || loading || tasks.length === 0}
                  className="flex items-center gap-1 py-1.5 px-2.5 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white text-[9px] font-black uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
                  title="Mark all pending sessions as On Delivery"
                >
                  {markingAll
                    ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Truck className="w-3 h-3" />}
                  <span>On Delivery All</span>
                </button>
                <button
                  onClick={loadDashboard}
                  className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-3xs text-slate-600 hover:text-brand transition cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Session selector sub-tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 gap-1.5 select-none">
              {(['bf', 'lunch', 'dinner'] as const).map((s) => {
                const Icon = s === 'bf' ? Coffee : s === 'lunch' ? Sun : Moon;
                const label = s === 'bf' ? 'Breakfast' : s === 'lunch' ? 'Lunch' : 'Dinner';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSession(s)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                      selectedSession === s
                        ? 'bg-white text-brand shadow-xs border border-slate-200/50 font-black'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading route sheet…</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="bg-white border border-slate-200/60 rounded-2xl p-10 text-center shadow-xs">
                <div className="text-4xl mb-3">🚚</div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No assigned batches</h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Contact admin to get batches assigned
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <div key={task.batchId} className="bg-white border border-slate-200/60 rounded-2xl p-4 space-y-3 shadow-xs">
                    
                    {/* Card Header (Batch details) */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 
                            onClick={() => setExpandedBatchId(expandedBatchId === task.batchId ? null : task.batchId)}
                            className="text-sm font-black text-slate-900 flex items-center gap-1 cursor-pointer select-none hover:text-brand transition"
                          >
                            <span className="truncate">{task.batchName}</span>
                            <span className="text-[10px] text-slate-400 font-bold shrink-0">({task.batchId})</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${expandedBatchId === task.batchId ? 'rotate-180' : ''}`} />
                          </h3>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                            Click name to view address/contact
                          </span>
                        </div>
                      </div>

                      {/* Up/Down arranging controls */}
                      {isArranging && (
                        <div className="flex gap-1 shrink-0 select-none">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveTask(index, 'up')}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-20 hover:text-brand cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === tasks.length - 1}
                            onClick={() => moveTask(index, 'down')}
                            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 disabled:opacity-20 hover:text-brand cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expandable Location & Contact Info */}
                    {expandedBatchId === task.batchId && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 space-y-3 animate-fade-in text-xs">
                        {/* Location Section */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">📍 Delivery Location</span>
                          <p className="font-bold text-slate-700 leading-snug">{task.location || 'No location provided'}</p>
                          {task.location && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-black text-brand uppercase tracking-wider hover:underline pt-0.5"
                            >
                              🧭 Move to Map
                            </a>
                          )}
                        </div>
                        {/* Phone Section */}
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">📞 Contact Number</span>
                          <p className="font-bold text-slate-700">{task.phone || 'No phone number'}</p>
                          {task.phone && (
                            <a
                              href={`tel:${task.phone}`}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-brand uppercase tracking-wider hover:underline pt-0.5"
                            >
                              📞 Contact to Call
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Meal details for selected session */}
                    {(() => {
                      const session = selectedSession;
                      const Icon = session === 'bf' ? Coffee : session === 'lunch' ? Sun : Moon;
                      const label = session === 'bf' ? 'Breakfast' : session === 'lunch' ? 'Lunch' : 'Dinner';
                      const detail = task.meals[session] || { qty: 0, count: 0 };
                      const st = task.status[session];
                      const key = `${task.batchId}-${session}`;

                      return (
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                              <Icon className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-400 uppercase block">{label} Session</span>
                              <span className="text-xs font-black text-slate-800">{detail.qty} meals ({detail.count} members)</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStatusCycle(task.batchId, session, st)}
                            disabled={updating !== null}
                            className={`px-4 py-2 border rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition select-none min-w-[100px] text-center ${statusClasses(st)}`}
                          >
                            {updating === key ? 'Updating…' : st}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-4 animate-fade-in">
            {profileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading profile…</span>
              </div>
            ) : (
              <>
                {/* Driver card */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                      <Truck className="w-7 h-7 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-black text-slate-900 truncate">
                        {profile?.name || profile?.username || user?.username || '—'}
                      </h2>
                      <p className="text-[10px] text-brand font-black uppercase tracking-wider mt-0.5">
                        @{profile?.username || user?.username}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-full shrink-0">
                      Active
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Phone</span>
                      </div>
                      <p className="text-xs font-black text-slate-800">
                        {profile?.phone || '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Batches</span>
                      </div>
                      <p className="text-xs font-black text-slate-800">
                        {profile?.batchCount ?? '—'} assigned
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assigned batches */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Assigned Batches
                  </h3>
                  {!profile?.batches?.length ? (
                    <div className="bg-white border border-slate-200/60 rounded-2xl p-8 text-center shadow-xs">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No batches assigned yet</p>
                    </div>
                  ) : (
                    profile.batches.map((b) => (
                      <div key={b.batchId} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs flex items-start gap-3">
                        <div className="w-9 h-9 bg-brand/10 text-brand rounded-xl flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-slate-900 truncate">{b.batchName}</h4>
                            <span className="text-[9px] font-black text-slate-400 shrink-0">{b.batchId}</span>
                          </div>
                          {b.location && (
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 truncate">{b.location}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[9px] font-black text-brand uppercase tracking-wider">
                              {b.memberCount} members
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              {mealLabel(b.mealSchedule)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Sign out button */}
                <div className="pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-red-50 transition cursor-pointer shadow-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
