import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import Lenis from "lenis";
import Loader from "./components/Loader";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import MealShowcase from "./components/MealShowcase";
import WhoWeAreFor from "./components/WhoWeAreFor";
import Testimonials from "./components/Testimonials";
import IngredientsSection from "./components/IngredientsSection";
import WeeklyMealPlan from "./components/WeeklyMealPlan";
import FinalCTA from "./components/FinalCTA";
import { useAuthStore } from "./store/useAuthStore";

// Lazy load screen components for optimized initial bundle loading
const LoginScreen = lazy(() => import("./screens/LoginScreen"));
const HomeScreen = lazy(() => import("./screens/HomeScreen"));
const MenuScreen = lazy(() => import("./screens/MenuScreen"));
const BillsScreen = lazy(() => import("./screens/BillsScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen"));
const DeliveryLoginScreen = lazy(() => import("./screens/DeliveryLoginScreen"));
const DeliveryDashboardScreen = lazy(() => import("./screens/DeliveryDashboardScreen"));

/* ─── Protected Route Wrappers ─── */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token       = useAuthStore((s) => s.token);
  const initialized = useAuthStore((s) => s.initialized);
  // Wait for localStorage restore before deciding to redirect
  if (!initialized) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading...</span>
    </div>
  );
  if (!token) return <Navigate to="/user/login" replace />;
  return <>{children}</>;
}

function DeliveryProtectedRoute({ children }: { children: React.ReactNode }) {
  const token       = useAuthStore((s) => s.token);
  const user        = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!initialized) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading...</span>
    </div>
  );
  if (!token || user?.role !== 'delivery') return <Navigate to="/deliverypartner/login" replace />;
  return <>{children}</>;
}

/* ─── User Layout (Header + Content + Bottom Nav) ─── */
type TabType = "dashboard" | "menu" | "bills" | "profile";

import { Utensils, BookOpen, Clock, User as UserIcon, MapPin, ChevronDown } from 'lucide-react';

function UserLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [deliveryMethod, setDeliveryMethod] = useState<"Dorm Drop" | "Clg Drop">(
    () => (localStorage.getItem('vj_delivery') as "Dorm Drop" | "Clg Drop") || "Dorm Drop"
  );
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const [showLocationTooltip, setShowLocationTooltip] = useState(false);

  const changeDelivery = (method: "Dorm Drop" | "Clg Drop") => {
    setDeliveryMethod(method);
    localStorage.setItem('vj_delivery', method);
    setDeliveryDropdownOpen(false);
  };

  const getActiveTab = (): TabType => {
    if (location.pathname.includes("/menu")) return "menu";
    if (location.pathname.includes("/bills")) return "bills";
    if (location.pathname.includes("/profile")) return "profile";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleLogout = async () => {
    await logout();
    navigate("/user/login");
  };

  const tabs: { key: TabType; label: string; icon: any; path: string }[] = [
    { key: "dashboard", label: "Order", icon: Utensils, path: "/user/dashboard" },
    { key: "menu", label: "Menu", icon: BookOpen, path: "/user/menu" },
    { key: "bills", label: "History", icon: Clock, path: "/user/bills" },
    { key: "profile", label: "Profile", icon: UserIcon, path: "/user/profile" },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] text-slate-800 relative overflow-hidden">
      {/* Orange Header matching screenshots */}
      <header className="bg-brand text-white h-[56px] px-4 shrink-0 shadow-md flex items-center justify-between relative z-50">
        {/* Left: Dropdown Delivery Selector */}
        <div className="relative">
          <button
            onClick={() => setDeliveryDropdownOpen(!deliveryDropdownOpen)}
            className="flex items-center gap-1 text-[10px] font-black text-white uppercase tracking-wider hover:bg-white/20 transition py-1.5 px-3 bg-white/10 border border-white/20 rounded-full"
          >
            <span>{deliveryMethod}</span>
            <ChevronDown className={`w-3 h-3 text-white/80 transition-transform duration-200 ${deliveryDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {deliveryDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1 w-36 text-slate-800 animate-fade-in">
              <button
                onClick={() => changeDelivery("Dorm Drop")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                  deliveryMethod === "Dorm Drop"
                    ? "bg-brand/10 text-brand font-black"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                🏠 Dorm Drop
              </button>
              <button
                onClick={() => changeDelivery("Clg Drop")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition ${
                  deliveryMethod === "Clg Drop"
                    ? "bg-brand/10 text-brand font-black"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                🎒 Clg Drop
              </button>
            </div>
          )}
        </div>

        {/* Center: VJ Logo transparent, no text, no white capsule background wrapper */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center select-none pointer-events-none">
          <img src="/vjhomefoods/vj-logo-transparent.png" alt="VJ Logo" className="h-11 object-contain" />
        </div>

        {/* Right: Map Pin (no logout option here) */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowLocationTooltip(!showLocationTooltip)}
            className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition active:scale-95"
            title="Location Info"
          >
            <MapPin className="w-4 h-4 text-white" />
          </button>

          {showLocationTooltip && (
            <div className="absolute right-0 top-full mt-2 bg-slate-950 text-white rounded-xl shadow-2xl p-3 z-50 w-52 flex flex-col gap-1.5 animate-fade-in">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">DELIVERY TARGET</span>
              <span className="text-xs font-bold text-white block">Batch {user?.batchId} Target</span>
              <button
                onClick={() => {
                  setShowLocationTooltip(false);
                  navigate("/user/profile");
                }}
                className="w-full bg-brand text-white text-[10px] font-black uppercase tracking-wider py-1.5 rounded-lg text-center hover:bg-brand-dark transition"
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative pb-[76px]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="dashboard" element={<HomeScreen />} />
            <Route path="menu" element={<MenuScreen />} />
            <Route path="bills" element={<BillsScreen />} />
            <Route path="profile" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </div>
      </main>

      {/* Bottom Floating Capsule Navigation matching screenshots */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-brand h-[56px] rounded-2xl shadow-xl flex items-center justify-between p-1 z-40 border border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const IconComponent = tab.icon;
          return (
            <Link
              key={tab.key}
              to={tab.path}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
                isActive ? "bg-white/20 text-white scale-102" : "text-white/70 hover:bg-white/5"
              }`}
            >
              <IconComponent className="w-[18px] h-[18px] transition-transform" />
              <span className="text-[9px] font-black tracking-widest uppercase">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Landing Page ─── */
function LandingPage() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [expansionFinished, setExpansionFinished] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => { lenis.destroy(); cancelAnimationFrame(rafId); };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY, scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const [vh, setVh] = useState(0);
  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const normalizedScrollYProgress = useTransform(scrollYProgress, (v) => Math.min(v * 1.22, 1.0));

  const videoClipPath = useTransform(normalizedScrollYProgress, (v) => {
    if (v <= 0.007) return "circle(150% at 50% 50%)";
    if (v <= 0.048) {
      const progress = (v - 0.007) / 0.041;
      return `circle(calc(150% - ${progress} * (150% - 210px)) at 50% calc(50% + ${progress * 110}px))`;
    }
    return "circle(210px at 50% calc(50% + 110px))";
  });

  const videoY = useTransform(scrollY, (latestScrollY) => {
    if (isMobile) return 0;
    const threshold = vh * 0.6;
    if (latestScrollY <= threshold) return 0;
    return -(latestScrollY - threshold);
  });

  const videoOpacity = useTransform(normalizedScrollYProgress, (v) => {
    if (isMobile) return v >= 0.048 ? 0 : 1;
    return 1;
  });

  const contentOpacity = useTransform(normalizedScrollYProgress, [0.046, 0.05], [0, 1]);
  const titleY = useTransform(normalizedScrollYProgress, [0.046, 0.075], ["100%", "0%"]);
  const leftX = useTransform(normalizedScrollYProgress, [0.046, 0.075], ["-100vw", "0px"]);
  const rightX = useTransform(normalizedScrollYProgress, [0.046, 0.075], ["100vw", "0px"]);
  const leftRotate = useTransform(normalizedScrollYProgress, [0.046, 0.075], ["-20deg", "0deg"]);
  const rightRotate = useTransform(normalizedScrollYProgress, [0.046, 0.075], ["20deg", "0deg"]);
  const sideOpacity = useTransform(normalizedScrollYProgress, [0.043, 0.046], [0, 1]);
  const logoCollapse = useTransform(normalizedScrollYProgress, [0, 0.02], [1, 0]);
  const logoWidth = useTransform(normalizedScrollYProgress, [0, 0.016], ["350px", "0px"]);
  const navScrolled = useTransform(normalizedScrollYProgress, [0, 0.024], [0, 1]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return navScrolled.on("change", (v) => setIsScrolled(v > 0));
  }, [navScrolled]);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const canStartExpansion = isVideoReady && minTimeElapsed;

  useEffect(() => {
    if (canStartExpansion) {
      const finishTimer = setTimeout(() => setExpansionFinished(true), 2000);
      const navTimer = setTimeout(() => setShowNav(true), 1500);
      return () => { clearTimeout(finishTimer); clearTimeout(navTimer); };
    }
  }, [canStartExpansion]);

  useEffect(() => {
    document.body.style.overflow = !canStartExpansion ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [canStartExpansion]);

  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("weekly-meal-plan");
    if (!element) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(element, { duration: 1.6, offset: -80 });
    } else {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById("contact-section");
    if (element) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, { duration: 1.6 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-[#FDFBF7] selection:bg-heritage-accent selection:text-white relative font-sans overflow-x-hidden text-heritage-dark text-lg pb-0 mb-0">
      <div
        className="fixed inset-0 z-0 bg-repeat opacity-[0.08] mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: "url('https://kommodo.ai/i/Kaylk0GhNdEs87wzVHF5')", backgroundSize: "400px 400px" }}
      />
      <Navigation scrolled={isScrolled} isVisible={showNav} logoCollapse={logoCollapse} logoWidth={logoWidth} scrollProgress={scrollYProgress} onMenuClick={handleMenuClick} onContactClick={handleContactClick} />

      <AnimatePresence>
        {!canStartExpansion && (
          <motion.div key="loader" className="fixed inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }}>
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div style={{ opacity: videoOpacity, y: videoY }} className="fixed inset-0 z-[45] pointer-events-none flex items-center justify-center">
        <Hero start={canStartExpansion} onReady={() => setIsVideoReady(true)} scrollClipPath={expansionFinished ? videoClipPath : undefined} isScrolled={isScrolled} scrollProgress={normalizedScrollYProgress} />
      </motion.div>

      <div className="relative w-full z-40">
        <div className="h-[60vh] w-full pointer-events-none" />
        <WhoWeAreFor contentOpacity={contentOpacity} titleY={titleY} leftX={leftX} rightX={rightX} leftRotate={leftRotate} rightRotate={rightRotate} sideOpacity={sideOpacity} />
        <div className="relative z-30">
          <MealShowcase scrollProgress={normalizedScrollYProgress} />
        </div>
        <div className="relative z-50">
          <IngredientsSection />
          <WeeklyMealPlan />
          <div id="testimonials">
            <Testimonials />
          </div>
          <FinalCTA />
        </div>
      </div>
    </main>
  );
}

/* ─── Root App with Router ─── */
export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter basename="/vjhomefoods">
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-brand rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading page...</span>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/user/login" element={<LoginScreen />} />
          <Route
            path="/user/*"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          />
          <Route path="/deliverypartner/login" element={<DeliveryLoginScreen />} />
          <Route
            path="/deliverypartner/dashboard"
            element={
              <DeliveryProtectedRoute>
                <DeliveryDashboardScreen />
              </DeliveryProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
