import { StyleSheet } from "react-native";
import { useState } from "react";

import { Button, Text, View } from "../../components/Themed";
import { supabase } from "../../lib/supabase";
import { useUserInfo } from "../../lib/userContext";
import ProfileForm from "../../components/ProfileForm";
import { Profile } from "../../lib/api";

export default function TabTwoScreen() {
  const { profile, loading, saveProfile } = useUserInfo();

  return (
    <View style={styles.container}>
      <ProfileForm
        profile={profile}
        loading={loading!}
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
