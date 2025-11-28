import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>{/* Splash, Auth, Onboarding, Tabs */}</Stack>
  );
}
