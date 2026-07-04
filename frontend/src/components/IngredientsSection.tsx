import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "motion/react";
import { Sparkles, ShieldCheck, Wallet, Truck, X, Leaf, Info } from "lucide-react";

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

const features = [
  {
    icon: Sparkles,
    title: "Fresh Daily Preparation",
    description: "Every meal is prepared from scratch every single morning, ensuring maximum flavor and nutrition."
  },
  {
    icon: ShieldCheck,
    title: "Hygienic Kitchen Standards",
    description: "Our kitchen follows strict safety protocols and sanitization standards that exceed industry norms."
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    description: "Wholesome, home-cooked food shouldn't be a luxury. We keep our prices honest and accessible."
  },
  {
    icon: Truck,
    title: "Timely Delivery",
    description: "Hot meals delivered precisely when you need them. We value your hunger as much as your time."
  }
];

export default function IngredientsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 18,
    restDelta: 0.001
  });

  const leftX = useTransform(smoothProgress, [0, 0.45, 0.55, 1], ["-80vw", "0%", "0%", "-80vw"]);
  const leftRotate = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [-15, 12, 12, -15]);
  const leftOpacity = useTransform(smoothProgress, [0.05, 0.35, 0.65, 0.95], [0, 1, 1, 0]);

  const rightX = useTransform(smoothProgress, [0, 0.45, 0.55, 1], ["80vw", "0%", "0%", "80vw"]);
  const rightRotate = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [15, -12, -12, 15]);
  const rightOpacity = useTransform(smoothProgress, [0.05, 0.35, 0.65, 0.95], [0, 1, 1, 0]);

  const mobileLeftY = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [60, 0, 0, -60]);
  const mobileLeftRotate = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [-5, 4, 4, -5]);
  const mobileLeftScale = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [0.93, 1, 1, 0.93]);

  const mobileRightY = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [90, 0, 0, -90]);
  const mobileRightRotate = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [5, -4, -4, 5]);
  const mobileRightScale = useTransform(smoothProgress, [0, 0.45, 0.55, 1], [0.88, 1, 1, 0.88]);

  return (
    <motion.section 
      ref={sectionRef}
      id="promise-section"
      className="relative min-h-screen py-24 md:py-32 flex items-center justify-center bg-transparent overflow-hidden"
    >


      {/* Main Container - Keeps the content in a neat central channel */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 md:px-12 flex flex-col items-center">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-bold tracking-[0.4em] uppercase text-heritage-accent mb-6 block"
          >
            Our Promise
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-serif text-heritage-dark leading-[1.05] tracking-tight mb-8"
          >
            Why Choose <br />
            <span className="font-serif text-heritage-dark">us? Our </span>
            <span className="font-cormorant italic font-light text-heritage-accent select-none lowercase">promise.</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm font-sans tracking-[0.16em] leading-relaxed text-heritage-dark/60 uppercase mx-auto max-w-xl"
          >
            We're not just delivering food; we're bringing the warmth of a home kitchen to your table with uncompromising standards.
          </motion.p>
        </div>

        {/* Features Content (The 4 pillars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 w-full max-w-3xl mx-auto text-left mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
              className="flex gap-4 items-start group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-heritage-accent/10 flex items-center justify-center text-heritage-accent mt-0.5 group-hover:bg-heritage-accent group-hover:text-white transition-all duration-300">
                <f.icon size={15} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-sans font-bold text-[11px] md:text-xs uppercase tracking-[0.2em] text-heritage-dark mb-1.5">{f.title}</h4>
                <p className="text-xs md:text-sm text-heritage-dark/50 leading-relaxed font-sans">{f.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Responsive Mobile Images Stack (Tilted, layered beautifully underneath the central channel) */}
        <div className="grid grid-cols-2 gap-6 mt-16 w-full max-w-xl md:hidden">
          <motion.div 
            style={{ y: mobileLeftY, rotate: mobileLeftRotate, scale: mobileLeftScale }}
            className="aspect-[3/4] rounded-3xl overflow-hidden shadow-xl shadow-heritage-dark/5 relative border border-heritage-dark/5"
          >
            <img 
              src="/VJ WEBSITE SIDE 2.jpg"
              alt="Fresh Preparation"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-heritage-dark/5" />
          </motion.div>

          <motion.div 
            style={{ y: mobileRightY, rotate: mobileRightRotate, scale: mobileRightScale }}
            className="aspect-[3/4] rounded-3xl overflow-hidden shadow-xl shadow-heritage-dark/5 relative border border-heritage-dark/5"
          >
            <img 
              src="/VJ WEBSITE SIDE PHOTO 1.webp"
              alt="Delicious Heritage Meal"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-heritage-dark/5" />
          </motion.div>
        </div>

      </div>

      {/* Floating Animated Left/Right Side Image Reveal panels (Only visible on wide tablet & desktop / `md` and above) */}
      
      {/* Left side image: slides in from left, rotated slightly clockwise, positioned on the edge of the viewport matching the screenshot */}
      <motion.div
        style={{ x: leftX, rotate: leftRotate, y: "-50%" }}
        className="absolute left-[-15%] sm:left-[-11%] xl:left-[-8%] 2xl:left-[-5%] top-1/2 w-[28vw] max-w-[420px] h-[85vh] max-h-[850px] rounded-[4.5rem] overflow-hidden shadow-[0_30px_60px_rgba(10,10,10,0.15)] hidden md:block border border-heritage-dark/5 z-0 pointer-events-none"
      >
        <img 
          src="/VJ WEBSITE SIDE PHOTO 1.webp"
          alt="Fresh Preparation"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-heritage-dark/5" />
      </motion.div>

      {/* Right side image: slides in from right, rotated slightly counter-clockwise, positioned on the edge of the viewport matching the screenshot */}
      <motion.div
        style={{ x: rightX, rotate: rightRotate, y: "-50%" }}
        className="absolute right-[-15%] sm:right-[-11%] xl:right-[-8%] 2xl:left-[-5%] top-1/2 w-[28vw] max-w-[420px] h-[85vh] max-h-[850px] rounded-[4.5rem] overflow-hidden shadow-[0_30px_60px_rgba(10,10,10,0.15)] hidden md:block border border-heritage-dark/5 z-0 pointer-events-none"
      >
        <img 
          src="/VJ WEBSITE SIDE 2.jpg"
          alt="Delicious Heritage Meal"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-heritage-dark/5" />
      </motion.div>

    </motion.section>
  );
}
