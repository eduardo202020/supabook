import { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet } from "react-native";
import { Button, Text, TextInput, View } from "./Themed";

import type {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { useUserInfo } from "../lib/userContext";

import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

import * as Linking from "expo-linking";

interface AuthFormProps {
  onSignUp: (credentials: SignUpWithPasswordCredentials) => void;
  onLogin: (credentials: SignInWithPasswordCredentials) => void;
  loading: boolean;
}

export default function AuthForm({
  onSignUp,
  onLogin,
  loading,
}: AuthFormProps) {
  const { setOAuthSession, getGoogleOAuthUrl, isLoggedIn, user } =
    useUserInfo();

  const [mode, setMode] = useState<"login" | "signUp">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading2, setLoading2] = useState(false);
  const [linkState, setlinkState] = useState("");
  const [currentUser, setcurrentUser] = useState(
    user.profile?.username! + user.profile?.full_name
  );

  const [isLoggedInv2, setisLoggedIn] = useState(isLoggedIn);

  const handleSubmit = () => {
    if (mode === "login") {
      onLogin({ email, password });
    } else {
      onSignUp({ email, password, options: { data: { username } } });
    }
  };

  const onSignInWithGoogle = async () => {
    setLoading2(true);
    try {
      const url = await getGoogleOAuthUrl!();
      if (!url) return;
      console.log({ url });

      const link = Linking.createURL("/Home");
      setlinkState(link);
      // console.log({ link });

      const result = await WebBrowser.openAuthSessionAsync(
        url,
        // "exp://127.0.0.1:19000/",
        // "mysupabaseappv2://google-auth?",
        // link,
        "supabook://",
        // "https://www.facebook.com/",
        // "exp://128.0.0.1:8081/--/google-auth",
        {
          showInRecents: true,
        }
      );
      console.log({ result });
      // console.log(Linking.createURL("google-auth"));

      if (result.type === "success") {
        const data = extractParamsFromUrl(result.url);

        if (!data.access_token || !data.refresh_token) return;

        setOAuthSession!({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        // You can optionally store Google's access token if you need it later
        // SecureStore.setItemAsync(
        //   "google-access-token",
        //   JSON.stringify(data.provider_token)
        // );
      }
    } catch (error: any) {
      // Handle error here
      // console.log(error);
      Alert.alert(error.message);
    } finally {
      setLoading2(false);
    }
  };

  const extractParamsFromUrl = (url: string) => {
    const params = new URLSearchParams(url.split("#")[1]);
    const data = {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
    };

    return data;
  };

  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Supabook</Text>
        {mode === "signUp" && (
          <View style={styles.input}>
            <TextInput
              placeholder="Nombre de usuario"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        )}
        <View style={styles.input}>
          <TextInput
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.input}>
          <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.input}>
          <Button
            title={mode === "login" ? "Iniciar sesión" : "Registrarse"}
            onPress={handleSubmit}
            disabled={loading || !email || !password}
          />
        </View>
        <View style={styles.footer}>
          <Text style={{ marginBottom: 8 }}>
            {mode === "login"
              ? "¿No tienes una cuenta?"
              : "¿Ya tienes una cuenta?"}
          </Text>
          <Button
            title={mode === "login" ? "Regístrate" : "Inicia sesión"}
            onPress={() => setMode(mode === "login" ? "signUp" : "login")}
          />
        </View>
        <Button
          disabled={loading2}
          onPress={() => onSignInWithGoogle()}
          title={loading2 ? "Loading2..." : "Sign in with Google"}
        />
        <Text>IsLoggedIn?: </Text>
        <Text>{isLoggedInv2}</Text>
        <Text>Current User:</Text>
        <Text>{currentUser}</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginTop: 50,
  },
  inner: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
    marginTop: 16,
  },
  input: {
    paddingVertical: 8,
  },
  footer: {
    paddingTop: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
