import { supabase } from "./supabase";

export const fetchPosts = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
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
