import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function JobsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <IconSymbol name="briefcase" size={60} color={Colors.light.primary} />
          <Text style={styles.title}>Jobs</Text>
        </View>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            Coming Soon...
            {'\n\n'}
            This section will feature job opportunities and career openings in the field of neurology.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  messageContainer: {
    backgroundColor: Colors.light.accent,
    borderRadius: 12,
    padding: 20,
  },
  message: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    textAlign: 'center',
  },
});