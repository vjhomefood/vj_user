import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  Coffee, Sun, Moon, Lock, Check, Clock, AlertCircle, X, ChevronRight, Utensils
} from 'lucide-react';

interface MemberOrder {
  memberId: string;
  memberName: string;
  
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
          return {
            ...o,
            bf:         bfQty    > 0 ? 1 : 0,   // count is strictly 0 or 1
            bfQty,
            bfType:     o.bfType     || 'nonveg',
            lunch:      lunchQty  > 0 ? 1 : 0,
            lunchQty,
            lunchType:  o.lunchType  || 'nonveg',
            dinner:     dinnerQty > 0 ? 1 : 0,
            dinnerQty,
            dinnerType: o.dinnerType || 'nonveg',
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
          return {
            ...o,
            bf:         bfQty    > 0 ? 1 : 0,
            bfQty,
            bfType:     o.bfType     || 'nonveg',
            lunch:      lunchQty  > 0 ? 1 : 0,
            lunchQty,
            lunchType:  o.lunchType  || 'nonveg',
            dinner:     dinnerQty > 0 ? 1 : 0,
            dinnerQty,
            dinnerType: o.dinnerType || 'nonveg',
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
    if (!window.confirm('Cancel all counts for unlocked sessions for the entire batch?')) return;
    setOrdersList(prev =>
      prev.map(item => ({
        ...item,
        bf: bfLocked ? item.bf : 0,
        bfQty: bfLocked ? item.bfQty : 0,
        lunch: lunchLocked ? item.lunch : 0,
        lunchQty: lunchLocked ? item.lunchQty : 0,
        dinner: dinnerLocked ? item.dinner : 0,
        dinnerQty: dinnerLocked ? item.dinnerQty : 0
      }))
    );
  };

  const toggleReceived = (session: 'bf' | 'lunch' | 'dinner') => {
    if (session === 'bf' && batchBfReceived) return;
    if (session === 'lunch' && batchLunchReceived) return;
    if (session === 'dinner' && batchDinnerReceived) return;
    if (!window.confirm('Confirm that you received your food?')) return;

    const perform = async () => {
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
    };
    perform();
  };

  const hasChanges = () => {
    if (ordersList.length !== originalOrders.length) return true;
    for (let i = 0; i < ordersList.length; i++) {
      const a = ordersList[i];
      const b = originalOrders[i];
      if (a.bf !== b.bf || a.bfQty !== b.bfQty || a.bfType !== b.bfType ||
          a.lunch !== b.lunch || a.lunchQty !== b.lunchQty || a.lunchType !== b.lunchType ||
          a.dinner !== b.dinner || a.dinnerQty !== b.dinnerQty || a.dinnerType !== b.dinnerType) {
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentDeliveryMethod = localStorage.getItem('vj_delivery') === 'Clg Drop' ? 'college' : 'home';
      const ordersToSave = ordersList.map(o => ({
        ...o,
        deliveryType: currentDeliveryMethod
      }));
      await api.post('/orders/batch-save', { date: selectedDate, orders: ordersToSave });
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
  const totalBfCount     = ordersList.reduce((s, o) => s + (o.bf > 0 ? 1 : 0), 0);

  const totalLunchQty    = ordersList.reduce((s, o) => s + (o.lunchQty || 0), 0);
  const totalLunchCount  = ordersList.reduce((s, o) => s + (o.lunch > 0 ? 1 : 0), 0);

  const totalDinnerQty   = ordersList.reduce((s, o) => s + (o.dinnerQty || 0), 0);
  const totalDinnerCount = ordersList.reduce((s, o) => s + (o.dinner > 0 ? 1 : 0), 0);

  const allLocked   = bfLocked && lunchLocked && dinnerLocked;

  const deliveryStatusColor = (s: string) =>
    s === 'Delivered'   ? 'text-emerald-600' :
    s === 'On Delivery' ? 'text-blue-500'    : 'text-slate-400';

  // Reads meal name directly from DailyMenu (name field)
  const formatMealSummary = (sessionObj: any): string => {
    if (!sessionObj) return '';
    return sessionObj.name?.trim() || '';
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
            <img src="/vjhomefoods/vj-logo-transparent.png" alt="VJ Home Foods" className="h-16 mx-auto mb-4 object-contain filter drop-shadow-md" />
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No Cooking In The Kitchen Today! 👨‍🍳</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium bg-orange-50/60 p-3 rounded-2xl border border-orange-100/60">
              {holidayReason ? `Special Holiday Notice: ${holidayReason}` : 'Our master chefs have cooked up a day off! All pots and stoves are resting today. 🍲'}
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
              <span className="text-[9px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full uppercase">&#x1F373; Kitchen Live</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Breakfast', symbol: '☀', count: totalBfCount, mealName: formatMealSummary(dailyMenu?.breakfast) },
                { label: 'Lunch',     symbol: '☕', count: totalLunchCount, mealName: formatMealSummary(dailyMenu?.lunch) },
                { label: 'Dinner',    symbol: '☾', count: totalDinnerCount, mealName: formatMealSummary(dailyMenu?.dinner) },
              ].map(({ label, symbol, count, mealName }) => (
                <div key={label} className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-2.5 text-center flex flex-col items-center gap-1 min-w-0">
                  <span className="text-brand text-base leading-none" aria-hidden="true">{symbol}</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
                  {mealName ? (
                    <span
                      className="text-[9px] font-extrabold text-slate-800 text-center leading-tight w-full block px-0.5"
                      title={mealName}
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {mealName}
                    </span>
                  ) : (
                    <span className="text-[8px] font-medium text-slate-400 italic block">No menu</span>
                  )}
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="text-[18px] font-black text-brand leading-none">{count}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">plates</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Member Meal Quantities ── */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Member Meal Quantities</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">Specify quantities &amp; veg preferences below</p>
            </div>

            {ordersList.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">No members registered in this batch.</div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        {['Member', 'Non-Veg / Veg', 'Breakfast', 'Lunch', 'Dinner', 'Action'].map(h => (
                          <th key={h} className="py-2 px-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider text-center first:text-left">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ordersList.map((m) => {
                        const currentVeg = getDisplayVeg(m);
                        return (
                          <tr key={m.memberId} className="hover:bg-slate-50/50 transition">
                            {/* Name */}
                            <td className="py-3 px-1.5">
                              <div className="text-xs font-extrabold text-slate-900">{m.memberName}</div>
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5">{m.memberId}</div>
                            </td>

                            {/* Veg toggle */}
                            <td className="py-3 px-1.5 text-center">
                              {allLocked ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                  currentVeg === 'Veg'
                                    ? 'bg-orange-50/50 text-brand/75 border-brand/10'
                                    : 'bg-brand/70 text-white/90 border-brand/10'
                                }`}>{currentVeg}</span>
                              ) : (
                                <button
                                  onClick={() => {
                                    const nv = currentVeg === 'Veg' ? 'nonveg' : 'veg';
                                    toggleVegForMember(m.memberId, nv);
                                  }}
                                  className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase cursor-pointer transition ${
                                    currentVeg === 'Veg'
                                      ? 'bg-orange-50 border-brand/30 text-brand hover:bg-orange-100'
                                      : 'bg-brand border-brand text-white hover:bg-brand-dark'
                                  }`}
                                >{currentVeg}</button>
                              )}
                            </td>

                             {/* Breakfast */}
                             <td className="py-3 px-1.5 text-center">
                               <Counter
                                 value={m.bfQty || 0}
                                 disabled={bfLocked}
                                 onDec={() => adjustCount(m.memberId, 'bf', -1)}
                                 onInc={() => adjustCount(m.memberId, 'bf', 1)}
                               />
                             </td>
 
                             {/* Lunch */}
                             <td className="py-3 px-1.5 text-center">
                               <Counter
                                 value={m.lunchQty || 0}
                                 disabled={lunchLocked}
                                 onDec={() => adjustCount(m.memberId, 'lunch', -1)}
                                 onInc={() => adjustCount(m.memberId, 'lunch', 1)}
                               />
                             </td>
 
                             {/* Dinner */}
                             <td className="py-3 px-1.5 text-center">
                               <Counter
                                 value={m.dinnerQty || 0}
                                 disabled={dinnerLocked}
                                 onDec={() => adjustCount(m.memberId, 'dinner', -1)}
                                 onInc={() => adjustCount(m.memberId, 'dinner', 1)}
                               />
                             </td>

                            {/* Action */}
                            <td className="py-3 px-1.5 text-center">
                              {allLocked ? (
                                <span className="text-[8px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">CLOSED</span>
                              ) : (
                                <button
                                  onClick={() => cancelMemberOrder(m.memberId)}
                                  className="px-2 py-1 rounded-lg border border-red-200 bg-red-50 text-[9px] font-black text-red-600 hover:bg-red-100 cursor-pointer transition"
                                >Cancel</button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Card List matching screenshot 2 exactly */}
                <div className="block sm:hidden space-y-3">
                  {ordersList.map((m) => {
                    const currentVeg = getDisplayVeg(m);
                    return (
                      <div
                        key={m.memberId}
                        className="bg-white rounded-2xl border border-slate-200/60 p-4 space-y-3.5 shadow-3xs"
                      >
                        {/* Header line */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm font-black text-slate-800 block leading-tight">
                              {m.memberName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">
                              {m.memberId}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Veg badge */}
                            {allLocked ? (
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                                currentVeg === 'Veg'
                                  ? 'bg-orange-50/50 text-brand/75 border-brand/10'
                                  : 'bg-brand/70 text-white/90 border-brand/10'
                              }`}>{currentVeg}</span>
                            ) : (
                              <button
                                onClick={() => {
                                  const nv = currentVeg === 'Veg' ? 'nonveg' : 'veg';
                                  toggleVegForMember(m.memberId, nv);
                                }}
                                className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase transition ${
                                  currentVeg === 'Veg'
                                    ? 'bg-orange-50 border-brand/30 text-brand'
                                    : 'bg-brand border-brand text-white'
                                }`}
                              >{currentVeg}</button>
                            )}

                            {/* Cancel button / Closed status badge */}
                            {allLocked ? (
                              <span className="text-[8px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                                CLOSED
                              </span>
                            ) : (
                              <button
                                onClick={() => cancelMemberOrder(m.memberId)}
                                className="px-2 py-0.5 rounded border border-red-200 bg-red-50 text-[8px] font-black text-red-600 hover:bg-red-100 cursor-pointer uppercase tracking-wider transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Three counter boxes */}
                        <div className="grid grid-cols-3 gap-2.5 pt-1">
                          {/* Breakfast Box */}
                          <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Coffee className="w-3.5 h-3.5 text-brand" />
                              <span className="text-[10px] font-black text-slate-400">B</span>
                            </div>
                            {bfLocked ? (
                              <span className="text-xs font-black text-slate-800">{m.bfQty || 0}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => adjustCount(m.memberId, 'bf', -1)} disabled={(m.bfQty || 0) <= 0} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">-</button>
                                <span className="text-xs font-black text-slate-800">{m.bfQty || 0}</span>
                                <button onClick={() => adjustCount(m.memberId, 'bf', 1)} disabled={(m.bfQty || 0) >= 9} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">+</button>
                              </div>
                            )}
                          </div>

                          {/* Lunch Box */}
                          <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Sun className="w-3.5 h-3.5 text-brand" />
                              <span className="text-[10px] font-black text-slate-400">L</span>
                            </div>
                            {lunchLocked ? (
                              <span className="text-xs font-black text-slate-800">{m.lunchQty || 0}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => adjustCount(m.memberId, 'lunch', -1)} disabled={(m.lunchQty || 0) <= 0} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">-</button>
                                <span className="text-xs font-black text-slate-800">{m.lunchQty || 0}</span>
                                <button onClick={() => adjustCount(m.memberId, 'lunch', 1)} disabled={(m.lunchQty || 0) >= 9} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">+</button>
                              </div>
                            )}
                          </div>

                          {/* Dinner Box */}
                          <div className="border border-slate-100 rounded-xl p-2 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Moon className="w-3.5 h-3.5 text-brand" />
                              <span className="text-[10px] font-black text-slate-400">D</span>
                            </div>
                            {dinnerLocked ? (
                              <span className="text-xs font-black text-slate-800">{m.dinnerQty || 0}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button onClick={() => adjustCount(m.memberId, 'dinner', -1)} disabled={(m.dinnerQty || 0) <= 0} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">-</button>
                                <span className="text-xs font-black text-slate-800">{m.dinnerQty || 0}</span>
                                <button onClick={() => adjustCount(m.memberId, 'dinner', 1)} disabled={(m.dinnerQty || 0) >= 9} className="w-4 h-4 bg-slate-200 text-slate-700 text-[10px] font-bold rounded flex items-center justify-center">+</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

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
                  className="w-full py-2.5 border border-red-200 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                >
                  🚫 Cancel Whole Batch Orders
                </button>
              )}
            </div>
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
                      <><Clock className="w-3 h-3 animate-pulse" /> Confirm Receipt</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Save Bar ── */}
      {!loading && !isHoliday && hasChanges() && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-3 px-4 flex justify-between items-center shadow-[0_-6px_20px_rgba(0,0,0,0.08)] z-[100] animate-slide-up">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">Get your food cooked</span>
              <span className="text-[10px] font-semibold text-slate-500">Save your custom meal quantity</span>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand hover:bg-brand-dark text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Orders</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
