import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../../components/AuthForm";
import { supabase } from "../../lib/supabase";
import { useUserInfo } from "../../lib/userContext";
import { SocialIcon, SocialIconProps } from "@rneui/themed";
import { View } from "../../components/Themed";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const { profile } = useUserInfo();
  console.log("profile", profile?.username);

  const handleSignup = async (credentials: SignUpWithPasswordCredentials) => {
    if (!("email" in credentials)) return;
    setLoading(true);
    const { email, password, options } = credentials;
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) Alert.alert(error.message);

    setLoading(false);
  };

  const handleLogin = async (credentials: SignInWithPasswordCredentials) => {
    if (!("email" in credentials)) return;
    setLoading(true);
    const { email, password } = credentials;
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) Alert.alert(error.message);
    if (data) Alert.alert(data.provider);
    console.log({ data });
  };

  const handleFacebookSignIn = () => {
    supabase.auth.signInWithOAuth({
      provider: "facebook",
    });
  };

  return (
    <>
      <AuthForm
        loading={loading}
        onLogin={handleLogin}
        onSignUp={handleSignup}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          paddingBottom: "80%",
        }}
      >
        <SocialIcon type="google" onPress={handleGoogleSignIn} />
        <SocialIcon type="facebook" onPress={handleFacebookSignIn} />
      </View>
    </>
  );
}
