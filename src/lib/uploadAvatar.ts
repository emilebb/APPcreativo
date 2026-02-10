import { getSupabaseClient } from "./supabaseClient";

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client not available");
  }

  const fileExt = file.name.split(".").pop() || "png";
  const filePath = `${userId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true, contentType: file.type || "image/png" });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userId);

  if (updateError) throw updateError;

  return data.publicUrl;
}
