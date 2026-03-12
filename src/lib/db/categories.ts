import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }

  return data;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Failed to fetch category by slug:", error);
    return null;
  }

  return data;
}
