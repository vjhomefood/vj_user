import { motion } from "motion/react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fffcfb] overflow-hidden">
      {/* Soft warm glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_0%,_#fffcfb_70%)] opacity-80" />
      
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo from provided link */}
        <div className="relative mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center p-4"
          >
            <img 
              src="/vj-logo-transparent.png" 
              alt="VJ Home Foods Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Loading Text with Hero Font (Cormorant Garamond) */}
        <div className="flex items-baseline justify-center font-cormorant">
          <span className="text-4xl md:text-5xl tracking-[0.15em] text-[#4a2c2a] font-light italic">Cooking</span>
          <div className="flex ml-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.1, 1, 0.1] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
                className="text-4xl md:text-5xl text-[#f25b2a] font-bold"
              >
                .
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle paper texture overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
    </div>
  );
}
