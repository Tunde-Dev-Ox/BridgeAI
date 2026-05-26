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
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);

          if (event === 'SIGNED_IN' && session?.user && typeof pendo !== "undefined") {
            const authMethod = session.user.app_metadata?.provider || "unknown";
            const emailDomain = session.user.email?.split("@")[1] || "unknown";
            const isNewUser = session.user.created_at === session.user.last_sign_in_at;

            if (isNewUser) {
              pendo.track("user_signed_up", {
                authMethod,
                emailDomain,
              });
            } else {
              pendo.track("user_signed_in", {
                authMethod,
                emailDomain,
              });
            }
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

