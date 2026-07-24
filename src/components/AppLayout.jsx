import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";
import OnboardingTour from "./OnboardingTour";

export default function AppLayout() {
  const [resetKey, setResetKey] = useState(0);
  const location = useLocation();

  const handleNew = () => {
    setResetKey(k => k + 1);
  };

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[192px_1fr] text-zinc-950">
      <OnboardingTour />
      <Sidebar onNew={handleNew} />
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-zinc-200/30 rounded-full blur-[80px]" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex flex-col overflow-hidden"
        >
          <Outlet context={{ resetKey }} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
