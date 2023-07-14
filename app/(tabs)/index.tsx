// import "react-native-url-polyfill/auto";

import { FlatList, StyleSheet } from "react-native";

import { Text, View, useThemeColor } from "../../components/Themed";

import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import AddPostForm from "../../components/AddPostForm";
import { Posts, fetchPosts } from "../../lib/api";
import PostCard from "../../components/PostCard";
import { useUserInfo } from "../../lib/userContext";
import { Tabs } from "expo-router";

export default function TabOneScreen() {
  const [posts, setPosts] = useState<Posts>([]);
  const { profile } = useUserInfo();
  const color = useThemeColor({}, "primary");

  useEffect(() => {
    fetchPosts().then((data) => setPosts(data));
  }, []);

  const handleSubmit = async (content: string) => {
    // ejecuta el post
    const { data, error } = await supabase
      .from("posts")
      .insert({ content })
      .select("*, profile:profiles(username,avatar_url)");
    if (error) {
      console.log(error);
    } else {
      // de ejecutarse correctamente el post se añade a la ui
      setPosts([data[0], ...posts]);
    }
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.log(error);
    } else {
      setPosts(posts.filter((post) => post.id !== id));
    }
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: "SupaBook",
          headerRight: () => (
            <Text
              style={{
                fontWeight: "bold",
                color,
                marginRight: 10,
                fontSize: 20,
              }}
            >
              {profile?.username ?? ""}
            </Text>
          ),
          // headerShown: false,
        }}
      />
      <View style={styles.container}>
        <AddPostForm onSubmit={handleSubmit} />
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 8 }}
          renderItem={({ item }) => (
            <PostCard post={item} onDelete={() => handleDeletePost(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
