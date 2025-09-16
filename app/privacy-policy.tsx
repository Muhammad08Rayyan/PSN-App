import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const handleBack = () => {
  router.back();
};

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: September 15, 2025</Text>
        </View>

        {/* Information Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, such as when you register for membership,
            create an account, participate in our events, or contact us.
          </Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.listItem}>• Professional information (medical qualifications, institution)</Text>
            <Text style={styles.listItem}>• Account information (username, password)</Text>
            <Text style={styles.listItem}>• Communication preferences</Text>
            <Text style={styles.listItem}>• Event participation and feedback</Text>
          </View>
        </View>

        {/* How We Use Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.text}>
            We use the information we collect to enhance your experience and provide our services effectively:
          </Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Provide and maintain our services</Text>
            <Text style={styles.listItem}>• Process membership applications</Text>
            <Text style={styles.listItem}>• Send you important updates and announcements</Text>
            <Text style={styles.listItem}>• Organize events and educational programs</Text>
            <Text style={styles.listItem}>• Improve our services and user experience</Text>
            <Text style={styles.listItem}>• Comply with legal obligations</Text>
          </View>
        </View>

        {/* Information Sharing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing</Text>
          <Text style={styles.text}>
            We do not sell, trade, or otherwise transfer your personal information to third parties without
            your consent, except as described in this policy.
          </Text>
          <Text style={styles.subheading}>We may share information with:</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Service providers who assist in our operations</Text>
            <Text style={styles.listItem}>• Legal authorities when required by law</Text>
            <Text style={styles.listItem}>• Other members in the directory (with your consent)</Text>
          </View>
        </View>

        {/* Data Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate security measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. However, no method of
            transmission over the internet is 100% secure.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.text}>
            You have the following rights regarding your personal information:
          </Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Access your personal information</Text>
            <Text style={styles.listItem}>• Correct inaccurate information</Text>
            <Text style={styles.listItem}>• Request deletion of your information</Text>
            <Text style={styles.listItem}>• Opt out of certain communications</Text>
            <Text style={styles.listItem}>• File a complaint with data protection authorities</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactText}>Email: info@pakneurology.com</Text>
          <Text style={styles.contactText}>Phone: +92 21 34310578</Text>
          <Text style={styles.contactText}>Address: PSN House, Karachi</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: '#212529',
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 28,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
});