import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface NavigationProps {
  scrolled: boolean;
  isVisible: boolean;
  logoCollapse?: any;
  logoWidth?: any;
  scrollProgress?: any;
  onMenuClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onContactClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function Navigation({ scrolled, isVisible, logoCollapse, logoWidth, scrollProgress, onMenuClick, onContactClick }: NavigationProps) {
  const leftLinks = ["MENU"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ 
        y: isVisible ? 0 : -100,
        backgroundColor: scrolled ? "rgba(253, 251, 247, 0.85)" : "rgba(255, 255, 255, 0)",
      }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 md:px-10 h-[64px] sm:h-[80px] transition-all duration-500 ${scrolled ? "backdrop-blur-md border-b border-heritage-dark/5" : ""}`}
    >
      {/* Left Side Links */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        className="flex gap-4 sm:gap-8 items-center overflow-hidden"
      >
        {leftLinks.map((link) => (
          <motion.a
            key={link}
            variants={itemVariants}
            href="#daily-menu"
            onClick={(e) => {
              if (link === "MENU" && onMenuClick) {
                onMenuClick(e);
              }
            }}
            className={`text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] uppercase font-bold transition-colors duration-500 ${
              scrolled ? "text-heritage-dark hover:text-heritage-accent" : "text-white hover:text-heritage-accent"
            }`}
          >
            <motion.span className="inline-block">{link}</motion.span>
          </motion.a>
        ))}
      </motion.div>
      
      {/* Center Logo Area */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center h-full overflow-hidden">
        <motion.a 
          href="#" 
          initial={{ opacity: 0, y: 60 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center"
        >
          <motion.div 
            layout
            className={`font-serif tracking-tight transition-all duration-700 flex items-center ${
              scrolled ? "text-sm sm:text-2xl md:text-3xl lg:text-4xl text-heritage-accent" : "text-lg sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white drop-shadow-2xl font-bold"
            }`}
          >
            <motion.span layout className="z-20 bg-inherit pr-0.5">VJ</motion.span>
            
            <motion.div
              style={{ 
                width: logoWidth,
              }}
              className="overflow-hidden whitespace-nowrap flex items-center relative z-10 max-w-[140px] sm:max-w-none"
            >
              <motion.span
                style={{ 
                  x: logoCollapse ? (1 - logoCollapse) * -200 : 0, // Slides deep behind "VJ"
                  opacity: logoCollapse
                }}
                className="whitespace-nowrap inline-block"
              >
                &nbsp;Home Foods
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.a>
      </div>

      {/* Right Side Links */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="flex items-center gap-4 sm:gap-8"
        >
          <motion.a 
            href="#contact-section" 
            variants={itemVariants}
            onClick={(e) => {
              if (onContactClick) {
                onContactClick(e);
              }
            }}
            className={`text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] transition-colors duration-500 uppercase font-bold hidden sm:inline-block ${
              scrolled ? "text-heritage-dark hover:text-heritage-accent" : "text-white hover:text-heritage-accent"
            }`}
          >
            <span className="inline-block">CONTACT</span>
          </motion.a>
          <motion.span 
            variants={itemVariants}
            className={`text-lg transition-colors duration-500 font-light hidden sm:inline-block ${scrolled ? "text-heritage-dark/20" : "text-white/30"}`}
          >
            |
          </motion.span>
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <a 
              href={`https://wa.me/917604891254?text=${encodeURIComponent("Hi! I'm interested in VJ Home Foods subscription")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] transition-colors duration-500 uppercase font-bold ${
                scrolled ? "text-heritage-dark hover:text-heritage-accent" : "text-white hover:text-heritage-accent"
              }`}
            >
              ORDER NOW
            </a>
            <Link
              to="/user/login"
              className={`text-[11px] sm:text-[13px] md:text-[14px] tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] transition-colors duration-500 uppercase font-bold no-underline ${
                scrolled ? "text-heritage-dark hover:text-heritage-accent" : "text-white hover:text-heritage-accent"
              }`}
            >
              LOGIN
            </Link>
          </motion.div>
        </motion.div>

      {/* Progress Bar (Black line appearing on scroll) */}
      <motion.div 
        style={{ scaleX: scrollProgress, opacity: scrolled ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-heritage-dark origin-left z-50 transition-shadow"
      />
    </motion.nav>
  );
}
