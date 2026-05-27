import { Navigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";

export default function GuestRoute({ children }) {
  const { user, loading } = useAuthModal();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-[#f4330d] rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return children;
}
