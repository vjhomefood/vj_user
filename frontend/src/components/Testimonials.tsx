import { motion, useScroll, useTransform } from "motion/react";
import { Star } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const testimonials = [
  {
    name: "Priya S. — Engineering Student",
    text: "FINALLY, FOOD THAT REMINDS ME OF HOME! THE IDIYAPPAM WITH COCONUT MILK IS EXACTLY LIKE MY MOM MAKES. BEST DECISION I MADE THIS SEMESTER.",
    stars: 5,
    position: "md:top-[5%] md:left-[5%]",
    speed: 1.0,
    rotate: -1.5
  },
  {
    name: "Rahul M. — Software Developer",
    text: "AFTER LONG WFH HOURS, GETTING FRESH FOOD DELIVERED IS A BLESSING. THE FLEXIBILITY TO SKIP MEALS IS SUPER HELPFUL.",
    stars: 5,
    position: "md:top-[25%] md:right-[5%]",
    speed: 1.1,
    rotate: 1.5
  },
  {
    name: "Sneha K. — MBA Student",
    text: "AFFORDABLE, TASTY, AND ALWAYS ON TIME. THE CANCELLATION POLICY IS SO CONVENIENT DURING EXAM WEEKS!",
    stars: 5,
    position: "md:top-[47%] md:left-[10%]",
    speed: 0.9,
    rotate: -1
  },
  {
    name: "Karthik R. — Corporate Professional",
    text: "THE BEST MEAL SUBSCRIPTION IN COIMBATORE. EVERY SINGLE DISH HAS THAT GENUINE SOUTH INDIAN AROMA AND TASTE. THE SERVICE IS IMMACULATE.",
    stars: 5,
    position: "md:top-[69%] md:right-[8%]",
    speed: 1.05,
    rotate: 1.2
  },
  {
    name: "Meera J. — Homemaker & Parent",
    text: "ORDERED FOR MY KIDS AT PG. THEY ABSOLUTELY LOVE THE PANIYARAM. FRESH, HEALTHY, AND TASTES ABSOLUTELY SPOTLESS.",
    stars: 5,
    position: "md:top-[89%] md:left-[5%]",
    speed: 0.95,
    rotate: -1.2
  }
];

export default function Testimonials() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Instantly reveal/hide when scrolled into/out of this section, ensuring absolute zero visibility in other sections
  const containerOpacity = useTransform(scrollYProgress, [0.01, 0.05, 0.95, 0.99], [0, 1, 1, 0]);

  // Premium mask reveal transforms for the text slide-up effect
  const titleYText = useTransform(scrollYProgress, [0.08, 0.22, 1.0], ["105%", "0%", "0%"]);
  const signatureYText = useTransform(scrollYProgress, [0.06, 0.20, 1.0], ["105%", "0%", "0%"]);

  return (
    <section ref={containerRef} className="py-16 md:py-40 px-4 md:px-6 relative overflow-hidden bg-transparent min-h-0 h-auto md:min-h-[220vh] flex flex-col items-center justify-center">
      {/* Centered Fixed Title using Framer-Motion for scroll tracking - ensures compatibility with parent scroll transforms */}
      <motion.div 
        style={{ opacity: isMobile ? 1 : containerOpacity }}
        className={`${isMobile ? "relative mb-12" : "fixed inset-0"} pointer-events-none z-0 flex items-center justify-center`}
      >
        <div className="relative flex items-center justify-center pointer-events-none select-none scale-85 sm:scale-100 translate-y-[-2%] md:translate-y-[-5%]">
          {/* Big "Reviews" with premium mask-up reveal */}
          <div className="overflow-hidden py-2 md:py-4">
            <motion.h2 
              style={{ y: isMobile ? 0 : titleYText }}
              className="font-serif text-[4.2rem] sm:text-[6rem] md:text-[9rem] lg:text-[11rem] font-normal leading-none tracking-tight text-heritage-accent text-center"
            >
              Reviews
            </motion.h2>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-5xl md:px-12 mx-auto relative h-auto md:h-[1400px] flex flex-col md:block gap-8 z-10">
        {testimonials.map((t, i) => {
          // Individual parallax for floating effect and delayed reveal moving homogeneously upwards
          const yParallax = useTransform(scrollYProgress, [0.08, 0.92], [130 * t.speed, -130 * t.speed]);
          
          return (
            <motion.div
              key={t.name}
              style={{ 
                y: isMobile ? undefined : yParallax,
                rotate: t.rotate
              }}
              initial={isMobile ? { scale: 0.95, y: 20 } : undefined}
              whileInView={isMobile ? { scale: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: isMobile ? i * 0.05 : i * 0.1, duration: 0.8, ease: "easeOut" }}
              className={`md:absolute relative p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-heritage-dark/5 shadow-2xl shadow-heritage-dark/5 w-full md:max-w-[400px] top-auto left-auto right-auto bottom-auto mx-auto md:mx-0 ${t.position}`}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, idx) => (
                  <Star key={idx} size={14} className="fill-heritage-accent text-heritage-accent" />
                ))}
              </div>
              
              <p className="text-sm md:text-base font-serif font-medium tracking-tight leading-relaxed text-heritage-dark mb-6">
                "{t.text}"
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-heritage-dark/40">
                  {t.name}
                </span>
                <div className="w-8 h-[1px] bg-heritage-dark/10" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
