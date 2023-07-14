import { Database } from "../db_types";
import { supabase } from "./supabase";

export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*, profile:profiles(username,avatar_url)")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.log(error);
    return [];
  } else {
    return data;
  }
};

// tipo para el array de posts
export type Posts = Awaited<ReturnType<typeof fetchPosts>>;

// tipo para un solo post
export type Post = Posts[number];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const downloadAvatar = async (path: string): Promise<string> => {
  try {
    const { data, error } = await supabase.storage
      .from("avatars")
      .download(path);
    if (error) throw error;
    const fr = new FileReader();
    fr.readAsDataURL(data);
    return new Promise((resolve) => {
      fr.onload = () => {
        resolve(fr.result as string);
      };
    });
  } catch (err) {
    console.log("error", err);
    return "";
  }
};

export const fetchLikes = async (postId: string) => {
  const { data, error } = await supabase
    .from("post_likes")
    .select("user_id, id")
    .eq("post_id", postId);

  if (error) {
    console.log("error", error);
    return [];
  } else {
    return data;
  }
};

export type Likes = Awaited<ReturnType<typeof fetchLikes>>;
export type Like = Likes[number];
