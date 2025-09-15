import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

export default function CoursesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Online Courses</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <IconSymbol name="graduationcap" size={60} color="white" />
          </View>
        </View>

        <Text style={styles.title}>Online Courses</Text>
        <Text style={styles.subtitle}>Learn at your own pace</Text>

        <View style={styles.contentCard}>
          <View style={styles.statusBadge}>
            <IconSymbol name="clock" size={16} color="#FF9500" />
            <Text style={styles.statusText}>Coming Soon</Text>
          </View>

          <Text style={styles.message}>
            Access comprehensive online educational resources and training programs.
            {'\n\n'}
            This section will offer:
            {'\n'}• Interactive video lectures
            {'\n'}• CME-accredited courses
            {'\n'}• Certification programs
            {'\n'}• Case-based learning
            {'\n'}• Expert-led webinars
            {'\n'}• Self-paced modules
            {'\n\n'}
            Enhance your neurological expertise through flexible online learning.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pakistan Society of Neurology</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.accent,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF9500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    marginLeft: 6,
  },
  message: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    textAlign: 'left',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});