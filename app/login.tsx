import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/psn-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.title}>Pakistan Society of Neurology</ThemedText>
          </View>

          <View style={styles.formContainer}>
            <ThemedText type="title" style={styles.loginTitle}>Login</ThemedText>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textSecondary, backgroundColor: backgroundColor }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textSecondary, backgroundColor: backgroundColor }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotButton}>
            <ThemedText style={[styles.forgotText, { color: primary }]}>Forgot Password?</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: primary }, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.loginButtonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>
        </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>Powered by Helix Pharma</ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: screenHeight - 100, // Ensure full screen usage
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: screenHeight * 0.08, // Responsive top margin
    marginBottom: screenHeight * 0.06, // Responsive bottom margin
  },
  logo: {
    width: Math.min(120, screenHeight * 0.15), // Responsive logo size
    height: Math.min(120, screenHeight * 0.15),
    marginBottom: 16,
  },
  title: {
    fontSize: Math.min(20, screenHeight * 0.025), // Responsive font size
    fontWeight: '600',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loginTitle: {
    fontSize: Math.min(28, screenHeight * 0.035), // Responsive font size
    marginBottom: screenHeight * 0.04, // Responsive margin
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: screenHeight * 0.025, // Responsive margin
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Math.max(12, screenHeight * 0.015), // Responsive padding
    fontSize: Math.min(16, screenHeight * 0.02), // Responsive font size
    minHeight: 48, // Ensure minimum touch target
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: screenHeight * 0.04, // Responsive margin
    paddingVertical: 8,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 8,
    paddingVertical: Math.max(16, screenHeight * 0.02), // Responsive padding
    alignItems: 'center',
    minHeight: 50, // Ensure minimum touch target
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: Math.min(18, screenHeight * 0.022), // Responsive font size
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: screenHeight * 0.03, // Responsive margin
    paddingBottom: 20,
  },
  footerText: {
    fontSize: Math.min(14, screenHeight * 0.018), // Responsive font size
    fontWeight: '500',
  },
});