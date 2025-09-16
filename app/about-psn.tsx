import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const handleBack = () => {
  router.back();
};

export default function AboutPSNScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About PSN</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.introText}>
            Established nearly three decades ago, PSN represents the official voice of Pakistani neurologists,
            committed to advancing neurological care and research excellence throughout Pakistan.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            Promoting excellence in clinical neurology, research, and education while fostering collaboration
            among neurologists across Pakistan to improve patient care standards and advance neurological sciences.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.text}>
            To be the leading professional organization representing Pakistani neurologists, advancing the field
            of neurology through continuous education, research excellence, and improved patient care standards.
          </Text>
        </View>

        {/* Impact Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>314</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Annual Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>22</Text>
              <Text style={styles.statLabel}>Research Papers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>34</Text>
              <Text style={styles.statLabel}>Partner Hospitals</Text>
            </View>
          </View>
        </View>

        {/* Key Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Initiatives</Text>
          <View style={styles.activitiesList}>
            <Text style={styles.activityItem}>• Annual International Neurology Updates</Text>
            <Text style={styles.activityItem}>• Research & Clinical Guidelines Development</Text>
            <Text style={styles.activityItem}>• Continuing Medical Education Programs</Text>
            <Text style={styles.activityItem}>• National Stroke Registry</Text>
            <Text style={styles.activityItem}>• Professional Networking Events</Text>
            <Text style={styles.activityItem}>• Educational Webinars and Workshops</Text>
          </View>
        </View>

        {/* Membership Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join PSN</Text>
          <Text style={styles.text}>
            We invite neurologists with postgraduate qualifications to register for PSN Membership
            to strengthen our professional network and enhance neurology advocacy in Pakistan.
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
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
  introText: {
    fontSize: 16,
    color: '#212529',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
  },
  activitiesList: {
    marginTop: 16,
  },
  activityItem: {
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