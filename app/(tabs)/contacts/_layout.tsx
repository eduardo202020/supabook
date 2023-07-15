import { Stack } from "expo-router";

export default function RootLayoutNav() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{}} />
        <Stack.Screen name="[contact]" />
      </Stack>
    </>
  );
}
