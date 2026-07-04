import { useState } from "react";
import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from "motion/react";
import { ArrowRight, Plus } from "lucide-react";

interface HeroProps {
  onReady?: () => void;
  start?: boolean;
  scrollClipPath?: any;
  isScrolled?: boolean;
  scrollProgress?: any;
}

export default function Hero({ onReady, start, scrollClipPath, isScrolled, scrollProgress }: HeroProps) {
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleVideoReady = () => {
    setIsVideoReady(true);
    onReady?.();
  };

  const fallbackProgress = useMotionValue(0);
  const progress = scrollProgress || fallbackProgress;

  // Hero text: fades in at scroll start, exits well before shrink completes (~0.048)
  const textOpacity = useTransform(progress, [0, 0.006, 0.014, 0.028, 0.033], [0, 0, 0.9, 0.9, 0]);
  
  const textY = useTransform(progress, [0, 0.006, 0.014, 0.033], ["105%", "105%", "0%", "-35px"]);

  // Brand logo & slogan: visible at start, fades as scroll begins
  const logoSloganOpacity = useTransform(progress, [0, 0.006, 0.014], [1, 1, 0]);
  const logoSloganY = useTransform(progress, [0, 0.014], ["0px", "-50px"]);

  return (
    <motion.div 
      className="relative h-screen w-full overflow-hidden flex flex-col font-cormorant bg-transparent"
    >
      {/* Background Video with Circular Expansion and Scroll Shrink */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {/* Wrapper for the clip-path video container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Floating Container */}
          <motion.div
            style={{ clipPath: scrollClipPath }}
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={start ? { clipPath: "circle(150% at 50% 50%)" } : { clipPath: "circle(0% at 50% 50%)" }}
            transition={{ 
              duration: 1.8, 
              ease: [0.76, 0, 0.24, 1],
              delay: 0.1 
            }}
            className="absolute inset-0 z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            
            {/* Subtle Border Ring (Visible only when shrinking/scrolled) */}
            <AnimatePresence>
            </AnimatePresence>

            <video
              autoPlay
              loop
              muted
              playsInline
              onLoadedData={handleVideoReady}
              className="w-full h-full object-cover"
            >
              <source src="/VJ HOMEFOOD WEBSITE.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </motion.div>
      </div>

      {/* Spacer for where Nav used to be in Hero layout if needed, but Hero is h-screen flex-col */}
      <div className="h-32 relative z-20" /> 

      {/* Ticker Bar / Peace Put Style Line */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-20 py-4 flex items-center overflow-hidden"
          >
            {/* Animated Borders (Right to Left Reveal) */}
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={start && isVideoReady ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ delay: 2.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 1 }}
              className="absolute top-0 inset-x-0 h-[1px] bg-white/30"
            />
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={start && isVideoReady ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ delay: 2.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{ originX: 1 }}
              className="absolute bottom-0 inset-x-0 h-[1px] bg-white/30"
            />

            {/* Center: Running Ticker Text */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={start && isVideoReady ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="flex-1 overflow-hidden h-6 flex items-center relative"
            >
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ 
                  duration: 35, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="flex whitespace-nowrap gap-12 text-[11px] md:text-[13px] tracking-[0.25em] text-white uppercase font-light"
              >
                <span>Homemade Taste • Hygienic Home-Style Cooking • Flexible Meal Plans • Trusted by 700+ Subscribers • On-Time Delivery • Pure Ingredients • Breakfast • Lunch • Dinner • Hot & Fresh Meals Delivered Daily •</span>
                <span>Homemade Taste • Hygienic Home-Style Cooking • Flexible Meal Plans • Trusted by 700+ Subscribers • On-Time Delivery • Pure Ingredients • Breakfast • Lunch • Dinner • Hot & Fresh Meals Delivered Daily •</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-20 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-6 text-center">
        {/* Brand Logo & Slogan Card displayed on Load */}
        <motion.div
          style={{ 
            opacity: logoSloganOpacity,
            y: logoSloganY,
          }}
          className="relative flex flex-col items-center justify-center select-none pointer-events-none gap-4 md:gap-6 mt-16 md:mt-20"
        >
          {/* Transparent container to remove white bg & border, using multiply to blend out image white background */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={start && isVideoReady ? { scale: 1, opacity: 1 } : { scale: 0.85, opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="flex items-center justify-center w-72 h-72 sm:w-[320px] sm:h-[320px] md:w-[450px] md:h-[450px] relative group"
          >
            <img 
              src="/vj-logo-transparent.png" 
              alt="VJ Home Foods Logo" 
              className="w-full h-full object-contain relative z-10"
            />
          </motion.div>

          {/* Slogan & Info Texts beautifully aligned below the logo */}
          <div className="flex flex-col items-center gap-3 -mt-8 sm:-mt-14 md:-mt-20">
            {/* Slogan */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={start && isVideoReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
              className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-white font-light tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            >
              &ldquo;A taste of home, in every bite&rdquo;
            </motion.p>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={start && isVideoReady ? { width: "100px", opacity: 0.6 } : { width: 0, opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.0 }}
              className="h-[1px] bg-white"
            />

            <motion.span
              initial={{ opacity: 0 }}
              animate={start && isVideoReady ? { opacity: 0.8 } : { opacity: 0 }}
              transition={{ duration: 1.2, delay: 1.2 }}
              className="font-sans text-[9px] sm:text-[11px] tracking-[0.35em] text-white/90 uppercase font-black"
            >
              Hygienic Home-Style Cooking Delivered Daily
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <motion.div
        style={{ opacity: logoSloganOpacity }}
        className="relative z-20 flex flex-col items-center pb-16 select-none pointer-events-none mt-auto"
      >
        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={start && isVideoReady ? { opacity: 0.28 } : { opacity: 0 }}
          transition={{ duration: 1.4, delay: 1.6 }}
          className="flex flex-col items-center gap-2"
        >
          <svg width="26" height="40" viewBox="0 0 26 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="24" height="38" rx="12" stroke="white" strokeWidth="1.5"/>
            <motion.rect
              x="12" y="9" width="2" height="7" rx="1" fill="white"
              animate={{ y: [0, 7, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
          <span className="text-white text-[8px] tracking-[0.35em] uppercase font-light">Scroll</span>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
