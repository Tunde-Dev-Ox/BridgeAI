import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/dashboard/Profile";
import Projects from "./pages/dashboard/Projects";
import Privacy from "./pages/Privacy";
import { AuthModalProvider } from "./context/AuthModalContext";
import { Toaster } from "sonner";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./components/ErrorBoundary";

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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<Projects />} />
            </Route>
          </Route>
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </AuthModalProvider>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
