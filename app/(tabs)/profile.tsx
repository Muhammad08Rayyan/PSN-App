import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '@/utils/api-config';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const menuItems = [
  { title: "President's Message", screen: '/presidents-message' },
  { title: "About PSN", screen: '/about-psn' },
  { title: "Events", screen: '/events' },
  { title: "Research & Publications", screen: '/research' },
  { title: "Online Courses", screen: '/courses' },
  { title: "Case Discussion Forum", screen: '/case-discussion' },
  { title: "Projects", screen: '/projects' },
  { title: "Training", screen: '/training' },
  { title: "Jobs", screen: '/jobs' },
  { title: "Contact Us", screen: '/contact-us' },
  { title: "Privacy Policy", screen: '/privacy-policy' },
  { title: "Terms & Conditions", screen: '/terms-conditions' },
];

export default function ProfileScreen() {
  const { user, logout, updateProfilePicture, deleteProfilePicture } = useAuth();
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleMenuItem = (item: any) => {
    if (item.screen) {
      router.push(item.screen);
    }
  };

  const handleProfileImagePress = () => {
    const options = [
      'Change Profile Picture',
      'Delete Profile Picture',
      'Cancel'
    ];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          handleImageAction(buttonIndex);
        }
      );
    } else {
      // For Android, show simple alert
      Alert.alert(
        'Profile Picture Options',
        'Choose an action',
        [
          { text: 'Change', onPress: () => handleImageAction(0) },
          { text: 'Delete', onPress: () => handleImageAction(1), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleImageAction = async (actionIndex: number) => {
    switch (actionIndex) {
      case 0: // Change
        await pickImage();
        break;
      case 1: // Delete
        await deleteProfileImage();
        break;
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to change your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setIsUpdatingImage(true);
      const result = await updateProfilePicture(imageUri);

      if (result.success) {
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile picture');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const deleteProfileImage = async () => {
    try {
      setIsUpdatingImage(true);
      const result = await deleteProfilePicture();

      if (result.success) {
        Alert.alert('Success', 'Profile picture deleted successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to delete profile picture');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete profile picture');
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const formatDate = (dateString: string | { $date: { $numberLong: string } }) => {
    try {
      let date: Date;
      if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (dateString?.$date?.$numberLong) {
        date = new Date(parseInt(dateString.$date.$numberLong));
      } else {
        return 'Not provided';
      }
      return date.toLocaleDateString();
    } catch {
      return 'Not provided';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={handleProfileImagePress}
              disabled={isUpdatingImage}
            >
              {user?.profilePic || user?.profile_image ? (
                <Image
                  source={{ uri: user.profilePic || user.profile_image }}
                  style={styles.profileImagePhoto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'U'}
                  </Text>
                </View>
              )}
              {isUpdatingImage && (
                <View style={styles.imageLoadingOverlay}>
                  <Text style={styles.imageLoadingText}>Updating...</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
              {user?.membershipNumber && (
                <View style={styles.membershipBadge}>
                  <Text style={styles.membershipNumber}>Member #{user.membershipNumber}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Professional Information */}
        {(user?.designation || user?.specialty || user?.highestQualification || user?.instName || user?.city || user?.pmdcNumber) && (
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Professional Information</Text>

            {user?.designation && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Designation</Text>
                <Text style={styles.infoValue}>{user.designation}</Text>
              </View>
            )}

            {user?.specialty && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Specialty</Text>
                <Text style={styles.infoValue}>{user.specialty}</Text>
              </View>
            )}

            {user?.highestQualification && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Qualification</Text>
                <Text style={styles.infoValue}>{user.highestQualification}</Text>
              </View>
            )}

            {user?.instName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Institution</Text>
                <Text style={styles.infoValue}>{user.instName}</Text>
              </View>
            )}

            {user?.city && user?.province && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{user.city}, {user.province}</Text>
              </View>
            )}

            {user?.pmdcNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>PMDC Number</Text>
                <Text style={styles.infoValue}>{user.pmdcNumber}</Text>
              </View>
            )}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleMenuItem(item)}
            >
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Organization Info */}
        <View style={styles.organizationCard}>
          <Text style={styles.organizationName}>Pakistan Society of Neurology</Text>
          <Text style={styles.organizationSubtitle}>Promoting Excellence in Neurology</Text>

          <View style={styles.statsContainer}>
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
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Helix Pharma</Text>
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    position: 'relative',
  },
  profileInfo: {
    flex: 1,
  },
  profileImagePhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#6C757D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6C757D',
    marginBottom: 8,
  },
  membershipBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipNumber: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemText: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#6C757D',
    fontWeight: '300',
  },
  organizationCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  organizationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 4,
  },
  organizationSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
  },
});