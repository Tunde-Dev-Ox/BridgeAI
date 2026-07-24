import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Projects from "./pages/dashboard/Projects";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import { AuthModalProvider } from "./context/AuthModalContext";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./components/ErrorBoundary";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <GuestRoute><Home /></GuestRoute>
          </motion.div>
        } />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<Projects />} />
          </Route>
        </Route>
        <Route path="/privacy" element={
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <Privacy />
          </motion.div>
        } />
        <Route path="*" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <NotFound />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
    <Router>
      <AuthModalProvider>
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: "#111214",
              border: "1px solid #282a2e",
              color: "#e3e4e6",
            },
          }}
        />
        <AnimatedRoutes />
      </AuthModalProvider>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
