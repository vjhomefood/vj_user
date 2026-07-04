import { useEffect, useState } from "react";
import { motion, MotionValue } from "motion/react";

interface WhoWeAreForProps {
  contentOpacity: MotionValue<number>;
  titleY: MotionValue<string>;
  leftX: MotionValue<string>;
  rightX: MotionValue<string>;
  leftRotate: MotionValue<string>;
  rightRotate: MotionValue<string>;
  sideOpacity: MotionValue<number>;
}

export default function WhoWeAreFor({
  contentOpacity,
  titleY,
  leftX,
  rightX,
  leftRotate,
  rightRotate,
  sideOpacity
}: WhoWeAreForProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // ─── MOBILE: fully static, no scroll-driven motion ───────────────────────
  if (isMobile) {
    return (
      <div className="relative z-40 overflow-x-hidden w-full bg-[#FDFBF7]">
        <div className="py-16 px-6 flex flex-col items-center">
          {/* Title */}
          <h2 className="text-heritage-dark font-serif text-4xl text-center tracking-tighter leading-[1.1] mb-10">
            Who we are cooking for
          </h2>

          <div className="w-full flex flex-col gap-12">
            {/* Left Card – Residents & Students */}
            <div className="flex flex-col items-center text-center font-serif">
              <span className="text-heritage-dark/40 text-lg leading-tight italic block mb-2">
                A taste of home, in every bite.
              </span>
              <h3 className="text-heritage-dark text-5xl leading-[0.9] tracking-tighter mb-4">
                Residents &amp; Students
              </h3>
              <p className="text-heritage-dark/60 text-sm leading-relaxed max-w-[360px] font-sans mb-5">
                Missing that specific spice mix your mom uses? We use traditional family recipes to ensure you never feel away from home.
              </p>
              <ul className="flex flex-col items-center gap-2 text-heritage-accent font-bold text-[10px] uppercase tracking-[0.25em]">
                <li>Traditional Recipes</li>
                <li>Flexible Meal Planning</li>
                <li>Zero Compromise on Quality</li>
              </ul>
            </div>

            {/* Divider */}
            <div className="w-[1px] h-12 bg-heritage-accent/20 mx-auto" />

            {/* Right Card – Busy Professionals */}
            <div className="flex flex-col items-center text-center font-serif">
              <span className="text-heritage-dark/40 text-lg leading-tight italic block mb-2">
                Focus on your work, we'll handle the kitchen.
              </span>
              <h3 className="text-heritage-dark text-5xl leading-[1.05] tracking-tighter mb-4">
                Busy Professionals
              </h3>
              <p className="text-heritage-dark/60 text-sm leading-relaxed max-w-[360px] font-sans mb-5">
                Long days deserve wholesome endings. Nutritious, home-style meals are ready when you are.
              </p>
              <ul className="flex flex-col items-center gap-2 text-heritage-accent font-bold text-[10px] uppercase tracking-[0.25em]">
                <li>Office Delivery</li>
                <li>Nutritionally Balanced</li>
                <li>Cancellation Flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── DESKTOP: static position in flow, no sticky container ─────────────
  return (
    <div className="relative z-40 overflow-x-hidden w-full">
      <div className="min-h-screen relative w-full flex flex-col justify-center items-center py-12 md:py-16 px-4 md:px-0">
        <motion.div
          style={{ opacity: contentOpacity }}
          className="w-full max-w-[1600px] mx-auto relative flex flex-col items-center"
        >
          <div className="mb-8 md:mb-12 overflow-hidden h-auto md:h-[13vw] md:min-h-[120px] md:max-h-[200px] flex items-end px-4">
            <motion.h2
              style={{ y: titleY }}
              className="text-heritage-dark font-serif text-4xl sm:text-5xl md:text-7xl lg:text-[8vw] whitespace-normal md:whitespace-nowrap text-center tracking-tighter leading-[1.1] pb-2 md:pb-4 pr-0 md:pr-4"
            >
              Who we are cooking for
            </motion.h2>
          </div>

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 md:px-12">
            <div className="flex flex-col items-center md:items-end text-center md:text-right flex-1 font-serif max-w-[480px]">
              <div className="mb-3 w-full">
                <motion.span
                  style={{ x: leftX, opacity: sideOpacity, rotate: leftRotate }}
                  className="text-heritage-dark/40 text-lg md:text-2xl leading-tight italic block origin-right"
                >
                  A taste of home, in every bite.
                </motion.span>
              </div>
              <div className="mb-8 w-full font-serif">
                <motion.h3
                  style={{ x: leftX, opacity: sideOpacity, rotate: leftRotate }}
                  className="text-heritage-dark text-6xl md:text-[6vw] leading-[0.9] tracking-tighter origin-right"
                >
                  Residents &amp; <br className="hidden md:block"/>Students
                </motion.h3>
              </div>
              <div className="mb-10 w-full">
                <motion.p
                  style={{ x: leftX, opacity: sideOpacity, rotate: leftRotate }}
                  className="text-heritage-dark/60 text-sm md:text-lg leading-relaxed max-w-[380px] font-sans ml-auto origin-right"
                >
                  Missing that specific spice mix your mom uses? We use traditional family recipes to ensure you never feel away from home.
                </motion.p>
              </div>
              <div className="w-full">
                <motion.ul
                  style={{ x: leftX, opacity: sideOpacity, rotate: leftRotate }}
                  className="flex flex-col items-center md:items-end gap-2 text-heritage-accent font-bold text-[10px] md:text-xs uppercase tracking-[0.25em] origin-right"
                >
                  <li className="flex items-center gap-3">Traditional Recipes <span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" /></li>
                  <li className="flex items-center gap-3">Flexible Meal Planning <span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" /></li>
                  <li className="flex items-center gap-3">Zero Compromise on Quality <span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" /></li>
                </motion.ul>
              </div>
            </div>

            {/* Spacer exactly sized to the 420px diameter video circle */}
            <div className="hidden md:block w-[420px] h-[420px] flex-shrink-0 order-first md:order-none" />

            <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 font-serif max-w-[480px]">
              <div className="mb-3 w-full">
                <motion.span
                  style={{ x: rightX, opacity: sideOpacity, rotate: rightRotate }}
                  className="text-heritage-dark/40 text-lg md:text-2xl leading-tight italic block origin-left"
                >
                  Focus on your work, we'll handle the kitchen.
                </motion.span>
              </div>
              <div className="mb-8 w-full font-serif">
                <motion.h3
                  style={{ x: rightX, opacity: sideOpacity, rotate: rightRotate }}
                  className="text-heritage-dark text-6xl md:text-[6vw] leading-[1.05] tracking-tighter origin-left"
                >
                  Busy <br className="hidden md:block"/>Professionals
                </motion.h3>
              </div>
              <div className="mb-10 w-full">
                <motion.p
                  style={{ x: rightX, opacity: sideOpacity, rotate: rightRotate }}
                  className="text-heritage-dark/60 text-sm md:text-lg leading-relaxed max-w-[380px] font-sans mr-auto origin-left"
                >
                  Long days deserve wholesome endings. Nutritious, home-style meals are ready when you are.
                </motion.p>
              </div>
              <div className="w-full">
                <motion.ul
                  style={{ x: rightX, opacity: sideOpacity, rotate: rightRotate }}
                  className="flex flex-col items-center md:items-start gap-2 text-heritage-accent font-bold text-[10px] md:text-xs uppercase tracking-[0.25em] origin-left"
                >
                  <li className="flex items-center gap-3"><span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" />Office Delivery</li>
                  <li className="flex items-center gap-3"><span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" />Nutritionally Balanced</li>
                  <li className="flex items-center gap-3"><span className="hidden md:block w-1 h-1 rounded-full bg-heritage-accent/30" />Cancellation Flexibility</li>
                </motion.ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
