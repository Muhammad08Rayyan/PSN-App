import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';

export default function VerifyResetCodeScreen() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const resetCode = params.resetCode as string; // For demo purposes

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verifyResetCode } = useAuth();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (code.trim().length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const success = await verifyResetCode(email, code.trim());
      if (success) {
        // Navigate to new password screen
        router.push({
          pathname: '/new-password',
          params: {
            email: email,
            code: code.trim()
          }
        });
      } else {
        Alert.alert('Error', 'Invalid or expired verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ThemedText style={[styles.backText, { color: primary }]}>← Back</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ThemedText type="title" style={styles.title}>Verify Code</ThemedText>
            <ThemedText style={styles.subtitle}>
              We've sent a 6-digit verification code to{'\n'}
              <ThemedText style={[styles.emailText, { color: primary }]}>{email}</ThemedText>
            </ThemedText>

            {/* Demo: Show the reset code */}
            {resetCode && (
              <View style={styles.demoContainer}>
                <ThemedText style={styles.demoLabel}>Demo Reset Code:</ThemedText>
                <ThemedText style={[styles.demoCode, { color: primary }]}>{resetCode}</ThemedText>
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Verification Code</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textSecondary, backgroundColor: backgroundColor }]}
                value={code}
                onChangeText={setCode}
                placeholder="Enter 6-digit code"
                placeholderTextColor={textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, { backgroundColor: primary }, isLoading && styles.verifyButtonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading}
            >
              <ThemedText style={styles.verifyButtonText}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResendCode} style={styles.resendButton}>
              <ThemedText style={[styles.resendText, { color: primary }]}>Didn't receive code? Resend</ThemedText>
            </TouchableOpacity>
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
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
  },
  demoContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  demoCode: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  inputContainer: {
    marginBottom: 30,
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
    paddingVertical: 12,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
  },
  verifyButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
});