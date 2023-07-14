import { StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { downloadAvatar, type Post, type Profile } from "../lib/api";
import { Card, Text, View, useThemeColor } from "./Themed";
import { TouchableOpacity } from "react-native-gesture-handler";

import { FontAwesome } from "@expo/vector-icons";
import { useUserInfo } from "../lib/userContext";
import Avatar from "./Avatar";

interface PostCardProps {
  post: Post;
  onDelete: () => void;
}

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const color = useThemeColor({}, "primary");
  const user = useUserInfo();
  const profile = post.profile as Profile;

  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile.avatar_url) {
      downloadAvatar(profile.avatar_url).then(setAvatarUrl);
    }
  }, [profile]);

  return (
    <Card style={styles.container}>
      {/* Header  */}
      <Card style={styles.header}>
        <Avatar uri={avatarUrl} />
        <Text style={styles.username}>{profile?.username}</Text>
      </Card>
      {/* Image */}

      {post.image && (
        <Card style={styles.imageContainer}>
          <Image source={{ uri: post.image }} style={styles.image} />
        </Card>
      )}
      {/* Content */}
      <Card style={styles.content}>
        <Text style={styles.contentText}>{post.content}</Text>
        {/* Footer */}
        <Card style={styles.footer}>
          <TouchableOpacity>
            <FontAwesome name="heart-o" size={24} color={color} />
          </TouchableOpacity>
          {user?.profile?.id === post.user_id && (
            <TouchableOpacity onPress={onDelete}>
              <FontAwesome name="trash-o" size={24} color={color} />
            </TouchableOpacity>
          )}
        </Card>
      </Card>
    </Card>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 16,
  },

  username: {
    fontWeight: "bold",
    marginLeft: 8,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
  },
  footer: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
