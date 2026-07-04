import React from "react";
import { motion } from "motion/react";
import { Leaf, Info } from "lucide-react";

const weeklyMenu = [
  {
    day: "MONDAY",
    breakfast: "IDIYAPPAM WITH COCONUT MILK",
    lunch: "VARIETY RICE WITH PORIYAL",
    dinner: "PANIYARAM WITH CHUTNEY"
  },
  {
    day: "TUESDAY",
    breakfast: "IDLY WITH KADALA CURRY",
    lunch: "VEG/NON VEG MEALS",
    dinner: "VEGGIES DOSA WITH SAMBAR AND CHUTNEY"
  },
  {
    day: "WEDNESDAY",
    breakfast: "MIXED PROTEIN SALAD",
    lunch: "VEG/CHICKEN BIRYANI",
    dinner: "MINI PODI IDLY WITH CHUTNEY"
  },
  {
    day: "THURSDAY",
    breakfast: "FRUIT SALAD",
    lunch: "MINI MEALS",
    dinner: "RAGI ROTTI WITH CHUTNEY"
  },
  {
    day: "FRIDAY",
    breakfast: "GHEE PODI THATTU IDLY",
    lunch: "GHEE RICE WITH CHICKEN CURRY",
    dinner: "CHAPATHI WITH CURRY"
  },
  {
    day: "SATURDAY",
    breakfast: "VEG/NON-VEG SANDWICH",
    lunch: "VEG/EGG BIRYANI WITH RAITHA",
    dinner: "PAROTTA WITH GRAVY"
  },
  {
    day: "SUNDAY",
    breakfast: "KITCHEN CLOSED",
    lunch: "VEG/NON-VEG SPECIAL MEALS",
    dinner: "KITCHEN CLOSED"
  }
];

export default function WeeklyMealPlan() {
  return (
    <section 
      id="weekly-meal-plan" 
      className="relative py-24 md:py-32 flex flex-col items-center justify-center bg-transparent overflow-hidden px-6"
    >
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-heritage-accent mb-6 block">
            WEEKLY EXPERIENCE
          </span>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#3E362E] leading-[1.1] tracking-tight mb-8">
            VJ Weekly <span className="font-cormorant italic font-light text-heritage-accent select-none lowercase">Meal Plan</span>
          </h2>
          
          <p className="text-xs md:text-sm font-sans tracking-[0.16em] leading-relaxed text-heritage-dark/60 uppercase mx-auto max-w-xl">
            Savor carefully designed daily options curated for perfect balance, native taste, and peak nutrition.
          </p>
        </div>

        {/* Beautiful Orange-Themed Inline Meal Plan Container */}
        <div className="w-full bg-[#FFFBF7] border border-heritage-accent/20 rounded-3xl p-6 md:p-8 shadow-2xl shadow-heritage-accent/5 overflow-hidden text-left">
          {/* Header section matching VJ Weekly design */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-heritage-accent/15 gap-4 mb-6">
            <div>
              <span className="font-cormorant italic text-2xl text-heritage-accent block leading-none">Healthy &amp; Wholesome</span>
              <h3 className="font-serif text-3xl text-[#3E362E] tracking-tight leading-tight uppercase font-extrabold">Weekly Lineup</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-heritage-accent/10 text-heritage-accent border border-heritage-accent/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <Leaf size={12} className="fill-heritage-accent shrink-0" />
                Pure Veg Available
              </span>
            </div>
          </div>

          {/* Grid content */}
          <div>
            {/* Desktop and Tablet grid (Separate tile layout in orange theme) */}
            <div className="hidden md:grid grid-cols-4 gap-3.5 bg-transparent auto-rows-fr">
              {/* Table Column Headers - Orange Accent Tiles */}
              <div className="bg-heritage-accent text-white font-sans font-black text-[12px] tracking-widest uppercase py-4 px-3 text-center rounded-xl shadow-md border border-heritage-accent/25 flex items-center justify-center">
                Day
              </div>
              <div className="bg-[#3E362E] text-white font-sans font-black text-[12px] tracking-widest uppercase py-4 px-3 text-center rounded-xl shadow-md flex items-center justify-center">
                Breakfast
              </div>
              <div className="bg-[#3E362E] text-white font-sans font-black text-[12px] tracking-widest uppercase py-4 px-3 text-center rounded-xl shadow-md flex items-center justify-center">
                Lunch
              </div>
              <div className="bg-[#3E362E] text-white font-sans font-black text-[12px] tracking-widest uppercase py-4 px-3 text-center rounded-xl shadow-md flex items-center justify-center">
                Dinner
              </div>

              {/* Weekly menu rows */}
              {weeklyMenu.map((m) => (
                <React.Fragment key={m.day}>
                  {/* Day cell (Orange theme tile) */}
                  <div className="bg-heritage-accent text-white font-sans font-extrabold text-[11px] tracking-wider uppercase py-4 px-2 text-center rounded-xl shadow-sm border border-heritage-accent/15 flex items-center justify-center min-h-[64px] transition-transform duration-200 hover:scale-[1.03]">
                    {m.day}
                  </div>

                  {/* Breakfast Column */}
                  {m.breakfast === "KITCHEN CLOSED" ? (
                    <div className="bg-red-50/20 border border-red-200/40 text-red-600 font-sans font-black text-[11px] uppercase p-3.5 rounded-xl flex items-center justify-center text-center min-h-[64px]">
                      {m.breakfast}
                    </div>
                  ) : (
                    <div className="bg-[#FFF9F6] border border-heritage-accent/15 hover:border-heritage-accent/35 text-[#3E362E] font-sans text-[11px] tracking-wide font-extrabold uppercase p-3.5 rounded-xl shadow-sm flex items-center justify-center text-center min-h-[64px] transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFF5F0]">
                      {m.breakfast}
                    </div>
                  )}

                  {/* Lunch Column */}
                  {m.lunch === "KITCHEN CLOSED" ? (
                    <div className="bg-red-50/20 border border-red-200/40 text-red-600 font-sans font-black text-[11px] uppercase p-3.5 rounded-xl flex items-center justify-center text-center min-h-[64px]">
                      {m.lunch}
                    </div>
                  ) : (
                    <div className="bg-[#FFF9F6] border border-heritage-accent/15 hover:border-heritage-accent/35 text-[#3E362E] font-sans text-[11px] tracking-wide font-extrabold uppercase p-3.5 rounded-xl shadow-sm flex items-center justify-center text-center min-h-[64px] transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFF5F0]">
                      {m.lunch}
                    </div>
                  )}

                  {/* Dinner Column */}
                  {m.dinner === "KITCHEN CLOSED" ? (
                    <div className="bg-red-50/20 border border-red-200/40 text-red-600 font-sans font-black text-[11px] uppercase p-3.5 rounded-xl flex items-center justify-center text-center min-h-[64px]">
                      {m.dinner}
                    </div>
                  ) : (
                    <div className="bg-[#FFF9F6] border border-heritage-accent/15 hover:border-heritage-accent/35 text-[#3E362E] font-sans text-[11px] tracking-wide font-extrabold uppercase p-3.5 rounded-xl shadow-sm flex items-center justify-center text-center min-h-[64px] transition-all duration-200 hover:scale-[1.02] hover:bg-[#FFF5F0]">
                      {m.dinner}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile view (Elegant cards with orange theme headers) */}
            <div className="md:hidden flex flex-col gap-4">
              {weeklyMenu.map((m) => (
                <div 
                  key={m.day}
                  className="rounded-2xl border border-heritage-accent/20 bg-white overflow-hidden shadow-sm relative transition-all duration-300 hover:shadow-md"
                >
                  {/* Top Day Header Tile (Orange theme) */}
                  <div className="bg-heritage-accent text-white px-4 py-3 font-sans font-black text-xs tracking-widest uppercase flex items-center justify-between shadow-xs">
                    <span>{m.day}</span>
                  </div>

                  {/* Meal list for that day */}
                  <div className="p-4 flex flex-col gap-3 bg-[#FFF9F6]/10">
                    {/* Breakfast Row */}
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="text-heritage-dark/40 font-bold uppercase tracking-wider text-[10px] shrink-0">Breakfast</span>
                      <span className={`text-right font-extrabold text-[11px] uppercase max-w-[70%] ${m.breakfast === "KITCHEN CLOSED" ? "text-red-500 font-black" : "text-[#3E362E]"}`}>
                        {m.breakfast}
                      </span>
                    </div>

                    <div className="h-[1px] bg-heritage-accent/10" />

                    {/* Lunch Row */}
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="text-heritage-dark/40 font-bold uppercase tracking-wider text-[10px] shrink-0">Lunch</span>
                      <span className="text-right font-extrabold text-[#3E362E] text-[11px] uppercase max-w-[70%]">
                        {m.lunch}
                      </span>
                    </div>

                    <div className="h-[1px] bg-heritage-accent/10" />

                    {/* Dinner Row */}
                    <div className="flex items-center justify-between text-xs gap-3">
                      <span className="text-heritage-dark/40 font-bold uppercase tracking-wider text-[10px] shrink-0">Dinner</span>
                      <span className={`text-right font-extrabold text-[11px] uppercase max-w-[70%] ${m.dinner === "KITCHEN CLOSED" ? "text-red-500 font-black" : "text-[#3E362E]"}`}>
                        {m.dinner}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom info banner matching the VJ design */}
          <div className="mt-6 pt-5 border-t border-heritage-accent/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="px-4 py-1.5 bg-heritage-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-block mx-auto sm:mx-0">
                VJ HOMEFOODS
              </div>
            </div>
            
            <div className="font-sans font-black text-heritage-dark text-sm tracking-wider uppercase">
              STARTS <span className="text-heritage-accent text-lg font-black">RS 3500/MONTH</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
