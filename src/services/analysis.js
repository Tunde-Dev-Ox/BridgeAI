import { supabase } from "../supabaseClient";

const IS_DEV = import.meta.env.DEV;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function invokeFunction(body, functionName = "quick-handler") {
  if (IS_DEV) {
    const session = (await supabase.auth.getSession()).data.session;
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ANON_KEY}`,
    };

    const response = await fetch(`/api/functions/${functionName}`, {
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

  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });

  if (error) throw new Error(error.message || "Failed to run analysis");
  return data;
}

export async function runAnalysis(jobDescription, experienceSummary) {
  const data = await invokeFunction({
    jobDescription,
    experience: experienceSummary,
  });

  if (!data?.result) throw new Error("Analysis returned empty result");

  return data.result;
}

export async function fetchUrl(url) {
  const data = await invokeFunction({ url }, "handle-url");

  if (data?.error) throw new Error(data.error);
  if (!data?.text) throw new Error("No content returned from URL");

  return { text: data.text, title: data.title ?? "" };
}

export async function saveAnalysis(userId, jobDescription, experienceSummary, result) {
  const { error } = await supabase.from("analyses").insert({
    user_id: userId,
    job_description: jobDescription,
    experience_summary: experienceSummary,
    result,
    fit_score: result.fitScore,
    tag: inferTag(result),
  });

  if (error) throw new Error(error.message || "Failed to save analysis");
}

function inferTag(result) {
  const breakdown = result?.fitBreakdown ?? [];
  const text = [
    result?.targetRole ?? "",
    result?.targetCompany ?? "",
    ...breakdown.map((f) => f?.area ?? ""),
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("design") || text.includes("ux")) return "PRODUCT DESIGN";
  if (text.includes("engineer") || text.includes("developer") || text.includes("frontend") || text.includes("backend")) return "ENGINEERING";
  if (text.includes("market") || text.includes("growth") || text.includes("brand")) return "MARKETING";
  if (text.includes("product") || text.includes("pm") || text.includes("manager")) return "PRODUCT";
  return "PRODUCT";
}
