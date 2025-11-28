import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen name="index" options={{ title: 'Prombūtne' }} />
      <Tabs.Screen name="adddata" options={{ title: 'Pievienot datus' }} />
      <Tabs.Screen name="staff" options={{ title: 'Personāls' }} />
    </Tabs>
  );
}
