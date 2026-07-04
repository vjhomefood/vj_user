import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useTransform } from 'motion/react';
import { Clock } from 'lucide-react';
import SteamEffect from './SteamEffect';

type MealType = 'breakfast' | 'lunch' | 'dinner';
const CATEGORY_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner'];

const MEALS: Record<MealType, {
  title: string; tagline: string; image: string;
  delivery: string; cancel: string; items: string[];
}> = {
  breakfast: {
    title: 'Breakfast', tagline: 'Start your day with warmth & tradition',
    image: '/VJ WEBSITE BREAKFAST.jpg',
    delivery: '7:00 AM', cancel: '',
    items: ['Idiyappam with Coconut Milk', 'Idly with Kadala Curry', 'Mixed Protein Salad', 'Fruit Salad', 'Ghee Podi Thattu Idly', 'Veg/Non-Veg Sandwich'],
  },
  lunch: {
    title: 'Lunch', tagline: 'Heartfelt midday nourishment',
    image: '/VJ WEBSITE LUNCH .avif',
    delivery: '12:00 PM', cancel: '',
    items: ['Variety Rice with Poriyal', 'Veg/Non-Veg Meals', 'Veg/Chicken Biryani', 'Mini Meals', 'Ghee Rice with Chicken Curry', 'Veg/Egg Biryani with Raitha', 'Veg/Non-Veg Special Meals'],
  },
  dinner: {
    title: 'Dinner', tagline: 'A wholesome close to your day',
    image: '/VJ WEBSITE DINNER .jpg',
    delivery: '8:00 PM', cancel: '',
    items: ['Paniyaram with Chutney', 'Veggies Dosa with Sambar & Chutney', 'Mini Podi Idly with Chutney', 'Ragi Rotti with Chutney', 'Chapathi with Curry', 'Parotta with Gravy'],
  },
};

interface Props {
  scrollProgress?: any;
  onMealChange?: (meal: MealType) => void;
}

// ─── MOBILE-ONLY STATIC LAYOUT ───────────────────────────────────────────────
function MealShowcaseMobile({ onMealChange }: { onMealChange?: (meal: MealType) => void }) {
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');

  const handleTab = (meal: MealType) => {
    setActiveMeal(meal);
    onMealChange?.(meal);
  };

  const activeMealData = MEALS[activeMeal];

  return (
    <section id="daily-menu" className="relative z-40 bg-[#FDFBF7] py-12 px-5">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="text-[9px] font-bold tracking-[0.5em] uppercase block text-heritage-accent mb-2">
          daily menu
        </span>
        <h2 className="text-3xl font-serif font-normal tracking-tighter italic leading-[1.1] text-heritage-dark">
          Three Fresh Meals, <span className="text-heritage-accent underline decoration-heritage-accent/20 underline-offset-4">Every Day.</span>
        </h2>
        <p className="text-sm italic font-light mt-2 text-heritage-dark/60 leading-relaxed">
          Handcrafted Tamil cuisine delivered with precision and care.
        </p>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-3 mb-6">
        {CATEGORY_ORDER.map((meal) => (
          <button
            key={meal}
            onClick={() => handleTab(meal)}
            className={`relative px-5 py-2 rounded-full text-sm font-serif italic tracking-wide transition-all duration-300 border ${
              activeMeal === meal
                ? 'bg-heritage-accent text-white border-heritage-accent shadow-md'
                : 'bg-white text-heritage-dark/50 border-heritage-dark/10'
            }`}
          >
            {MEALS[meal].title}
          </button>
        ))}
      </div>

      {/* Static Meal Image */}
      <div className="flex justify-center mb-6">
        <div className="w-[220px] h-[220px] rounded-full overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] bg-white flex-shrink-0">
          <img
            key={activeMeal}
            src={activeMealData.image}
            alt={activeMealData.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Meal Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMeal}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        >
          {/* Title + Tagline */}
          <div className="text-center mb-4">
            <h3 className="text-4xl font-serif italic tracking-tighter leading-none text-heritage-dark mb-1">
              {activeMealData.title}
            </h3>
            <p className="text-sm italic font-light text-heritage-dark/60">
              {activeMealData.tagline}
            </p>
          </div>

          {/* Delivery Badge */}
          <div className="flex justify-center mb-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-heritage-accent/10 bg-heritage-accent/5 text-heritage-accent">
              <Clock size={11} className="shrink-0 animate-pulse" />
              <span className="text-[8.5px] font-semibold uppercase tracking-wider whitespace-nowrap">
                Delivery: {activeMealData.delivery}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-[1px] bg-heritage-dark/10 mb-4" />

          {/* Daily Selection Label */}
          <span className="text-[9px] font-bold uppercase tracking-[0.5em] block text-heritage-accent mb-3">
            Daily Selection
          </span>

          {/* Menu Items */}
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
            {activeMealData.items.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-heritage-accent/40" />
                <span className="text-sm font-serif italic text-heritage-dark/70">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── DESKTOP SCROLL-DRIVEN LAYOUT (untouched) ────────────────────────────────
function MealShowcaseDesktop({ scrollProgress, onMealChange }: Props) {
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast');
  const activeMealRef = useRef<MealType>('breakfast');
  const [[direction], setDirectionState] = useState<[number]>([1]);
  const containerRef = useRef<HTMLElement>(null);

  const categories: { key: MealType; label: string }[] = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
  ];

  const handleCategoryClick = (meal: MealType) => {
    if (meal !== activeMealRef.current) {
      const curIdx = CATEGORY_ORDER.indexOf(meal);
      const prevIdx = CATEGORY_ORDER.indexOf(activeMealRef.current);
      const newDir = curIdx > prevIdx ? 1 : -1;
      setDirectionState([newDir]);
      setActiveMeal(meal);
      onMealChange?.(meal);
    }
  };

  const handleCategoryClickRef = useRef(handleCategoryClick);
  useEffect(() => {
    handleCategoryClickRef.current = handleCategoryClick;
  }, [handleCategoryClick]);

  const scrollValue = scrollProgress || { onChange: () => {} };

  const sectionTitleY = 0;
  const sectionTaglineY = 0;
  const sectionSmallTitleY = 0;
  const sectionTabsY = 0;

  const mealTitleX = 0;
  const mealTaglineX = 0;
  const mealInfoX = 0;
  const mealItemsX = 0;

  const mealTitleOpacity = 1;
  const mealTaglineOpacity = 1;
  const mealInfoOpacity = 1;
  const mealItemsOpacity = 1;

  const containerOpacity = 1;
  const contentVisibleTransform = 1;

  useEffect(() => {
    activeMealRef.current = activeMeal;
  }, [activeMeal]);

  const activeMealData = MEALS[activeMeal];

  return (
    <section
      ref={containerRef}
      id="daily-menu"
      className="relative z-40 bg-[#FDFBF7] py-24 md:py-32 px-6 md:px-8 overflow-hidden"
    >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
            }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute top-10 -left-40 w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 bg-heritage-accent/20"
          />
        </div>

        <motion.div
          style={{ opacity: containerOpacity }}
          className="max-w-6xl mx-auto relative z-10 w-full"
        >
          <div className="text-center mb-6 md:mb-10">
            <div className="overflow-hidden mb-2">
              <motion.div style={{ y: sectionSmallTitleY }}>
                <span className="text-[9px] font-bold tracking-[0.5em] uppercase block text-heritage-accent">daily menu</span>
              </motion.div>
            </div>

            <div className="overflow-hidden mb-4">
              <motion.h2
                style={{ y: sectionTitleY }}
                className="text-2xl sm:text-4xl md:text-6xl font-serif font-normal tracking-tighter italic leading-[1.1] section-title text-center text-heritage-dark"
              >
                Three Fresh Meals, <span className="text-heritage-accent underline decoration-heritage-accent/20 underline-offset-4">Every Day.</span>
              </motion.h2>
            </div>

            <div className="overflow-hidden">
              <motion.p
                style={{ y: sectionTaglineY }}
                className="text-sm sm:text-lg italic font-light max-w-xl mx-auto text-center text-heritage-dark/60 leading-relaxed"
              >
                Handcrafted Tamil cuisine delivered with precision and care.
              </motion.p>
            </div>
          </div>

          <div className="overflow-hidden mb-6 md:mb-10">
            <motion.div
              style={{ y: sectionTabsY }}
              className="flex justify-center gap-4 sm:gap-6 md:gap-10 border-b border-heritage-dark/5"
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryClick(cat.key)}
                  className={`meal-tab relative text-sm sm:text-lg md:text-2xl font-serif italic tracking-wide pb-2 transition-colors duration-300 cursor-pointer bg-transparent border-0 outline-none ${
                    activeMeal === cat.key
                    ? 'text-heritage-dark font-bold'
                    : 'text-heritage-dark/30 hover:text-heritage-dark/60'
                  }`}
                >
                  {cat.label}
                  {activeMeal === cat.key && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-[2px] bg-heritage-accent" />
                  )}
                </button>
              ))}
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-center">
            <div className="relative flex items-center justify-center order-1 lg:order-2 h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px]" style={{ perspective: "2000px" }}>
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={activeMeal}
                  custom={direction}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? -600 : 1200,
                      y: direction > 0 ? 1000 : -800,
                      rotate: direction > 0 ? -45 : 45,
                      scale: 0.6,
                      opacity: 0,
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      y: 0,
                      rotate: 0,
                      scale: 1,
                      opacity: 1,
                    },
                    exit: (direction: number) => ({
                      zIndex: 0,
                      x: direction > 0 ? 1200 : -600,
                      y: direction > 0 ? -800 : 1000,
                      rotate: direction > 0 ? 45 : -45,
                      scale: 0.6,
                      opacity: 0,
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { duration: 1.5, ease: [0.19, 1, 0.22, 1] },
                    y: { duration: 1.5, ease: [0.19, 1, 0.22, 1] },
                    rotate: { duration: 1.5, ease: [0.19, 1, 0.22, 1] },
                    scale: { duration: 1.5, ease: [0.19, 1, 0.22, 1] },
                    opacity: { duration: 0.8 }
                  }}
                  className="absolute w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] md:w-[380px] md:h-[380px] lg:w-[420px] lg:h-[420px]"
                >
                  <div className="relative w-full h-full">
                    <SteamEffect />
                    <div className="w-full h-full rounded-full border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden bg-white">
                      <img
                        src={activeMealData.image}
                        alt={activeMealData.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="order-2 lg:order-1 flex flex-col justify-center min-h-[300px] lg:min-h-[400px] py-4 lg:py-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMeal}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={{
                    initial: { opacity: 0, x: -50 },
                    animate: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 0.15,
                        duration: 0.8,
                        ease: [0.33, 1, 0.68, 1]
                      }
                    },
                    exit: {
                      opacity: 0,
                      x: 50,
                      transition: { duration: 0.3 }
                    }
                  }}
                >
                  <div className="mb-4 lg:mb-6">
                    <div className="overflow-hidden mb-2">
                      <motion.h3
                        style={{ x: mealTitleX, opacity: mealTitleOpacity }}
                        variants={{
                          initial: { y: "100%" },
                          animate: { y: 0, transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } }
                        }}
                        className="text-3xl sm:text-5xl md:text-7xl font-serif italic tracking-tighter leading-none text-heritage-dark"
                      >
                        {activeMealData.title}
                      </motion.h3>
                    </div>
                    <div className="overflow-hidden">
                      <motion.p
                        style={{ x: mealTaglineX, opacity: mealTaglineOpacity }}
                        variants={{
                          initial: { y: "100%" },
                          animate: { y: 0, transition: { duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] } }
                        }}
                        className="text-sm sm:text-lg italic font-light text-heritage-dark/60"
                      >
                        {activeMealData.tagline}
                      </motion.p>
                    </div>
                  </div>

                  <motion.div
                    style={{ x: mealInfoX, opacity: mealInfoOpacity }}
                    className="flex flex-wrap gap-2 md:gap-3 mb-4 md:mb-8"
                  >
                    {/* Desktop delivery badge */}
                    <div className="hidden sm:block overflow-hidden">
                      <motion.div
                        variants={{
                          initial: { y: "100%" },
                          animate: { y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0.33, 1, 0.68, 1] } }
                        }}
                        className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-full border border-heritage-accent/10 bg-heritage-accent/5 text-heritage-accent"
                      >
                        <Clock size={12} className="md:w-3.5 md:h-3.5" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Delivery: {activeMealData.delivery}</span>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    style={{ scaleX: contentVisibleTransform }}
                    className="w-full h-[1px] mb-4 md:mb-8 bg-heritage-dark/10 origin-left"
                  />

                  <div className="overflow-hidden mb-4 md:mb-6">
                    <motion.span
                      style={{ x: mealInfoX, opacity: mealInfoOpacity }}
                      variants={{
                        initial: { y: "100%" },
                        animate: { y: 0, transition: { duration: 0.8, delay: 0.28, ease: [0.33, 1, 0.68, 1] } }
                      }}
                      className="text-[9px] font-bold uppercase tracking-[0.5em] block text-heritage-accent"
                    >
                      Daily Selection
                    </motion.span>
                  </div>

                  <motion.ul
                    style={{ x: mealItemsX, opacity: mealItemsOpacity }}
                    className="grid grid-cols-2 gap-x-4 gap-y-2 md:gap-x-10 md:gap-y-4"
                  >
                    {activeMealData.items.map((item, idx) => (
                      <div key={item} className="overflow-hidden">
                        <motion.li
                          variants={{
                            initial: { y: "110%" },
                            animate: { y: 0, transition: { duration: 0.6, delay: 0.3 + (idx * 0.05), ease: [0.33, 1, 0.68, 1] } }
                          }}
                          className="group flex items-center gap-1.5 md:gap-3"
                        >
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-heritage-accent/30 group-hover:bg-heritage-accent transition-colors duration-300" />
                          <span className="text-sm sm:text-base md:text-xl font-serif italic text-heritage-dark/70 group-hover:text-heritage-dark transition-colors duration-300">
                            {item}
                          </span>
                        </motion.li>
                      </div>
                    ))}
                  </motion.ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
    </section>
  );
}

// ─── ROOT EXPORT: picks mobile vs desktop based on screen width ───────────────
export default function MealShowcase({ scrollProgress, onMealChange }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile) {
    return <MealShowcaseMobile onMealChange={onMealChange} />;
  }

  return <MealShowcaseDesktop scrollProgress={scrollProgress} onMealChange={onMealChange} />;
}
