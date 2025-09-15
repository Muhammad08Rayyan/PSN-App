import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

export default function PresidentsMessageScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>President's Message</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <Image
              source={require('@/assets/images/NailaShaibaz.jpeg')}
              style={styles.presidentImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <Text style={styles.title}>President's Message</Text>
        <Text style={styles.subtitle}>Professor Naila N. Shahbaz - President, PSN</Text>

        <View style={styles.contentCard}>
          <Text style={styles.greeting}>Dear Esteemed Colleagues,</Text>

          <Text style={styles.message}>
            It gives me immense pleasure to welcome you to the Pakistan Society of Neurology (PSN) mobile application. As the President of PSN, I am proud to share that our organization has been the official representative body for Pakistani neurologists for nearly three decades.
            {'\n\n'}
            Our society stands at the forefront of neurological advancement in Pakistan, committed to promoting excellence in clinical neurology, research, and education. Through this platform, we aim to strengthen our professional network and enhance neurology advocacy across the nation.
            {'\n\n'}
            We cordially invite all neurologists with postgraduate qualifications to register for PSN Membership. Together, we can advance the field of neurology, improve patient care standards, and contribute to the global neurological community.
            {'\n\n'}
            This mobile application represents our commitment to embracing technology to better serve our members. Here, you will find opportunities for professional networking, access to latest research, educational resources, and updates on our events and initiatives.
            {'\n\n'}
            I encourage you to actively participate in our society's activities and contribute to the advancement of neurological sciences in Pakistan. Together, we can achieve remarkable milestones in neurology and make a lasting impact on healthcare in our beloved country.
            {'\n\n'}
            With warm regards and best wishes for your continued success.
          </Text>

          <View style={styles.signature}>
            <Text style={styles.signatureName}>Professor Naila N. Shahbaz</Text>
            <Text style={styles.signatureTitle}>President</Text>
            <Text style={styles.signatureOrg}>Pakistan Society of Neurology</Text>
          </View>
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
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#212529',
    fontWeight: 'bold',
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
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  presidentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
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
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 16,
    textAlign: 'left',
  },
  message: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 24,
  },
  signature: {
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.accent,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  signatureOrg: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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