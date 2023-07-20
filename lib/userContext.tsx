import { Session } from "@supabase/supabase-js";
import { Alert } from "react-native";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./supabase";
import { useRouter, useSegments } from "expo-router";
import { Profile } from "./api";

// definir context para guardar el session y el profile
export interface UserProfile {
  username: string | null;
  avatarUrl?: string;
}

export interface UserInfo {
  session: Session | null;
  profile: Profile | null;
  loading?: boolean;
  saveProfile?: (updatedProfile: Profile, avatarUpdated: boolean) => void;
  getGoogleOAuthUrl?: () => Promise<string | null>;
  setOAuthSession?: (tokens: {
    access_token: string;
    refresh_token: string;
  }) => Promise<void>;
}

const UserContext = createContext<UserInfo>({
  session: null,
  profile: null,
  getGoogleOAuthUrl: async () => "",
  setOAuthSession: async () => {},
});

function useProtectedRoute(user: any) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";

    if (
      // If the user is not signed in and the initial segment is not anything in the auth group.
      !user.session &&
      !inAuthGroup
    ) {
      // Redirect to the sign-in page.

      router.replace("/sign-in");
    } else if (user.session && inAuthGroup) {
      // Redirect away from the sign-in page.

      router.replace("/");
    }
  }, [user, segments]);
}

// crear un provider donde vamos a tener la logica para escuchar cambios de la session
export function AuthProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    session: null,
    profile: null,
    getGoogleOAuthUrl: async () => "",
    setOAuthSession: async () => {},
  });
  const [isLoggedIn, setLoggedIn] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUserInfo({ session, profile: null });
    });
  }, []);

  const getProfile = async () => {
    if (!userInfo.session) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userInfo.session.user.id);
    if (error) {
      console.log(error);
    } else {
      setUserInfo({ ...userInfo, profile: data[0] });
    }
  };

  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "supabook://home",
      },
    });
    console.log({ result });

    return result.data.url;
  };

  const setOAuthSession = async (tokens: {
    access_token: string;
    refresh_token: string;
  }) => {
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) throw error;

    setLoggedIn(data.session !== null);
  };

  useEffect(() => {
    getProfile();
  }, [userInfo.session]);

  const saveProfile = async (
    updatedProfile: Profile,
    avatarUpdated: boolean
  ) => {
    setLoading(true);

    try {
      if (updatedProfile.avatar_url && avatarUpdated) {
        const { avatar_url } = updatedProfile;

        const fileExt = avatar_url.split(".").pop();
        const fileName = avatar_url.replace(/^.*[\\\/]/, "");
        const filePath = `${Date.now()}.${fileExt}`;

        const formData = new FormData();
        const photo = {
          uri: avatar_url,
          name: fileName,
          type: `image/${fileExt}`,
        } as unknown as Blob;
        formData.append("file", photo);

        const { error } = await supabase.storage
          .from("avatars")
          .upload(filePath, formData);
        if (error) {
          throw error;
        }
        updatedProfile.avatar_url = filePath;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", userInfo.profile?.id);
      if (error) {
        throw error;
      } else {
        getProfile();
      }
    } catch (error: any) {
      Alert.alert("Server Error", error.message);
    }

    setLoading(false);
  };

  useProtectedRoute(userInfo);

  return (
    <UserContext.Provider
      value={{
        ...userInfo,
        loading,
        saveProfile,
        setOAuthSession,
        getGoogleOAuthUrl,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// crear un hook reutilizable que utilice el context
export function useUserInfo() {
  return useContext(UserContext);
}
