import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

const handleEmailPress = () => {
  Linking.openURL('mailto:info@pakneurology.com');
};

const handlePhonePress = () => {
  Linking.openURL('tel:+922134310578');
};

const handleLocationPress = () => {
  const address = 'PSN House, 706, Block 7-8, Anum Estate, Darul Aman Society, Shahrah-e-Faisal, Karachi, Pakistan';
  const encodedAddress = encodeURIComponent(address);
  Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
};

const handleBack = () => {
  router.back();
};

export default function ContactUsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Contact Us</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.introText}>
            We'd love to hear from you. Contact the Pakistan Society of Neurology for any inquiries,
            membership information, or collaboration opportunities.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleLocationPress}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>🗺️</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactText}>
                PSN House, 706, Block 7-8{'\n'}
                Anum Estate, Darul Aman Society{'\n'}
                Shahrah-e-Faisal, Karachi{'\n'}
                Pakistan
              </Text>
              <Text style={styles.tapHint}>Tap to open in maps</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactText}>+92 21 34310578</Text>
              <Text style={styles.tapHint}>Tap to call</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>✉️</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactText}>info@pakneurology.com</Text>
              <Text style={styles.tapHint}>Tap to send email</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Office Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Office Hours</Text>
          <View style={styles.hoursContainer}>
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Monday - Friday</Text>
              <Text style={styles.timeText}>9:00 AM - 5:00 PM</Text>
            </View>
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Saturday</Text>
              <Text style={styles.timeText}>9:00 AM - 1:00 PM</Text>
            </View>
            <View style={styles.hourRow}>
              <Text style={styles.dayText}>Sunday</Text>
              <Text style={[styles.timeText, styles.closedText]}>Closed</Text>
            </View>
          </View>
        </View>

        {/* How We Can Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Can Help</Text>
          <View style={styles.helpList}>
            <Text style={styles.helpItem}>• Membership Information</Text>
            <Text style={styles.helpItem}>• Event Registration</Text>
            <Text style={styles.helpItem}>• Research Collaboration</Text>
            <Text style={styles.helpItem}>• Educational Programs</Text>
            <Text style={styles.helpItem}>• General Questions</Text>
            <Text style={styles.helpItem}>• Technical Support</Text>
          </View>
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
  introText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  contactIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: '#1976D2',
    fontStyle: 'italic',
  },
  hoursContainer: {
    marginTop: 8,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  dayText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '600',
  },
  closedText: {
    color: '#DC3545',
  },
  helpList: {
    marginTop: 8,
  },
  helpItem: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 28,
    marginBottom: 8,
  },
});