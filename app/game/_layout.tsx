import { Stack } from 'expo-router';
import { GameProvider } from '@/contexts/GameContext';

export default function GameLayout() {
  return (
    <GameProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </GameProvider>
  );
}
