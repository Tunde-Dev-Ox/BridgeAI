import { supabase } from "../supabaseClient";

export const PAGE_SIZE = 10;

export async function fetchAnalyses(userId, { page = 0, limit = PAGE_SIZE, filter, search } = {}) {
  let query = supabase
    .from("analyses")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (filter && filter !== "ALL") {
    query = query.eq("tag", filter);
  }

  if (search) {
    query = query.or(
      `result->>targetCompany.ilike.%${search}%,result->>targetRole.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message || "Failed to fetch analyses");
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchAnalysisById(id) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message || "Failed to fetch analysis");
  return data;
}

export async function deleteAnalysis(id) {
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", id);

  if (error) {
    if (error.message?.includes("row-level security")) {
      throw new Error("Delete blocked by RLS. Add a DELETE policy in Supabase for the analyses table.");
    }
    throw new Error(error.message || "Failed to delete analysis");
  }
}

export async function updateCoverLetter(id, newText) {
  const { data, error } = await supabase
    .from("analyses")
    .select("result")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message || "Failed to fetch analysis");

  const updatedResult = { ...data.result, coverLetter: newText };

  const { error: updateError } = await supabase
    .from("analyses")
    .update({ result: updatedResult })
    .eq("id", id);

  if (updateError) throw new Error(updateError.message || "Failed to update cover letter");
  return updatedResult;
}
