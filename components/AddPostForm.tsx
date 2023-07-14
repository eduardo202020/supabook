import { StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useState } from "react";
import { Card, Button, TextInput, useThemeColor } from "./Themed";

import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

interface Props {
  onSubmit: (content: string, image: string) => void;
}

export default function AddPostForm({ onSubmit }: Props) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const color = useThemeColor({}, "primary");

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <Card style={styles.container}>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="¿Qué estas pensando?"
      />
      <Card style={styles.row}>
        <TouchableOpacity onPress={handlePickImage}>
          <Feather name="image" size={24} color={color} />
        </TouchableOpacity>
        <Button
          title="Publicar"
          onPress={() => {
            onSubmit(content, image);
            setContent("");
            setImage("");
          }}
        />
      </Card>
      {!!image && (
        <ImageBackground source={{ uri: image }} style={styles.image}>
          <TouchableOpacity onPress={() => setImage("")}>
            <Feather name="x-circle" size={24} color={color} />
          </TouchableOpacity>
        </ImageBackground>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    borderRadius: 10,
  },
  image: {
    height: 100,
    width: 100,
  },
});
