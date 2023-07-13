// import "react-native-url-polyfill/auto";

import { Stack } from "expo-router";

export default function RootLayoutNav() {
  return (
    <>
      <Stack>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
