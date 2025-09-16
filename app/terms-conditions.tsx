import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const handleBack = () => {
  router.back();
};

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Terms & Conditions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: September 15, 2025</Text>
        </View>

        {/* Acceptance of Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
          <Text style={styles.text}>
            By using the Pakistan Society of Neurology (PSN) mobile application and services, you agree to be
            bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
          </Text>
        </View>

        {/* Membership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Requirements</Text>
          <Text style={styles.text}>
            PSN membership is open to qualified neurologists with appropriate postgraduate qualifications.
          </Text>
          <Text style={styles.subheading}>Members must:</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Provide accurate and complete information</Text>
            <Text style={styles.listItem}>• Maintain current professional credentials</Text>
            <Text style={styles.listItem}>• Comply with professional ethics and standards</Text>
            <Text style={styles.listItem}>• Pay applicable membership fees</Text>
            <Text style={styles.listItem}>• Participate in society activities respectfully</Text>
          </View>
        </View>

        {/* App Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Usage</Text>
          <Text style={styles.text}>
            Users of the PSN app agree to use the platform responsibly and professionally.
          </Text>
          <Text style={styles.subheading}>Usage guidelines:</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Use the app for professional purposes only</Text>
            <Text style={styles.listItem}>• Respect other members&apos; privacy and professional dignity</Text>
            <Text style={styles.listItem}>• Not share inappropriate or offensive content</Text>
            <Text style={styles.listItem}>• Maintain confidentiality of patient information</Text>
            <Text style={styles.listItem}>• Report any misuse or violations to PSN administrators</Text>
          </View>
        </View>

        {/* Intellectual Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.text}>
            All content, materials, and resources provided through PSN services are the property of PSN or its licensors.
          </Text>
          <Text style={styles.subheading}>Users may not:</Text>
          <View style={styles.listContainer}>
            <Text style={styles.listItem}>• Reproduce or distribute content without permission</Text>
            <Text style={styles.listItem}>• Use PSN branding or materials for commercial purposes</Text>
            <Text style={styles.listItem}>• Claim ownership of PSN intellectual property</Text>
          </View>
        </View>

        {/* Professional Conduct */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Conduct</Text>
          <Text style={styles.text}>
            All members and users must maintain the highest standards of professional conduct. Any behavior
            that violates medical ethics, professional standards, or these terms may result in suspension
            or termination of membership.
          </Text>
        </View>

        {/* Limitation of Liability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.text}>
            PSN provides services &quot;as is&quot; without warranties. We are not liable for any indirect, incidental,
            or consequential damages arising from the use of our services. Medical decisions should always be
            based on professional judgment and not solely on information from PSN platforms.
          </Text>
        </View>

        {/* Modification of Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modification of Terms</Text>
          <Text style={styles.text}>
            PSN reserves the right to modify these terms at any time. Users will be notified of significant
            changes, and continued use of services constitutes acceptance of modified terms.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about these Terms and Conditions, please contact us at:
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