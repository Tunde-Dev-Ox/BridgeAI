import { createContext, useContext, useState, useEffect } from "react";
import AuthModal from "../components/AuthModal";
import FeedbackModal from "../components/FeedbackModal";
import { supabase } from "../supabaseClient";

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);
  const openFeedbackModal = () => setIsFeedbackModalOpen(true);
  const closeFeedbackModal = () => setIsFeedbackModalOpen(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          pendo.clearSession();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const currentUser = session?.user ?? null;
          setUser(currentUser);

          if (currentUser && typeof pendo !== "undefined") {
            supabase
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .single()
              .then(({ data: profile }) => {
                pendo.identify({
                  visitor: {
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: [profile?.first_name, profile?.last_name].filter(Boolean).join(' '),
                    first_name: profile?.first_name ?? '',
                    last_name: profile?.last_name ?? '',
                    avatar_url: profile?.avatar_url ?? '',
                    role_title: profile?.role_title ?? '',
                    role_title_meta: profile?.role_title_meta ?? '',
                    target_region: profile?.target_region ?? '',
                    target_region_meta: profile?.target_region_meta ?? '',
                    skills: profile?.skills ?? [],
                    weekly_email: profile?.weekly_email ?? true,
                    ai_model: profile?.ai_model ?? '',
                    updated_at: profile?.updated_at ?? '',
                  }
                });

                if (event === 'SIGNED_IN') {
                  const authMethod = currentUser.app_metadata?.provider || "unknown";
                  const emailDomain = currentUser.email?.split("@")[1] || "unknown";
                  const isNewUser = currentUser.created_at === currentUser.last_sign_in_at;
                  pendo.track(isNewUser ? "user_signed_up" : "user_signed_in", { authMethod, emailDomain });
                }
              })
              .catch((err) => {
                console.error("Failed to load profile for Pendo:", err);
                pendo.identify({ visitor: { id: currentUser.id, email: currentUser.email } });
                if (event === 'SIGNED_IN') {
                  const authMethod = currentUser.app_metadata?.provider || "unknown";
                  const isNewUser = currentUser.created_at === currentUser.last_sign_in_at;
                  pendo.track(isNewUser ? "user_signed_up" : "user_signed_in", { authMethod });
                }
              });
          }
        } else {
          setUser(session?.user ?? null);
        }

        setLoading(false);
        if (session) {
          closeAuthModal();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);

      if (typeof pendo !== "undefined") {
        pendo.track("user_signed_out");
      }

      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        user,
        loading,
        openAuthModal,
        closeAuthModal,
        openFeedbackModal,
        closeFeedbackModal,
        signOut,
      }}
    >
      {children}
      {isAuthModalOpen && !user && (
        <AuthModal onClose={closeAuthModal} />
      )}
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={closeFeedbackModal} />
      )}
    </AuthModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthModal() {
  return (
    useContext(AuthModalContext) ?? {
      user: null,
      loading: false,
      openAuthModal: () => {},
      closeAuthModal: () => {},

      signOut: () => {},
    }
  );
}

