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
  saveProfile?: (updatedProfile: Profile) => void;
}

const UserContext = createContext<UserInfo>({
  session: null,
  profile: null,
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
  });

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

  useEffect(() => {
    getProfile();
  }, [userInfo.session]);

  const saveProfile = async (updatedProfile: Profile) => {
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", userInfo.profile?.id);
    if (error) {
      Alert.alert("Server Error", error.message);
    } else {
      getProfile();
    }

    setLoading(false);
  };

  useProtectedRoute(userInfo);

  return (
    <UserContext.Provider value={{ ...userInfo, loading, saveProfile }}>
      {children}
    </UserContext.Provider>
  );
}

// crear un hook reutilizable que utilice el context
export function useUserInfo() {
  return useContext(UserContext);
}
