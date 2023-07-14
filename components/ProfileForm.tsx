import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { Button, TextInput, View } from "./Themed";
import { Profile, downloadAvatar } from "../lib/api";
import Avatar from "./Avatar";

interface ProfileFormProps {
  profile: Profile | null;
  onSave: (updatedProfile: Profile, avatarUpdated: boolean) => void;
  onLogout: () => void;
  loading: boolean;
}

export default function ProfileForm({
  profile,
  onSave,
  loading,
  onLogout,
}: ProfileFormProps) {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
    if (profile?.avatar_url) {
      downloadAvatar(profile.avatar_url).then(setAvatarUrl);
    }
  }, [profile]);

  const handleSubmit = () => {
    if (profile) {
      onSave({ ...profile, username, avatar_url: avatarUrl }, avatarUpdated);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
      setAvatarUpdated(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <View style={styles.input}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handlePickImage}
            >
              <Avatar uri={avatarUrl} size={120} />
            </TouchableOpacity>
            <TextInput
              placeholder="Nombre de usuario"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.input}>
            <Button
              title="Guardar cambios"
              onPress={handleSubmit}
              disabled={loading || !username}
            />
          </View>
          <View style={styles.input}>
            <Button title="Cerrar sesión" onPress={onLogout} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 16,
    flex: 1,
  },
  input: {
    paddingVertical: 8,
  },
  avatarButton: {
    alignItems: "center",
    marginBottom: 15,
  },
});
