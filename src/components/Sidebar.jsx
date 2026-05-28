import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { GoChevronRight } from "react-icons/go";
import { TfiPlus } from "react-icons/tfi";
import { VscHistory } from "react-icons/vsc";
import { FiUserCheck, FiMessageSquare } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import { supabase } from "../supabaseClient";

const NAV_ITEMS = [
  { path: "/app", label: "New", icon: TfiPlus, authRequired: false },
  { path: "/app/projects", label: "History", icon: VscHistory, authRequired: true, tour: "sidebar-history" },
  { path: "/app/profile", label: "Profile", icon: FiUserCheck, authRequired: true },
];

export default function Sidebar({ onClick, onNew }) {
  const { user, openAuthModal, openFeedbackModal, signOut } = useAuthModal();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!user) return;
    setImgError(false);

    const metadataUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    if (metadataUrl) {
      setProfileAvatar(metadataUrl);
      return;
    }

    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.avatar_url) setProfileAvatar(data.avatar_url);
      })
      .catch(() => { });
  }, [user]);

  const handleNavClick = (item) => (e) => {
    if (item.authRequired && !user) {
      e.preventDefault();
      openAuthModal();
      return;
    }
    if (item.path === "/app" && onNew) {
      onNew();
    }
  };

  const NavLink = ({ item, mobile }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    const baseClass = mobile
      ? "flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer py-1 px-2 rounded-lg"
      : "flex items-center px-2 py-2 rounded-lg font-medium transition-colors cursor-pointer";
    const activeClass = mobile
      ? active ? "text-brand" : "text-zinc-500"
      : active
        ? "bg-gray-200 text-gray-900"
        : "bg-transparent text-gray-700 hover:bg-gray-200/50 hover:text-gray-900";

    return (
      <Link
        to={item.path}
        onClick={handleNavClick(item)}
        aria-current={active ? "page" : undefined}
        className={`${baseClass} ${activeClass}`}
        data-tour={item.tour}
      >
        <Icon className={mobile ? "text-lg" : "mr-2 text-gray-600"} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-48 bg-[#f5f5f5] h-screen p-6 pb-4 flex-col overflow-hidden border-r border-gray-300">
        <Link to="/app" className="block mb-4">
          <img src="/goover.png" alt="logo" className="w-20" />
        </Link>
        <nav className="space-y-2" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-300 pt-4 space-y-1">
          <button
            onClick={openFeedbackModal}
            className="w-full flex items-center px-2 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <FiMessageSquare className="mr-2 text-zinc-500" />
            <span>Feedback</span>
          </button>
          <div className="flex flex-col space-y-2 pt-1">
            <div className="flex items-center space-x-2 px-1 py-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden bg-[#f4330d] text-white">
                {profileAvatar && !imgError ? (
                  <img
                    src={profileAvatar}
                    alt={user.user_metadata?.full_name || user.email?.split("@")[0]}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  (user.email?.trim()[0]?.toUpperCase() || "U")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-900 truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              aria-label="Sign out of your account"
              className="w-full text-left text-xs font-semibold text-red-600 hover:text-red-800 transition-colors px-2 py-1.5 rounded-lg cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-1 py-1" role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} item={item} mobile />
        ))}
        <>
          <button
            onClick={openFeedbackModal}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors cursor-pointer py-1 px-2 rounded-lg text-zinc-500 hover:text-zinc-900"
            aria-label="Send feedback"
          >
            <FiMessageSquare className="text-lg" />
            <span>Feedback</span>
          </button>
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer py-1 px-2 rounded-lg"
            aria-label="Sign out"
          >
            <div className="w-5 h-5 rounded-full bg-zinc-300 flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden">
              {profileAvatar && !imgError ? (
                <img src={profileAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (user.email?.trim()[0]?.toUpperCase() || "U")
              )}
            </div>
            <span className="text-red-500">Sign Out</span>
          </button>
        </>
      </nav>
    </>
  );
}
