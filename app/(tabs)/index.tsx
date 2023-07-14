// import "react-native-url-polyfill/auto";

import { FlatList, StyleSheet, Alert } from "react-native";

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

  const handleSubmit = async (content: string, image: string) => {
    try {
      let publicUrl = "";
      if (image) {
        const fileExt = image.split(".").pop();
        const fileName = image.replace(/^.*[\\\/]/, "");
        const filePath = `${Date.now()}.${fileExt}`;

        const formData = new FormData();
        const photo = {
          uri: image,
          name: fileName,
          type: `image/${fileExt}`,
        } as unknown as Blob;
        formData.append("file", photo);

        const { error } = await supabase.storage
          .from("posts")
          .upload(filePath, formData);
        if (error) throw error;

        const { data } = supabase.storage.from("posts").getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }
      const { data, error } = await supabase
        .from("posts")
        .insert({ content, image: publicUrl })
        .select("*, profile: profiles(username, avatar_url)");
      if (error) {
        throw error;
      } else {
        setPosts([data[0], ...posts]);
      }
    } catch (error: any) {
      Alert.alert("Server Error", error.message);
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
