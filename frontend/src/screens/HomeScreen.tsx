import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Coffee, Sun, Moon, Lock, Check, Clock, AlertCircle, X, ChevronRight, Hash, Leaf, Home, GraduationCap
} from 'lucide-react';

interface MemberOrder {
  memberId: string;
  memberName: string;
  deliveryType: 'home' | 'college';
  bf: number; // 0 or 1
  bfQty: number; // 0, 1, 2, 3...
  bfType: 'veg' | 'nonveg';
  bfAddons: any[];
  bfReceived: boolean;

  lunch: number; // 0 or 1
  lunchQty: number; // 0, 1, 2, 3...
  lunchType: 'veg' | 'nonveg';
  lunchAddons: any[];
  lunchReceived: boolean;

  dinner: number; // 0 or 1
  dinnerQty: number; // 0, 1, 2, 3...
  dinnerType: 'veg' | 'nonveg';
  dinnerAddons: any[];
  dinnerReceived: boolean;
}

interface DeliveryInfo {
  bfStatus: 'Pending' | 'On Delivery' | 'Delivered';
  lunchStatus: 'Pending' | 'On Delivery' | 'Delivered';
  dinnerStatus: 'Pending' | 'On Delivery' | 'Delivered';
}

// ── Tiny reusable +/- counter ──────────────────────────────────────
function Counter({
  value, onDec, onInc, disabled
}: { value: number; onDec: () => void; onInc: () => void; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="text-center">
        <div className="text-sm font-extrabold text-slate-500">{value}</div>
        <div className="text-[8px] font-black text-red-600 uppercase tracking-wider mt-0.5">Closed</div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-lg h-7 w-[84px] mx-auto overflow-hidden bg-white shadow-xs">
      <button
        onClick={onDec}
        disabled={value <= 0}
        className="w-6.5 h-full flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer select-none"
      >−</button>
      <span className={`text-xs select-none font-black ${value > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{value}</span>
      <button
        onClick={onInc}
        disabled={value >= 9}
        className="w-6.5 h-full flex items-center justify-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 transition cursor-pointer select-none"
      >+</button>
    </div>
  );
}

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);
  const [ordersList, setOrdersList]       = useState<MemberOrder[]>([]);
  const [originalOrders, setOriginalOrders] = useState<MemberOrder[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryInfo>({
    bfStatus: 'Pending', lunchStatus: 'Pending', dinnerStatus: 'Pending'
  });
  const [dailyMenu, setDailyMenu] = useState<any>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const [activeMemberCard, setActiveMemberCard] = useState<{ memberId: string; segment: 'count' | 'veg' | 'delivery' | 'cancel' } | null>(null);
  const [tempOrder, setTempOrder] = useState<MemberOrder | null>(null);

  const handleToggleSegment = (member: MemberOrder, segment: 'count' | 'veg' | 'delivery' | 'cancel') => {
    if (activeMemberCard?.memberId === member.memberId && activeMemberCard?.segment === segment) {
      setActiveMemberCard(null);
      setTempOrder(null);
    } else {
      setActiveMemberCard({ memberId: member.memberId, segment });
      setTempOrder(JSON.parse(JSON.stringify(member)));
    }
  };

  const handleSaveTempOrder = async () => {
    if (!tempOrder) return;
    setSaving(true);
    try {
      const updatedList = ordersList.map(o => (o.memberId === tempOrder.memberId ? tempOrder : o));
      await api.post('/orders/batch-save', { date: selectedDate, orders: updatedList });
      setOrdersList(updatedList);
      setOriginalOrders(JSON.parse(JSON.stringify(updatedList)));
      setActiveMemberCard(null);
      setTempOrder(null);
      setShowSuccessModal(true);
    } catch (e: any) {
      triggerToast(e.response?.data?.message || '⚠️ Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  // Toast helper
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Date helpers ──────────────────────────────────────────────────
  const getDates = () => {
    const now = new Date();
    const getIstDateStr = (date: Date) => {
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
      });
      const parts = fmt.formatToParts(date);
      const m: Record<string, string> = {};
      parts.forEach(p => { m[p.type] = p.value; });
      return `${m.year}-${m.month}-${m.day}`;
    };
    const todayStr = getIstDateStr(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return { todayStr, tomorrowStr: getIstDateStr(tomorrow) };
  };

  const { todayStr, tomorrowStr } = getDates();

  const getDefaultDate = () => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false
    });
    return parseInt(fmt.format(now), 10) >= 19 ? tomorrowStr : todayStr;
  };

  const [selectedDate, setSelectedDate] = useState(getDefaultDate());

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // ── Lock state ────────────────────────────────────────────────────
  const [bfLocked, setBfLocked]         = useState(false);
  const [lunchLocked, setLunchLocked]   = useState(false);
  const [dinnerLocked, setDinnerLocked] = useState(false);

  // ── Received state ────────────────────────────────────────────────
  const [batchBfReceived, setBatchBfReceived]         = useState(false);
  const [batchLunchReceived, setBatchLunchReceived]   = useState(false);
  const [batchDinnerReceived, setBatchDinnerReceived] = useState(false);

  const [isHoliday, setIsHoliday]       = useState(false);
  const [holidayReason, setHolidayReason] = useState('');

  const calculateLocks = (date: string) => {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: false
    });
    const parts = fmt.formatToParts(now);
    const map: Record<string, string> = {};
    parts.forEach(p => { map[p.type] = p.value; });
    const istToday = `${map.year}-${String(map.month).padStart(2, '0')}-${String(map.day).padStart(2, '0')}`;
    const istHour  = parseInt(map.hour, 10);

    setBfLocked(false); setLunchLocked(false); setDinnerLocked(false);

    if (date < istToday) {
      setBfLocked(true); setLunchLocked(true); setDinnerLocked(true);
    } else if (date === istToday) {
      if (istHour >= 4)  setBfLocked(true);
      if (istHour >= 9)  setLunchLocked(true);
      if (istHour >= 16) setDinnerLocked(true);
    }
  };

  // ── Load orders (Fetched in parallel and normalized) ──
  const loadOrders = async () => {
    setLoading(true);
    try {
      calculateLocks(selectedDate);
      
      const [res, menuRes] = await Promise.all([
        api.get(`/orders/batch/${selectedDate}`),
        api.get(`/menu/${selectedDate}`).catch(() => ({ data: null }))
      ]);

      setDailyMenu(menuRes.data || null);

      if (res.data?.isHoliday) {
        setIsHoliday(true);
        setHolidayReason(res.data.holidayReason || 'Holiday');
        setOrdersList([]); setOriginalOrders([]);
        setDeliveryStatus({ bfStatus: 'Pending', lunchStatus: 'Pending', dinnerStatus: 'Pending' });
        setBatchBfReceived(false); setBatchLunchReceived(false); setBatchDinnerReceived(false);
      } else {
        setIsHoliday(false); setHolidayReason('');
        const rawList = res.data?.orders || (Array.isArray(res.data) ? res.data : []);
        
        // Normalize loaded data — migrate old records where bf/lunch/dinner held qty (not count)
        const dataList: MemberOrder[] = rawList.map((o: any) => {
          // If bfQty missing, old record used bf as quantity → migrate
          const bfQty   = o.bfQty   !== undefined ? (o.bfQty   || 0) : (o.bf    || 0);
          const lunchQty = o.lunchQty !== undefined ? (o.lunchQty || 0) : (o.lunch  || 0);
          const dinnerQty = o.dinnerQty !== undefined ? (o.dinnerQty || 0) : (o.dinner || 0);
          const globalDel = localStorage.getItem('vj_delivery') === 'Clg Drop' ? 'college' : 'home';
          return {
            ...o,
            bf:           o.bf !== undefined ? o.bf : (bfQty > 0 ? 1 : 0),
            bfQty,
            bfType:       o.bfType     || 'nonveg',
            lunch:        o.lunch !== undefined ? o.lunch : (lunchQty > 0 ? 1 : 0),
            lunchQty,
            lunchType:    o.lunchType  || 'nonveg',
            dinner:       o.dinner !== undefined ? o.dinner : (dinnerQty > 0 ? 1 : 0),
            dinnerQty,
            dinnerType:   o.dinnerType || 'nonveg',
            deliveryType: (o.deliveryType === 'home' || o.deliveryType === 'college') ? o.deliveryType : globalDel,
          };
        });

        const deliveryInfo = res.data?.delivery || { bfStatus: 'Pending', lunchStatus: 'Pending', dinnerStatus: 'Pending' };
        setOrdersList(dataList);
        setOriginalOrders(JSON.parse(JSON.stringify(dataList)));
        setDeliveryStatus(deliveryInfo);
        if (dataList.length > 0) {
          setBatchBfReceived(dataList.every(o => o.bfReceived));
          setBatchLunchReceived(dataList.every(o => o.lunchReceived));
          setBatchDinnerReceived(dataList.every(o => o.dinnerReceived));
        } else {
          setBatchBfReceived(false); setBatchLunchReceived(false); setBatchDinnerReceived(false);
        }
      }
    } catch {
      triggerToast('⚠️ Failed to load batch orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersSilent = async () => {
    if (hasChanges()) return; // Don't overwrite unsaved user edits!
    try {
      const [res, menuRes] = await Promise.all([
        api.get(`/orders/batch/${selectedDate}`),
        api.get(`/menu/${selectedDate}`).catch(() => ({ data: null }))
      ]);
      setDailyMenu(menuRes.data || null);
      if (!res.data?.isHoliday) {
        const rawList = res.data?.orders || (Array.isArray(res.data) ? res.data : []);
        const dataList: MemberOrder[] = rawList.map((o: any) => {
          const bfQty    = o.bfQty    !== undefined ? (o.bfQty    || 0) : (o.bf     || 0);
          const lunchQty  = o.lunchQty  !== undefined ? (o.lunchQty  || 0) : (o.lunch   || 0);
          const dinnerQty = o.dinnerQty !== undefined ? (o.dinnerQty || 0) : (o.dinner  || 0);
          const globalDel = localStorage.getItem('vj_delivery') === 'Clg Drop' ? 'college' : 'home';
          return {
            ...o,
            bf:           o.bf !== undefined ? o.bf : (bfQty > 0 ? 1 : 0),
            bfQty,
            bfType:       o.bfType     || 'nonveg',
            lunch:        o.lunch !== undefined ? o.lunch : (lunchQty > 0 ? 1 : 0),
            lunchQty,
            lunchType:    o.lunchType  || 'nonveg',
            dinner:       o.dinner !== undefined ? o.dinner : (dinnerQty > 0 ? 1 : 0),
            dinnerQty,
            dinnerType:   o.dinnerType || 'nonveg',
            deliveryType: (o.deliveryType === 'home' || o.deliveryType === 'college') ? o.deliveryType : globalDel,
          };
        });
        setOrdersList(dataList);
        setOriginalOrders(JSON.parse(JSON.stringify(dataList)));
      }
    } catch {
      // Background silent refresh failed — non-disruptive
    }
  };

  useEffect(() => { loadOrders(); }, [selectedDate]);

  useEffect(() => {
    // Poll orders every 10 seconds to fetch admin changes in real time
    const interval = setInterval(() => {
      loadOrdersSilent();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  // ── Actions (Local edits only — no auto save) ──────────────────────
  const adjustCount = (memberId: string, meal: 'bf' | 'lunch' | 'dinner', delta: number) => {
    if (meal === 'bf' && bfLocked) return;
    if (meal === 'lunch' && lunchLocked) return;
    if (meal === 'dinner' && dinnerLocked) return;
    
    setOrdersList(prev =>
      prev.map(item => {
        if (item.memberId === memberId) {
          const qtyField = `${meal}Qty` as 'bfQty' | 'lunchQty' | 'dinnerQty';
          const newQty = Math.max(0, Math.min(9, (item[qtyField] || 0) + delta));
          const newCount = newQty > 0 ? 1 : 0; // count is 1 if quantity > 0, else 0
          return {
            ...item,
            [qtyField]: newQty,
            [meal]: newCount
          };
        }
        return item;
      })
    );
  };

  const toggleVegForMember = (memberId: string, nv: 'veg' | 'nonveg') => {
    setOrdersList(prev =>
      prev.map(item =>
        item.memberId === memberId
          ? {
              ...item,
              bfType:     bfLocked     ? item.bfType     : nv,
              lunchType:  lunchLocked  ? item.lunchType  : nv,
              dinnerType: dinnerLocked ? item.dinnerType : nv,
            }
          : item
      )
    );
  };

  const getDisplayVeg = (m: MemberOrder) => {
    let rawType: 'veg' | 'nonveg' = 'nonveg';
    if (!bfLocked) rawType = m.bfType;
    else if (!lunchLocked) rawType = m.lunchType;
    else if (!dinnerLocked) rawType = m.dinnerType;
    else rawType = m.lunchType || 'nonveg';
    
    return rawType === 'veg' ? 'Veg' : 'Non-Veg';
  };

  const cancelMemberOrder = (memberId: string) => {
    setOrdersList(prev =>
      prev.map(item => {
        if (item.memberId === memberId) {
          return {
            ...item,
            bf: bfLocked ? item.bf : 0,
            bfQty: bfLocked ? item.bfQty : 0,
            lunch: lunchLocked ? item.lunch : 0,
            lunchQty: lunchLocked ? item.lunchQty : 0,
            dinner: dinnerLocked ? item.dinner : 0,
            dinnerQty: dinnerLocked ? item.dinnerQty : 0
          };
        }
        return item;
      })
    );
  };

  const cancelWholeBatch = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Batch Orders',
      message: 'Cancel all counts for unlocked sessions for the entire batch?',
      onConfirm: async () => {
        setSaving(true);
        try {
          const updated = ordersList.map(item => ({
            ...item,
            bf: bfLocked ? item.bf : 0,
            bfQty: bfLocked ? item.bfQty : 0,
            lunch: lunchLocked ? item.lunch : 0,
            lunchQty: lunchLocked ? item.lunchQty : 0,
            dinner: dinnerLocked ? item.dinner : 0,
            dinnerQty: dinnerLocked ? item.dinnerQty : 0
          }));
          await api.post('/orders/batch-save', { date: selectedDate, orders: updated });
          setOrdersList(updated);
          setOriginalOrders(JSON.parse(JSON.stringify(updated)));
          triggerToast('✅ Cancelled batch orders successfully!');
        } catch {
          triggerToast('⚠️ Failed to cancel batch orders');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const toggleReceived = (session: 'bf' | 'lunch' | 'dinner') => {
    if (session === 'bf' && batchBfReceived) return;
    if (session === 'lunch' && batchLunchReceived) return;
    if (session === 'dinner' && batchDinnerReceived) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Food Receipt',
      message: 'Confirm that you received your food?',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.post('/orders/batch-receive', { date: selectedDate, session });
          const field = `${session}Received` as 'bfReceived' | 'lunchReceived' | 'dinnerReceived';
          if (session === 'bf')     setBatchBfReceived(true);
          if (session === 'lunch')  setBatchLunchReceived(true);
          if (session === 'dinner') setBatchDinnerReceived(true);
          setOrdersList(prev => {
            const updated = prev.map(o => ({ ...o, [field]: true }));
            setOriginalOrders(JSON.parse(JSON.stringify(updated)));
            return updated;
          });
          triggerToast('✅ Food received status updated!');
        } catch (err: any) {
          triggerToast(err.response?.data?.message || '⚠️ Failed to update received status');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const hasChanges = () => {
    if (ordersList.length !== originalOrders.length) return true;
    for (let i = 0; i < ordersList.length; i++) {
      const a = ordersList[i];
      const b = originalOrders[i];
      if (a.bf !== b.bf || a.bfQty !== b.bfQty || a.bfType !== b.bfType ||
          a.lunch !== b.lunch || a.lunchQty !== b.lunchQty || a.lunchType !== b.lunchType ||
          a.dinner !== b.dinner || a.dinnerQty !== b.dinnerQty || a.dinnerType !== b.dinnerType ||
          a.deliveryType !== b.deliveryType) {
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Use per-member deliveryType (set via the Home/Clg panel)
      await api.post('/orders/batch-save', { date: selectedDate, orders: ordersList });
      triggerToast('✅ Orders saved successfully!');
      loadOrders();
    } catch (e: any) {
      triggerToast(e.response?.data?.message || '⚠️ Failed to save orders');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived totals (use ordersList so total counts/quantities update in real-time) ──
  const totalBfQty       = ordersList.reduce((s, o) => s + (o.bfQty || 0), 0);
  const totalBfCount     = ordersList.reduce((s, o) => s + (o.bf || 0), 0);

  const totalLunchQty    = ordersList.reduce((s, o) => s + (o.lunchQty || 0), 0);
  const totalLunchCount  = ordersList.reduce((s, o) => s + (o.lunch || 0), 0);

  const totalDinnerQty   = ordersList.reduce((s, o) => s + (o.dinnerQty || 0), 0);
  const totalDinnerCount = ordersList.reduce((s, o) => s + (o.dinner || 0), 0);

  const allLocked   = bfLocked && lunchLocked && dinnerLocked;

  const deliveryStatusColor = (s: string) =>
    s === 'Delivered'   ? 'text-emerald-600' :
    s === 'On Delivery' ? 'text-blue-500'    : 'text-slate-400';

  // Reads meal name directly from DailyMenu (name field)
  const formatMealSummary = (sessionObj: any): string => {
    if (!sessionObj || !sessionObj.name?.trim()) return 'Menu will be provided soon';
    return sessionObj.name.trim();
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full relative bg-slate-50">

      {/* ── Toast ── */}
      {toast && (
        <div className="absolute top-14 left-3 right-3 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 border border-slate-700 animate-slide-down">
          <AlertCircle className="w-4 h-4 text-brand shrink-0" />
          <p className="flex-1 font-semibold">{toast}</p>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>
        </div>
      )}

      {/* ── Date Tabs matching screenshots ── */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 px-4 pt-4 shrink-0">
        {[{ label: 'Today', date: todayStr }, { label: 'Tomorrow', date: tomorrowStr }].map(({ label, date }) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`py-3 px-4 rounded-xl transition-all text-left bg-white border cursor-pointer ${
              selectedDate === date
                ? 'border-brand ring-1 ring-brand/30 shadow-xs'
                : 'border-slate-200/65 shadow-3xs hover:bg-slate-50'
            }`}
          >
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
            <div className="text-[13px] font-black text-slate-800 mt-1">{formatDisplayDate(date)}</div>
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
          <span className="text-sm text-slate-500 font-medium">Loading orders…</span>
        </div>

      ) : isHoliday ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 text-center w-full max-w-sm border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-brand" />
            <img src="/vj-logo-transparent.png" alt="VJ Home Foods" className="h-16 mx-auto mb-4 object-contain filter drop-shadow-md" />
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No Cooking In The Kitchen Today! ✦</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium bg-orange-50/60 p-3 rounded-2xl border border-orange-100/60">
              {holidayReason ? `Special Holiday Notice: ${holidayReason}` : 'Our master chefs have cooked up a day off! All pots and stoves are resting today.'}
            </p>
          </div>
        </div>

      ) : (
        <div className="flex-1 overflow-y-auto pb-24 px-3 pt-4 space-y-4 animate-fade-in">

          {/* ── Batch Summary Counts ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Today's Feast & Batch Count
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Breakfast', Icon: Coffee, count: totalBfCount, mealName: formatMealSummary(dailyMenu?.breakfast) },
                { label: 'Lunch',     Icon: Sun,    count: totalLunchCount, mealName: formatMealSummary(dailyMenu?.lunch) },
                { label: 'Dinner',    Icon: Moon,   count: totalDinnerCount, mealName: formatMealSummary(dailyMenu?.dinner) },
              ].map(({ label, Icon, count, mealName }) => (
                <div key={label} className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-center flex flex-col items-center gap-1 min-w-0">
                  <Icon className="w-5 h-5 text-brand" aria-hidden="true" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                  {mealName ? (
                    <span
                      className="text-[9px] font-extrabold text-slate-800 text-center leading-tight w-full block px-0.5"
                      title={mealName}
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {mealName}
                    </span>
                  ) : null}
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="text-[18px] font-black text-brand leading-none">{count}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">count</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Member Meal Quantities Edit Section ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                Member Meal Quantities
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ordersList.map((m) => {
                const cardIsActive = activeMemberCard?.memberId === m.memberId;
                const activeSegment = cardIsActive ? activeMemberCard.segment : null;
                
                return (
                  <div
                    key={m.memberId}
                    className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3 shadow-3xs"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-black text-slate-800 block leading-tight">
                          {m.memberName}
                        </span>
                      </div>
                    </div>

                    {/* Active Order details display (slate theme - enlarged) */}
                    <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                      {m.bf > 0 && (
                        <span className="text-xs font-black uppercase text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Coffee className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>BF: {m.bf} ({m.bfQty} qty, {m.bfType === 'veg' ? 'Veg' : 'NV'})</span>
                        </span>
                      )}
                      {m.lunch > 0 && (
                        <span className="text-xs font-black uppercase text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>L: {m.lunch} ({m.lunchQty} qty, {m.lunchType === 'veg' ? 'Veg' : 'NV'})</span>
                        </span>
                      )}
                      {m.dinner > 0 && (
                        <span className="text-xs font-black uppercase text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          <Moon className="w-4 h-4 text-slate-500 shrink-0" />
                          <span>D: {m.dinner} ({m.dinnerQty} qty, {m.dinnerType === 'veg' ? 'Veg' : 'NV'})</span>
                        </span>
                      )}
                      {(m.bf > 0 || m.lunch > 0 || m.dinner > 0) && (
                        <span className="text-xs font-black uppercase text-slate-600 bg-slate-50 border border-slate-200/50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                          {m.deliveryType === 'college' ? (
                            <GraduationCap className="w-4 h-4 text-slate-500 shrink-0" />
                          ) : (
                            <Home className="w-4 h-4 text-slate-500 shrink-0" />
                          )}
                          <span>{m.deliveryType === 'college' ? 'Clg Drop' : 'Home'}</span>
                        </span>
                      )}
                    </div>

                    {/* 4 Action buttons (orange theme when inactive - enlarged) */}
                    <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleSegment(m, 'count')}
                        className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition select-none cursor-pointer ${
                          activeSegment === 'count' ? 'bg-brand text-white border border-brand' : 'bg-brand/5 text-brand border border-brand/15 hover:bg-brand/10'
                        }`}
                      >
                        <Hash className="w-4.5 h-4.5" />
                        <span>Count</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSegment(m, 'veg')}
                        className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition select-none cursor-pointer ${
                          activeSegment === 'veg' ? 'bg-brand text-white border border-brand' : 'bg-brand/5 text-brand border border-brand/15 hover:bg-brand/10'
                        }`}
                      >
                        <Leaf className="w-4.5 h-4.5" />
                        <span>Veg/NV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSegment(m, 'delivery')}
                        className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition select-none cursor-pointer ${
                          activeSegment === 'delivery' ? 'bg-brand text-white border border-brand' : 'bg-brand/5 text-brand border border-brand/15 hover:bg-brand/10'
                        }`}
                      >
                        <Home className="w-4.5 h-4.5" />
                        <span>Drop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleSegment(m, 'cancel')}
                        className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition select-none cursor-pointer ${
                          activeSegment === 'cancel' ? 'bg-brand text-white border border-brand' : 'bg-brand/5 text-brand border border-brand/15 hover:bg-brand/10'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>

                        {/* Expanded Panels */}
                        {cardIsActive && tempOrder && (
                          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/50 space-y-3 mt-2 animate-fade-in">
                            {/* Panel Header acting as Title (Enlarged) */}
                            <div className="border-b border-slate-200/60 pb-2 mb-2 flex items-center justify-between">
                              <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                                Modify Order for {m.memberName}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {activeSegment} options
                              </span>
                            </div>

                            {/* ── COUNT PANEL: count(0/1) + qty in a 3-col grid (Enlarged) ── */}
                            {activeSegment === 'count' && (
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Count &amp; Quantity</div>
                                {/* Column headers */}
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-1 mb-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase">Session</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase w-[90px] text-center">Count (0-9)</span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase w-[90px] text-center">Qty</span>
                                </div>
                                <div className="space-y-1.5">
                                  {/* ── Breakfast ── */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/40">
                                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Coffee className="w-4 h-4 text-brand shrink-0" />
                                        <span className="text-xs font-black text-slate-700 truncate">BF</span>
                                      </div>
                                      {/* Count 0 to 9 */}
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={bfLocked || tempOrder.bf <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.max(0, p.bf - 1); return { ...p, bf: n, bfQty: n === 0 ? 0 : p.bfQty }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className={`text-sm font-black w-6 text-center ${tempOrder.bf > 0 ? 'text-brand' : 'text-slate-400'}`}>{tempOrder.bf}</span>
                                        <button type="button" disabled={bfLocked || tempOrder.bf >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.min(9, p.bf + 1); return { ...p, bf: n, bfQty: p.bfQty > 0 ? p.bfQty : n }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                      {/* Qty */}
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={bfLocked || tempOrder.bfQty <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.max(0, p.bfQty - 1); return { ...p, bfQty: q, bf: q === 0 ? 0 : p.bf }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className="text-sm font-black w-6 text-center text-slate-800">{tempOrder.bfQty}</span>
                                        <button type="button" disabled={bfLocked || tempOrder.bfQty >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.min(9, p.bfQty + 1); return { ...p, bfQty: q, bf: p.bf > 0 ? p.bf : 1 }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                    </div>
                                  </div>
                                  {/* ── Lunch ── */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/40">
                                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Sun className="w-4 h-4 text-brand shrink-0" />
                                        <span className="text-xs font-black text-slate-700 truncate">Lunch</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={lunchLocked || tempOrder.lunch <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.max(0, p.lunch - 1); return { ...p, lunch: n, lunchQty: n === 0 ? 0 : p.lunchQty }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className={`text-sm font-black w-6 text-center ${tempOrder.lunch > 0 ? 'text-brand' : 'text-slate-400'}`}>{tempOrder.lunch}</span>
                                        <button type="button" disabled={lunchLocked || tempOrder.lunch >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.min(9, p.lunch + 1); return { ...p, lunch: n, lunchQty: p.lunchQty > 0 ? p.lunchQty : n }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={lunchLocked || tempOrder.lunchQty <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.max(0, p.lunchQty - 1); return { ...p, lunchQty: q, lunch: q === 0 ? 0 : p.lunch }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className="text-sm font-black w-6 text-center text-slate-800">{tempOrder.lunchQty}</span>
                                        <button type="button" disabled={lunchLocked || tempOrder.lunchQty >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.min(9, p.lunchQty + 1); return { ...p, lunchQty: q, lunch: p.lunch > 0 ? p.lunch : 1 }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                    </div>
                                  </div>
                                  {/* ── Dinner ── */}
                                  <div className="bg-white p-3 rounded-xl border border-slate-200/40">
                                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <Moon className="w-4 h-4 text-brand shrink-0" />
                                        <span className="text-xs font-black text-slate-700 truncate">Dinner</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={dinnerLocked || tempOrder.dinner <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.max(0, p.dinner - 1); return { ...p, dinner: n, dinnerQty: n === 0 ? 0 : p.dinnerQty }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className={`text-sm font-black w-6 text-center ${tempOrder.dinner > 0 ? 'text-brand' : 'text-slate-400'}`}>{tempOrder.dinner}</span>
                                        <button type="button" disabled={dinnerLocked || tempOrder.dinner >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const n = Math.min(9, p.dinner + 1); return { ...p, dinner: n, dinnerQty: p.dinnerQty > 0 ? p.dinnerQty : n }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                      <div className="flex items-center gap-1.5 w-[90px] justify-center">
                                        <button type="button" disabled={dinnerLocked || tempOrder.dinnerQty <= 0}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.max(0, p.dinnerQty - 1); return { ...p, dinnerQty: q, dinner: q === 0 ? 0 : p.dinner }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >−</button>
                                        <span className="text-sm font-black w-6 text-center text-slate-800">{tempOrder.dinnerQty}</span>
                                        <button type="button" disabled={dinnerLocked || tempOrder.dinnerQty >= 9}
                                          onClick={() => setTempOrder(p => { if (!p) return p; const q = Math.min(9, p.dinnerQty + 1); return { ...p, dinnerQty: q, dinner: p.dinner > 0 ? p.dinner : 1 }; })}
                                          className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-sm font-black text-slate-700 disabled:opacity-30 cursor-pointer"
                                        >+</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── DELIVERY PANEL: Home (first/preferred) or College (Enlarged) ── */}
                            {activeSegment === 'delivery' && (
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Drop Point</div>
                                <div className="flex gap-3">
                                  {/* Home — first / preferred */}
                                  <button
                                    type="button"
                                    onClick={() => setTempOrder(p => p ? { ...p, deliveryType: 'home' } : p)}
                                    className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl border-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                                      tempOrder.deliveryType === 'home'
                                        ? 'bg-brand/10 border-brand text-brand'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                  >
                                    <Home className={`w-6 h-6 ${tempOrder.deliveryType === 'home' ? 'text-brand' : 'text-slate-400'}`} />
                                    <span>Home</span>
                                    {tempOrder.deliveryType === 'home' && (
                                      <span className="text-[9px] font-black text-brand">● Selected</span>
                                    )}
                                  </button>
                                  {/* College */}
                                  <button
                                    type="button"
                                    onClick={() => setTempOrder(p => p ? { ...p, deliveryType: 'college' } : p)}
                                    className={`flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl border-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                                      tempOrder.deliveryType === 'college'
                                        ? 'bg-brand/10 border-brand text-brand'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                    }`}
                                  >
                                    <GraduationCap className={`w-6 h-6 ${tempOrder.deliveryType === 'college' ? 'text-brand' : 'text-slate-400'}`} />
                                    <span>College</span>
                                    {tempOrder.deliveryType === 'college' && (
                                      <span className="text-[9px] font-black text-brand">● Selected</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* VEG/NV SEGMENT (Enlarged) */}
                            {activeSegment === 'veg' && (
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Set Meal Preferences</div>
                                <div className="space-y-2">
                                  {/* Breakfast Preference */}
                                  {tempOrder.bf > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <div className="flex items-center gap-1.5">
                                        <Coffee className="w-4 h-4 text-brand" />
                                        <span className="text-xs font-black text-slate-700">Breakfast</span>
                                      </div>
                                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                          type="button"
                                          disabled={bfLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, bfType: 'veg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.bfType === 'veg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >Veg</button>
                                        <button
                                          type="button"
                                          disabled={bfLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, bfType: 'nonveg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.bfType === 'nonveg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >NV</button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Lunch Preference */}
                                  {tempOrder.lunch > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <div className="flex items-center gap-1.5">
                                        <Sun className="w-4 h-4 text-brand" />
                                        <span className="text-xs font-black text-slate-700">Lunch</span>
                                      </div>
                                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                          type="button"
                                          disabled={lunchLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, lunchType: 'veg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.lunchType === 'veg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >Veg</button>
                                        <button
                                          type="button"
                                          disabled={lunchLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, lunchType: 'nonveg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.lunchType === 'nonveg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >NV</button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Dinner Preference */}
                                  {tempOrder.dinner > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <div className="flex items-center gap-1.5">
                                        <Moon className="w-4 h-4 text-brand" />
                                        <span className="text-xs font-black text-slate-700">Dinner</span>
                                      </div>
                                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                                        <button
                                          type="button"
                                          disabled={dinnerLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, dinnerType: 'veg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.dinnerType === 'veg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >Veg</button>
                                        <button
                                          type="button"
                                          disabled={dinnerLocked}
                                          onClick={() => setTempOrder(prev => prev ? ({ ...prev, dinnerType: 'nonveg' }) : prev)}
                                          className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                                            tempOrder.dinnerType === 'nonveg' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600'
                                          }`}
                                        >NV</button>
                                      </div>
                                    </div>
                                  )}

                                  {tempOrder.bf === 0 && tempOrder.lunch === 0 && tempOrder.dinner === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-400 italic">No active meals to configure.</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* CANCEL SEGMENT (Enlarged) */}
                            {activeSegment === 'cancel' && (
                              <div className="space-y-2">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cancel Active Sessions</div>
                                <div className="space-y-2">
                                  {/* Cancel Breakfast */}
                                  {tempOrder.bf > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <span className="text-xs font-black text-slate-700">Breakfast</span>
                                      <button
                                        type="button"
                                        disabled={bfLocked}
                                        onClick={() => setTempOrder(prev => prev ? ({ ...prev, bf: 0, bfQty: 0 }) : prev)}
                                        className="bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                                      >Cancel</button>
                                    </div>
                                  )}

                                  {/* Cancel Lunch */}
                                  {tempOrder.lunch > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <span className="text-xs font-black text-slate-700">Lunch</span>
                                      <button
                                        type="button"
                                        disabled={lunchLocked}
                                        onClick={() => setTempOrder(prev => prev ? ({ ...prev, lunch: 0, lunchQty: 0 }) : prev)}
                                        className="bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                                      >Cancel</button>
                                    </div>
                                  )}

                                  {/* Cancel Dinner */}
                                  {tempOrder.dinner > 0 && (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/40">
                                      <span className="text-xs font-black text-slate-700">Dinner</span>
                                      <button
                                        type="button"
                                        disabled={dinnerLocked}
                                        onClick={() => setTempOrder(prev => prev ? ({ ...prev, dinner: 0, dinnerQty: 0 }) : prev)}
                                        className="bg-red-50 text-red-600 border border-red-200/60 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer"
                                      >Cancel</button>
                                    </div>
                                  )}

                                  {tempOrder.bf === 0 && tempOrder.lunch === 0 && tempOrder.dinner === 0 && (
                                    <div className="text-center py-4 text-xs text-slate-400 italic">All meals are already cancelled.</div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Panel Actions / Save button (Taller and larger font for mobile) */}
                            <div className="flex gap-3 pt-2.5 border-t border-slate-200/40">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMemberCard(null);
                                  setTempOrder(null);
                                }}
                                className="flex-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveTempOrder}
                                className="flex-1 bg-brand hover:bg-brand-dark text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer"
                              >
                                Save Option
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

          {/* Session closed / cancel all */}
          <div className="pt-1">
            {allLocked ? (
              <div className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl p-3 text-xs font-bold">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Session closed for modifications</span>
              </div>
            ) : (
              <button
                onClick={cancelWholeBatch}
                className="w-full py-2.5 border border-brand/30 rounded-xl text-sm font-bold text-brand bg-white hover:bg-orange-50/30 transition cursor-pointer"
              >
                ✖ Cancel Whole Batch Orders
              </button>
            )}
          </div>

          {/* ── Session Delivery Status ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Session Delivery Status</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Confirm receipt once delivered</p>
            </div>

            <div className="space-y-2.5">
              {([
                { session: 'bf' as const,     Icon: Coffee, label: 'Breakfast', status: deliveryStatus.bfStatus,     received: batchBfReceived },
                { session: 'lunch' as const,  Icon: Sun,    label: 'Lunch',     status: deliveryStatus.lunchStatus,  received: batchLunchReceived },
                { session: 'dinner' as const, Icon: Moon,   label: 'Dinner',    status: deliveryStatus.dinnerStatus, received: batchDinnerReceived },
              ] as const).map(({ session, Icon, label, status, received }) => (
                <div
                  key={session}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand" />
                    <div>
                      <span className="text-xs font-black text-slate-800 uppercase block">{label}</span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        Delivery: <span className={`font-black uppercase ${deliveryStatusColor(status)}`}>{status}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReceived(session)}
                    disabled={received || saving}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-1 cursor-pointer ${
                      received
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                        : 'bg-brand text-white border-brand hover:bg-brand-dark shadow-xs active:scale-95'
                    }`}
                  >
                    {received ? (
                      <><Check className="w-3 h-3" /> Received</>
                    ) : (
                      <><Clock className="w-3 h-3" /> delivery received</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Confirmation Dialog ── */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border-2 border-brand shadow-2xl animate-scale-up space-y-4 text-center">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-wide">
              {confirmDialog.title}
            </h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Success Animation Modal (Tick Mark matching third image) ── */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999] animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full border-2 border-brand shadow-2xl animate-scale-up text-center space-y-6">
            {/* Checkmark Animation Container (Static styling) */}
            <div className="relative flex items-center justify-center w-24 h-24 mx-auto select-none">
              {/* Rays (Static) */}
              <div className="absolute -top-3 w-1 h-3 bg-brand rounded-full" />
              <div className="absolute -top-1 -right-1 w-1 h-3 bg-brand rounded-full rotate-45" />
              <div className="absolute -bottom-1 -right-1 w-1 h-3 bg-brand rounded-full rotate-135" />
              <div className="absolute -bottom-1 -left-1 w-1 h-3 bg-brand rounded-full rotate-225" />
              <div className="absolute -top-1 -left-1 w-1 h-3 bg-brand rounded-full rotate-315" />
              
              {/* Inner Circle (Static) */}
              <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center border-2 border-brand shadow-inner relative z-10">
                <Check className="w-8 h-8 text-brand stroke-[4px]" />
              </div>
            </div>

            {/* Title with dashes and heart */}
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-lg font-black tracking-tight">
                <span className="text-slate-800">Ordered</span>
                <span className="text-brand">Successfully!</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-0.5 bg-slate-200" />
                <span className="text-red-500 text-xs">❤️</span>
                <div className="w-10 h-0.5 bg-slate-200" />
              </div>
            </div>

            {/* Message */}
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              Your order details have been saved successfully.<br />
              All counts are updated in the dashboard.
            </p>

            {/* Close button (White bg, orange border and text) */}
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-white text-brand border-2 border-brand hover:bg-brand/5 rounded-xl text-xs font-black uppercase tracking-widest transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
