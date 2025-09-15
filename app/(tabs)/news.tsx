import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/utils/api-config';
import { router } from 'expo-router';
import axios from 'axios';

const { height: screenHeight } = Dimensions.get('window');

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  published_at: string;
  timestamp: string;
  createdBy: string;
}

export default function NewsScreen() {
  const { getAuthHeaders } = useAuth();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const primary = useThemeColor({}, 'primary');
  const cardBackground = useThemeColor({}, 'cardBackground');

  // Fetch news from API
  const fetchNews = useCallback(async (pageNum = 1, append = false) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/news?page=${pageNum}&limit=10`, {
        headers
      });

      if (response.data.news) {
        const newNews = response.data.news;
        if (append) {
          setNews(prev => [...prev, ...newNews]);
        } else {
          setNews(newNews);
        }
        setHasMore(response.data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      console.error('API URL:', `${API_BASE_URL}/news`);
      console.error('Headers:', await getAuthHeaders());
      if (!append) {
        Alert.alert('Error', `Failed to load news. Check if backend is running on ${API_BASE_URL}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [getAuthHeaders]);

  // Initial load
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNews(1, false);
  }, [fetchNews]);

  // Load more
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage, true);
    }
  }, [loadingMore, hasMore, page, fetchNews]);

  // Navigate to news detail
  const navigateToNewsDetail = (newsId: string) => {
    router.push(`/news/${newsId}` as any);
  };

  // Render news item
  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity
      style={styles.newsCardContainer}
      onPress={() => navigateToNewsDetail(item.id)}
      activeOpacity={0.95}
    >
      <ThemedView style={[styles.newsCard, { backgroundColor: cardBackground }]}>
        {/* Image with overlay gradient */}
        {item.image_url ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>
                {item.createdBy}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={[styles.noImageContainer, { backgroundColor: primary + '15' }]}>
            <IconSymbol name="newspaper.fill" size={40} color={primary + '60'} />
          </View>
        )}

        {/* Content */}
        <View style={styles.newsContent}>
          <ThemedText style={[styles.newsTitle, { color: textColor }]} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={[styles.newsDescription, { color: textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          {/* Footer with time */}
          <View style={styles.newsFooter}>
            <View style={styles.timeContainer}>
              <IconSymbol name="clock" size={14} color={textSecondary} />
              <ThemedText style={[styles.newsTimestamp, { color: textSecondary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  // Empty state
  const renderEmptyState = () => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="newspaper.fill" size={80} color={textSecondary} />
      <ThemedText style={[styles.emptyTitle, { color: textColor }]}>No News Yet</ThemedText>
      <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
        Stay tuned for latest announcements and updates from PSN.
      </ThemedText>
    </ThemedView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={[styles.header, { backgroundColor, borderBottomColor: textSecondary + '20' }]}>
        <ThemedText style={[styles.headerTitle, { color: textColor }]}>News & Announcements</ThemedText>
        <ThemedText style={[styles.headerSubtitle, { color: textSecondary }]}>
          Stay updated with PSN news
        </ThemedText>
      </ThemedView>

      {loading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <ThemedText style={[styles.loadingText, { color: textSecondary }]}>Loading news...</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primary]}
              tintColor={primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={primary} />
                <ThemedText style={[styles.loadMoreText, { color: textSecondary }]}>Loading more...</ThemedText>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
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
  newsCardContainer: {
    marginBottom: 20,
  },
  newsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2c2c2c',
  },
  noImageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newsContent: {
    padding: 18,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
    opacity: 0.85,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsTimestamp: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    minHeight: screenHeight * 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
});