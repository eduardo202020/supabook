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
}
type SupabaseContextProps = {
  isLoggedIn: boolean;
  user: UserInfo;
  loading: boolean;
  saveProfile?: (updatedProfile: Profile, avatarUpdated: boolean) => void;
  signOut: () => Promise<void>;
  getGoogleOAuthUrl: () => Promise<string | null>;
  setOAuthSession: (tokens: {
    access_token: string;
    refresh_token: string;
  }) => Promise<void>;
};

const UserContext = createContext<SupabaseContextProps>({
  user: { session: null, profile: null },
  loading: false,
  getGoogleOAuthUrl: async () => "",
  setOAuthSession: async () => {},
  isLoggedIn: false,
  signOut: async () => {},
});

function useProtectedRoute(user: UserInfo) {
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
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUserInfo({ session, profile: null });
    });
  }, []);

  // login with google
  const getGoogleOAuthUrl = async (): Promise<string | null> => {
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "supabook://home",
      },
    });

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

    if (error) {
      Alert.alert(error.message);
    }

    setIsLoggedIn(data.session !== null);
  };
  /////////

  // obtiene los datos del profile cada vez que este cambia
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

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    setUserInfo({ profile: null, session: null });
    setIsLoggedIn(false);

    if (error) throw error;
  }

  return (
    <UserContext.Provider
      value={{
        user: userInfo,
        saveProfile,
        setOAuthSession,
        getGoogleOAuthUrl,
        isLoggedIn,
        signOut,
        loading,
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
