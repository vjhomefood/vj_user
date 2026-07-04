import { motion } from 'motion/react';

export default function SteamEffect() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex justify-center">
      <div className="relative w-40 h-full">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100, scale: 0.5, filter: 'blur(8px)' }}
            animate={{
              opacity: [0, 0.4, 0],
              y: -200,
              x: (i - 2) * 20,
              scale: [0.5, 1.5, 2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut"
            }}
            className="absolute bottom-0 left-1/2 w-12 h-20 bg-white/20 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
