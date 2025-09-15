import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, Pressable, Animated, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width, height } = Dimensions.get('window');

interface PlusOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export default function PlusOverlay({ visible, onClose }: PlusOverlayProps) {
  const slideAnim = useState(new Animated.Value(height))[0];
  const overlayOpacity = useState(new Animated.Value(0))[0];
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      // Reset animations
      slideAnim.setValue(height);
      overlayOpacity.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');

  const menuItems = [
    { icon: 'calendar', title: 'Events', route: '/events', color: '#FF6B6B' },
    { icon: 'book', title: 'Courses', route: '/courses', color: '#4ECDC4' },
    { icon: 'school', title: 'Training', route: '/training', color: '#45B7D1' },
    { icon: 'briefcase', title: 'Jobs', route: '/jobs', color: '#96CEB4' },
    { icon: 'flask', title: 'Research', route: '/research', color: '#FFEAA7' },
    { icon: 'folder', title: 'Projects', route: '/projects', color: '#DDA0DD' },
    { icon: 'chatbubbles', title: 'Case Discussion', route: '/case-discussion', color: '#98D8C8' },
    { icon: 'chatbox', title: 'Chat', route: '/chat', color: '#F7DC6F' },
  ];

  const handleMenuPress = (route: string, title: string) => {
    // Animate out first, then navigate
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
      router.push(route as any);
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />

      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity }
        ]}
      >
        <Pressable style={styles.overlayTouchable} onPress={handleClose}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: cardBackground,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Handle Bar */}
            <ThemedView style={[styles.handleBar, { backgroundColor: borderColor }]} />

            {/* Header */}
            <ThemedView style={styles.header}>
              <ThemedView style={styles.headerContent}>
                <ThemedView style={[styles.headerIcon, { backgroundColor: tintColor + '20' }]}>
                  <Ionicons name="apps" size={24} color={tintColor} />
                </ThemedView>
                <ThemedView style={styles.headerText}>
                  <ThemedText type="title" style={styles.title}>Quick Access</ThemedText>
                  <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
                    Navigate to any section
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Menu Grid */}
            <ThemedView style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, { backgroundColor: backgroundSecondary }]}
                  onPress={() => handleMenuPress(item.route, item.title)}
                  activeOpacity={0.7}
                >
                  <ThemedView style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                  </ThemedView>
                  <ThemedText style={styles.menuText}>{item.title}</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={textSecondary} style={styles.chevron} />
                </TouchableOpacity>
              ))}
            </ThemedView>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: backgroundSecondary }]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color={iconColor} />
              <ThemedText style={[styles.closeText, { color: iconColor }]}>Close</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: height * 0.75,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});