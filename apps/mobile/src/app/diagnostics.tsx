import { Stack } from 'expo-router';
import { DiagnosticsScreen } from '../features/diagnostics/DiagnosticsScreen';

export default function DiagnosticsRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Diagnostics', presentation: 'modal' }} />
      <DiagnosticsScreen />
    </>
  );
}
