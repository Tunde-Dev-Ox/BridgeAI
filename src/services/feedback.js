import { supabase } from "../supabaseClient";

const IS_DEV = import.meta.env.DEV;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function sendFeedback({ type, subject, message, email }) {
  const body = { type, subject, message, email };

  if (IS_DEV) {
    const session = (await supabase.auth.getSession()).data.session;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ANON_KEY}`,
    };

    const response = await fetch("/api/functions/send-feedback", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const message = typeof errorData === "string" ? errorData : errorData.error || JSON.stringify(errorData);
      throw new Error(message);
    }

    return response.json();
  }

  const { data, error } = await supabase.functions.invoke("send-feedback", { body });
  if (error) throw new Error(error.message || "Failed to send feedback");
  return data;
}
