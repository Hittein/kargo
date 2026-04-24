import { Stack } from 'expo-router';

export default function RentalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="filters" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
