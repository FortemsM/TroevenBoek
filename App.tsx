import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Root component of TroevenBoek.
 *
 * In React Native:
 * - <View> is similar to an HTML <div> (uses Flexbox layout by default, with flexDirection: 'column').
 * - <Text> is required for any text strings (unlike HTML where text can sit directly inside a <div>).
 * - StyleSheet.create() defines CSS-like styles using camelCase properties (e.g., backgroundColor).
 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.suits}>♠️ ♥️ ♣️ ♦️</Text>
      <Text style={styles.title}>TroevenBoek</Text>
      <Text style={styles.subtitle}>
        Belgian Card Game Scorekeeper
      </Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f2e1e', // Classic dark green card-table felt color
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  suits: {
    fontSize: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#a7f3d0',
    textAlign: 'center',
  },
});
