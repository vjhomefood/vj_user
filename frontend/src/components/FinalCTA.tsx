import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Phone, MessageSquare, AlertCircle } from "lucide-react";

export default function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook into the footer scroll progress to drive the wave actions
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Soft elastic spring smoothing to guarantee non-linear flowing movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 18,
    restDelta: 0.001
  });

  // Slide the wave horizontally during scroll. Moves beautifully across exactly one wavelength
  const waveX = useTransform(smoothProgress, [0, 1], ["0%", "-33.33%"]);

  // Elastic height compression during active mid-scroll phase
  const waveScaleY = useTransform(smoothProgress, [0, 0.45, 1], [1.15, 0.75, 1.1]);

  return (
    <footer ref={containerRef} className="bg-heritage-accent text-white py-24 pb-12 px-6 relative mt-[80px] md:mt-[180px]">
      {/* Curved organic transition separator - Overflow-hidden for horizontal slide edge safety */}
      <div className="absolute top-0 left-0 right-0 w-full h-[80px] md:h-[180px] overflow-hidden leading-none -translate-y-[99%] z-20 pointer-events-none select-none">
        <motion.div
          style={{ x: waveX, scaleY: waveScaleY, transformOrigin: "bottom center" }}
          className="absolute bottom-0 left-0 w-[150%] h-full flex"
        >
          <svg 
            viewBox="0 0 2160 200" 
            preserveAspectRatio="none" 
            className="w-full h-[101%] text-heritage-accent" 
            fill="currentColor"
          >
            {/* Perfectly matched seamless double sine wave */}
            <path d="M 0,120 C 360,225 720,15 1080,120 C 1440,225 1800,15 2160,120 L 2160,200 L 0,200 Z" />
          </svg>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10" id="contact-section">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-24 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif italic mb-6 leading-tight tracking-tighter text-white">
              Ready for <span className="text-heritage-dark">veettu samayal?</span>
            </h2>
            <p className="text-base md:text-lg font-sans text-white/90 mb-10 max-w-sm leading-relaxed tracking-wide">
              Join our food family today. Just one call or message away from hot, fresh, home-cooked happiness delivered to your doorstep.
            </p>
            <div className="flex flex-row items-center gap-3 sm:gap-4 w-full">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="tel:+917604891254"
                className="bg-heritage-dark text-white hover:bg-black px-4 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase shadow-xl shadow-black/10 transition-all text-center whitespace-nowrap flex-1 sm:flex-none"
              >
                <Phone size={12} /> Call Now
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`https://wa.me/917604891254?text=${encodeURIComponent("Hi! I'm interested in VJ Home Foods subscription")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-heritage-accent hover:bg-white/95 px-4 sm:px-8 py-3.5 sm:py-4 rounded-full flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-[0.2em] uppercase shadow-xl shadow-black/10 transition-all text-center border border-white/25 whitespace-nowrap flex-1 sm:flex-none"
              >
                <MessageSquare size={12} /> WhatsApp Us
              </motion.a>
            </div>
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:pl-12">
            <div>
              <h4 className="text-heritage-dark font-black uppercase tracking-[0.25em] text-xs mb-4">Contact</h4>
              <ul className="space-y-4 text-white/95 font-sans text-sm tracking-wider">
                <li className="flex items-center gap-3">
                  <a href="tel:+917604891254" className="hover:underline flex items-center gap-2 decoration-white/35">
                    <Phone size={16} className="text-heritage-dark" /> +91 76048 91254
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <a href={`https://wa.me/917604891254?text=${encodeURIComponent("Hi! I'm interested in VJ Home Foods subscription")}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2 decoration-white/35">
                    <MessageSquare size={16} className="text-heritage-dark" /> WhatsApp Chat
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heritage-dark font-black uppercase tracking-[0.25em] text-xs mb-4">Complaints</h4>
              <ul className="space-y-4 text-white/95 font-sans text-sm tracking-wider">
                <li className="flex items-center gap-3">
                  <a href="tel:+917845994205" className="hover:underline flex items-center gap-2 decoration-white/35">
                    <AlertCircle size={16} className="text-heritage-dark" /> +91 78459 94205
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <a href={`https://wa.me/917845994205?text=${encodeURIComponent("Hi! I have a complaint regarding my VJ Home Foods order")}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-2 decoration-white/35">
                    <MessageSquare size={16} className="text-heritage-dark" /> WhatsApp Chat
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-heritage-dark font-black uppercase tracking-[0.25em] text-xs mb-4">Delivery Hours</h4>
              <ul className="space-y-4 text-white/95 font-sans text-sm tracking-wider font-medium">
                <li className="flex items-center gap-3">7 AM - 8 PM</li>
              </ul>
            </div>
            <div>
              <h4 className="text-heritage-dark font-black uppercase tracking-[0.25em] text-xs mb-4">Service Area</h4>
              <p className="text-white/95 font-sans text-sm tracking-wider leading-relaxed">Coimbatore (Kuniyamuthur Area)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start select-none">
            <span className="text-3xl font-serif font-bold italic tracking-tighter text-white">VJ Home Foods</span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-heritage-dark font-bold mt-1 leading-none">Authentic Veettu Samayal</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            © 2026 VJ Home Foods. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/60">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
