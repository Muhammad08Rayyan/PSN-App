import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const memberName = params.memberName as string || 'Member';

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const accent = useThemeColor({}, 'accent');

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={[styles.header, { borderBottomColor: accent }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <ThemedText type="subtitle" style={styles.headerName}>
              {memberName}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Chat Area - Empty for now */}
        <View style={styles.chatArea}>
          <View style={styles.emptyState}>
            <IconSymbol name="message" size={80} color={accent} />
            <ThemedText style={styles.emptyTitle}>Chat Feature</ThemedText>
            <ThemedText style={styles.emptyText}>
              This is a basic chat interface.{'\n'}
              Chat functionality will be implemented later.
            </ThemedText>
          </View>
        </View>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ThemedView style={[styles.inputContainer, { backgroundColor: accent }]}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Type a message..."
                placeholderTextColor={`${textColor}80`}
                multiline
                editable={false}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: primary }]}
                disabled={true}
                activeOpacity={0.7}
              >
                <IconSymbol name="paperplane.fill" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    marginRight: 12,
    opacity: 0.5,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
});