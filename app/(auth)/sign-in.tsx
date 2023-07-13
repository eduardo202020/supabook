import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { useState } from "react";
import { Alert } from "react-native";
import AuthForm from "../../components/AuthForm";
import { supabase } from "../../lib/supabase";
import { useUserInfo } from "../../lib/userContext";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const userInfo = useUserInfo();

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
  return (
    <>
      <AuthForm
        loading={loading}
        onLogin={handleLogin}
        onSignUp={handleSignup}
      />
    </>
  );
}
