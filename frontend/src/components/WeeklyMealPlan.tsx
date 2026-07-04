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
        <div className="w-full bg-[#FFFBF7] border border-heritage-accent/20 rounded-3xl p-6 md:p-10 shadow-2xl shadow-heritage-accent/5 overflow-hidden text-center flex flex-col items-center">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-heritage-accent/15 gap-4 mb-6 w-full text-left">
            <div>
              <span className="font-cormorant italic text-2xl text-heritage-accent block leading-none">Healthy & Wholesome</span>
              <h3 className="font-serif text-3xl text-[#3E362E] tracking-tight leading-tight uppercase font-extrabold">Weekly Lineup</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-heritage-accent/10 text-heritage-accent border border-heritage-accent/20 rounded-full text-xs font-bold uppercase tracking-wider">
                <Leaf size={12} className="fill-heritage-accent shrink-0" />
                Pure Veg Available
              </span>
            </div>
          </div>

          {/* Menu Image Display */}
          <div className="w-full max-w-[500px] bg-white rounded-2xl overflow-hidden border border-slate-200 p-2.5 shadow-md mb-8">
            <img 
              src="/vjhomefoods/assets/weekly_menu.png" 
              alt="VJ Weekly Menu" 
              className="w-full h-auto object-contain"
            />
          </div>
          
          {/* Ordering Guidelines */}
          <div className="w-full max-w-[500px] text-left bg-white border border-heritage-accent/10 rounded-2xl p-6 space-y-3">
            <h4 className="text-base font-extrabold text-[#3E362E] flex items-center gap-2">
              <Info size={16} className="text-heritage-accent" />
              Ordering Guidelines
            </h4>
            <p className="text-[12.5px] text-heritage-dark/80 leading-relaxed font-sans">
              • Standard meal schedule defaults are automatically configured for your batch.<br />
              • Modify meal counts or Veg/Non-Veg preferences on the <strong>Home</strong> tab before session locks.<br />
              • Modification locks are active <strong>4 hours</strong> before each session.
            </p>
          </div>

          {/* Bottom info banner */}
          <div className="mt-8 pt-5 border-t border-heritage-accent/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left w-full">
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
