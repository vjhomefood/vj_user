import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Sun, Moon } from 'lucide-react';
import api from '../services/api';

interface DailyMenuData {
  breakfast?: { name: string; price?: number };
  lunch?: { name: string; price?: number };
  dinner?: { name: string; price?: number };
}

export default function MenuScreen() {
  const navigate = useNavigate();

  // Date helpers matching HomeScreen
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

  const [selectedDate, setSelectedDate] = useState<string>(getDefaultDate());
  const [menus, setMenus] = useState<Record<string, DailyMenuData>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        const [todayRes, tomorrowRes] = await Promise.all([
          api.get(`/menu/${todayStr}`).catch(() => ({ data: null })),
          api.get(`/menu/${tomorrowStr}`).catch(() => ({ data: null }))
        ]);
        
        setMenus({
          [todayStr]: todayRes.data || {},
          [tomorrowStr]: tomorrowRes.data || {}
        });
      } catch (err) {
        console.error('Failed to fetch menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, [todayStr, tomorrowStr]);

  const activeMenu = menus[selectedDate] || {};

  const getMealName = (meal: any) => {
    return meal?.name?.trim() || 'Menu will be provided soon';
  };

  const todayNum = new Date(todayStr + 'T00:00:00').getDay();
  const tomorrowNum = (todayNum + 1) % 7;
  const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Only two tabs: Today and Tomorrow
  const tabs = [
    { label: 'TODAY', date: todayStr, dayName: daysFull[todayNum] },
    { label: 'TOMORROW', date: tomorrowStr, dayName: daysFull[tomorrowNum] },
  ];

  return (
    <div className="p-4 pb-14 space-y-5 overflow-y-auto h-full flex flex-col bg-[#f8fafc]">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Weekly Lineup</h1>
        <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
          Check out our partner mother chefs' authentic menu schedule
        </p>
      </div>

      {/* Day Tabs — Today & Tomorrow only */}
      <div className="flex gap-3 shrink-0">
        {tabs.map((tab) => {
          const isSelected = selectedDate === tab.date;
          return (
            <button
              key={tab.label}
              onClick={() => setSelectedDate(tab.date)}
              className={`flex-1 py-3 rounded-2xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand border-brand text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`text-[9px] font-black uppercase tracking-wider ${
                isSelected ? 'text-white/80' : 'text-slate-400'
              }`}>
                {tab.label}
              </div>
              <div className={`text-sm font-black mt-0.5 ${
                isSelected ? 'text-white' : 'text-slate-800'
              }`}>
                {tab.dayName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Menu Card */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading menu…</span>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4 space-y-4 shrink-0">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            {selectedDate === todayStr ? 'TODAY' : 'TOMORROW'}'S SPECIAL MENU
          </h3>

          <div className="space-y-3">
            {/* Breakfast */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest block">Breakfast</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                  {getMealName(activeMenu.breakfast)}
                </span>
              </div>
            </div>

            {/* Lunch */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-brand uppercase tracking-widest block">Lunch (Main Special)</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                  {getMealName(activeMenu.lunch)}
                </span>
              </div>
            </div>

            {/* Dinner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block">Dinner</span>
                <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                  {getMealName(activeMenu.dinner)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/user/dashboard')}
            className="w-full h-11 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xs transition-colors cursor-pointer"
          >
            ORDER THIS TODAY
          </button>
        </div>
      )}
    </div>
  );
}
