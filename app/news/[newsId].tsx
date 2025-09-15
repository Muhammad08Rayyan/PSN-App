import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/utils/api-config';
import axios from 'axios';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  published_at: string;
  timestamp: string;
  createdBy: string;
}

export default function NewsDetailScreen() {
  const { newsId } = useLocalSearchParams<{ newsId: string }>();
  const { getAuthHeaders } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const cardBackground = useThemeColor({}, 'cardBackground');

  // Fetch news article details
  useEffect(() => {
    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  const fetchNewsDetail = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/news/${newsId}`, {
        headers
      });

      if (response.data) {
        setArticle(response.data);
      }
    } catch (error) {
      console.error('Error fetching news detail:', error);
      Alert.alert('Error', 'Failed to load article details');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!article) return;

    try {
      await Share.share({
        message: `${article.title}\n\n${article.description}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <ThemedText style={[styles.loadingText, { color: textSecondary }]}>
            Loading article...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={80} color={textSecondary} />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Article Not Found
          </ThemedText>
          <ThemedText style={[styles.errorText, { color: textSecondary }]}>
            The requested article could not be found or has been removed.
          </ThemedText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primary }]}
            onPress={handleBack}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Image with Overlay Back Button */}
        {article.image_url ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: article.image_url }}
              style={styles.featuredImage}
              resizeMode="cover"
              onError={() => {
                // Handle image load error by showing placeholder
                setArticle(prev => prev ? {...prev, image_url: undefined} : null);
              }}
            />
            {/* Back Button Overlay */}
            <TouchableOpacity onPress={handleBack} style={styles.backButtonOverlay}>
              <ThemedText style={[styles.backArrowText, { color: primary }]}>←</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noImageContainer}>
            {/* Back Button for no image case */}
            <TouchableOpacity onPress={handleBack} style={styles.backButtonNoImage}>
              <ThemedText style={[styles.backArrowText, { color: primary }]}>←</ThemedText>
            </TouchableOpacity>
            {/* Placeholder Image */}
            <View style={[styles.placeholderImage, { backgroundColor: primary + '15' }]}>
              <IconSymbol name="newspaper.fill" size={80} color={primary + '60'} />
              <ThemedText style={[styles.placeholderText, { color: textSecondary }]}>
                No Image Available
              </ThemedText>
            </View>
          </View>
        )}

        <View style={[styles.articleContainer, !article.image_url && styles.articleContainerNoImage]}>
          {/* Article Header */}
          <View style={styles.articleHeader}>
            <ThemedText style={[styles.title, { color: textColor }]}>
              {article.title}
            </ThemedText>

            <View style={[styles.metaData, { borderColor: textSecondary + '20' }]}>
              <View style={styles.authorInfo}>
                <IconSymbol name="checkmark.seal.fill" size={16} color={primary} />
                <ThemedText style={[styles.author, { color: primary }]}>
                  {article.createdBy}
                </ThemedText>
              </View>

              <View style={styles.dateInfo}>
                <IconSymbol name="clock" size={16} color={textSecondary} />
                <ThemedText style={[styles.publishDate, { color: textSecondary }]}>
                  {article.timestamp}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Article Body */}
          <View style={styles.articleBody}>
            <ThemedText style={[styles.description, { color: textColor }]}>
              {article.description}
            </ThemedText>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primary + '15', borderColor: primary + '30' }]}
              onPress={handleShare}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color={primary} />
              <ThemedText style={[styles.actionButtonText, { color: primary }]}>
                Share Article
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    opacity: 0.8,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonTop: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 16,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backArrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10
  },
  noImageContainer: {
    position: 'relative',
    height: Math.min(280, screenHeight * 0.35),
  },
  noImageHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButtonNoImage: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 80,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    position: 'relative',
  },
  featuredImage: {
    width: screenWidth,
    height: Math.min(280, screenHeight * 0.35),
  },
  articleContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  articleContainerNoImage: {
    paddingTop: 0,
  },
  articleHeader: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  publishDate: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  articleBody: {
    paddingTop: 24,
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    textAlign: 'left',
  },
  actionButtons: {
    paddingTop: 32,
    paddingBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});