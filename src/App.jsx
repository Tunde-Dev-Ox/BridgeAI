import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Projects from "./components/Projects";
import Privacy from "./components/Privacy";
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<Projects />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </AuthModalProvider>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
