import { StyleSheet } from "react-native";
import { useState } from "react";

import { View } from "../../components/Themed";
import { supabase } from "../../lib/supabase";
import { useUserInfo } from "../../lib/userContext";
import ProfileForm from "../../components/ProfileForm";

export default function TabTwoScreen() {
  const {
    user: { profile },
    saveProfile,
    loading,
  } = useUserInfo();

  return (
    <View style={styles.container}>
      <ProfileForm
        profile={profile}
        loading={loading}
        onSave={saveProfile!}
        onLogout={() => supabase.auth.signOut()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
