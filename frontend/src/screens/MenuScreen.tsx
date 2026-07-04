import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Sun, Moon } from 'lucide-react';

interface MenuItem {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  tagline?: string;
}

export default function MenuScreen() {
  const navigate = useNavigate();

  const weeklyMenu: MenuItem[] = [
    {
      day: "Sunday",
      breakfast: "KITCHEN CLOSED",
      lunch: "VEG/NON-VEG SPECIAL MEALS",
      dinner: "KITCHEN CLOSED",
      tagline: "Grand traditional Sunday feast by partner Mother Chefs."
    },
    {
      day: "Monday",
      breakfast: "IDIYAPPAM WITH COCONUT MILK",
      lunch: "VARIETY RICE WITH PORIYAL",
      dinner: "PANIYARAM WITH CHUTNEY",
      tagline: "Comforting homestyle selection to start the work week."
    },
    {
      day: "Tuesday",
      breakfast: "IDLY WITH KADALA CURRY",
      lunch: "VEG/NON VEG MEALS",
      dinner: "VEGGIES DOSA WITH SAMBAR AND CHUTNEY",
      tagline: "Healthy South-Indian variety pairing."
    },
    {
      day: "Wednesday",
      breakfast: "MIXED PROTEIN SALAD",
      lunch: "VEG/CHICKEN BIRYANI",
      dinner: "MINI PODI IDLY WITH CHUTNEY",
      tagline: "Midweek feast with aromatic long-grain Dum Biryani."
    },
    {
      day: "Thursday",
      breakfast: "FRUIT SALAD",
      lunch: "MINI MEALS",
      dinner: "RAGI ROTTI WITH CHUTNEY",
      tagline: "Wholesome, low-glycemic, gut-friendly options."
    },
    {
      day: "Friday",
      breakfast: "GHEE PODI THATTU IDLY",
      lunch: "GHEE RICE WITH CHICKEN CURRY",
      dinner: "CHAPATHI WITH CURRY",
      tagline: "Celebrate Friday with aromatic rich chicken curry."
    },
    {
      day: "Saturday",
      breakfast: "VEG/NON-VEG SANDWICH",
      lunch: "VEG/EGG BIRYANI WITH RAITHA",
      dinner: "PAROTTA WITH GRAVY",
      tagline: "Weekend special egg biryani cooked using traditional hand-ground spices."
    }
  ];

  const todayNum = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const daysShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayNum);
  const activeMenu = weeklyMenu[selectedDayIndex];

  return (
    <div className="p-4 pb-14 space-y-5 overflow-y-auto h-full flex flex-col bg-[#f8fafc]">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Weekly Lineup</h1>
        <p className="text-[11px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">
          Check out our partner mother chefs' authentic menu schedule
        </p>
      </div>

      {/* Day Selector Row matching screenshot */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
        {weeklyMenu.map((m, idx) => {
          const isSelected = selectedDayIndex === idx;
          const isToday = todayNum === idx;
          return (
            <button
              key={m.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-shrink-0 min-w-[72px] px-3 py-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand border-brand text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className={`text-[9px] font-black uppercase tracking-wider ${
                isSelected ? 'text-white/80' : 'text-slate-400'
              }`}>
                {isToday ? "TODAY ★" : daysShort[idx]}
              </div>
              <div className={`text-[12px] font-black mt-1 ${
                isSelected ? 'text-white' : 'text-slate-800'
              }`}>
                {daysFull[idx]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Details Card matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4 space-y-4 shrink-0">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          {activeMenu.day.toUpperCase()}'S SPECIAL MENU
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
                {activeMenu.breakfast}
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
                {activeMenu.lunch}
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
                {activeMenu.dinner}
              </span>
            </div>
          </div>
        </div>

        {/* Big Orange Button matching screenshot */}
        <button
          onClick={() => navigate('/user/dashboard')}
          className="w-full h-11 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xs transition-colors cursor-pointer"
        >
          ORDER THIS TODAY
        </button>
      </div>

      {/* Full Sheet View matching screenshot */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4 flex-1 flex flex-col overflow-hidden min-h-[300px]">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 shrink-0">
          📅 Full Week Lineup Sheet
        </h3>

        <div className="flex-1 overflow-auto mt-3">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-wider w-[15%]">Day</th>
                <th className="py-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-wider w-[28%]">Breakfast</th>
                <th className="py-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-wider w-[29%]">Lunch (Main)</th>
                <th className="py-2 px-1 text-[9px] font-black text-slate-400 uppercase tracking-wider w-[28%]">Dinner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeklyMenu.map((m, idx) => (
                <tr
                  key={m.day}
                  className={`hover:bg-slate-50/50 transition ${idx === todayNum ? 'bg-brand/5' : ''}`}
                >
                  <td className="py-3 px-1 text-xs font-extrabold text-slate-800">
                    {m.day} {idx === todayNum && <span className="text-brand ml-0.5">★</span>}
                  </td>
                  <td className="py-3 px-1 text-[11px] text-slate-600 font-semibold">{m.breakfast}</td>
                  <td className="py-3 px-1 text-[11px] text-slate-600 font-semibold">{m.lunch}</td>
                  <td className="py-3 px-1 text-[11px] text-slate-600 font-semibold">{m.dinner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
