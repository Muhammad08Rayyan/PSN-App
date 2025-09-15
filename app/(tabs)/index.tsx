import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StatusBar, Share, Modal, TextInput, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/utils/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface FeedPost {
  _id?: string;
  id?: string;
  title?: string;
  content: string;
  author?: {
    name: string;
    profile_image?: string;
  };
  user?: {
    name: string;
    profile_image?: string;
  };
  createdAt?: string;
  created_at?: string;
  timestamp?: string;
  likes_count?: number;
  likesCount?: number;
  likes?: number;
  comments_count?: number;
  commentsCount?: number;
  comments?: number;
  is_liked?: boolean;
  isLiked?: boolean;
  image?: string;
  image_url?: string;
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const { getAuthHeaders, user } = useAuth();
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accentColor = useThemeColor({}, 'accent');

  const fetchFeed = useCallback(async () => {
    try {
      console.log('Fetching feed from API...');
      const response = await apiGet('/posts', {
        headers: getAuthHeaders(),
      });
      console.log('Feed API response:', response.data);

      // Handle different response formats
      const feedData = response.data?.posts || response.data?.data || response.data || [];

      // Transform data to standardize field names based on actual API response
      const transformedPosts = Array.isArray(feedData) ? feedData.map(post => ({
        ...post,
        id: post._id || post.id,
        title: post.title || 'Post', // Add default title if missing
        created_at: post.createdAt || post.created_at || post.timestamp,
        likes_count: post.likes || post.likesCount || post.likes_count || 0,
        comments_count: post.comments || post.commentsCount || post.comments_count || 0,
        is_liked: post.isLiked || post.is_liked || false,
        author: post.user || post.author || { name: 'Unknown User' },
        image: post.image_url || post.image
      })) : [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching feed:', error);
      console.error('Error details:', error.response?.data || error.message);

      // For now, just set empty posts instead of showing error
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed();
  }, [fetchFeed]);

  const handleLike = async (postId: string) => {
    try {
      const response = await apiPost(`/posts/${postId}/like`, {}, {
        headers: getAuthHeaders(),
      });

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post');
    }
  };

  const handleComment = async (postId: string) => {
    setSelectedPostId(postId);
    setCommentsModalVisible(true);
    setLoadingComments(true);

    try {
      const response = await apiGet(`/posts/${postId}/comments`, {
        headers: getAuthHeaders(),
      });

      const commentsData = response.data?.comments || response.data || [];
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const response = await apiPost(`/posts/${selectedPostId}/comments`, {
        content: newComment.trim()
      }, {
        headers: getAuthHeaders(),
      });

      const newCommentData = {
        id: Date.now().toString(),
        content: newComment.trim(),
        user: {
          name: user?.name || 'You',
          profilePic: user?.profilePic || null
        },
        timestamp: 'Just now',
        created_at: new Date().toISOString()
      };

      setComments(prev => [...prev, newCommentData]);
      setNewComment('');

      // Update the comments count in the post
      setPosts(prev => prev.map(post =>
        post.id === selectedPostId
          ? { ...post, comments_count: (post.comments_count || 0) + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleProfilePress = (postAuthor: any) => {
    // Don't navigate if it's the current user's post
    if (user && postAuthor && (user.id === postAuthor.id || user.name === postAuthor.name)) {
      return;
    }

    // Navigate to chat page with the post author
    if (postAuthor && postAuthor.id) {
      router.push(`/chat?userId=${postAuthor.id}&userName=${postAuthor.name}`);
    }
  };

  const handleShare = async (post: FeedPost) => {
    try {
      const shareContent = {
        message: `${post.title ? post.title + '\n\n' : ''}${post.content}\n\n- Shared from PSN Community`,
        title: post.title || 'PSN Community Post'
      };

      await Share.share(shareContent);
      // Removed success alert popup
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  const getProfileImageUrl = (user: any) => {
    if (!user) return null;

    // Check various possible profile image field names
    return user.profilePic ||
           user.profile_image ||
           user.profileImage ||
           user.avatar ||
           user.picture ||
           user.photo ||
           null;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };


  return (
    <ThemedView style={[styles.container, { backgroundColor: backgroundSecondary }]}>
      <StatusBar
        backgroundColor={tintColor}
        barStyle="light-content"
      />

      {/* Professional Header */}
      <ThemedView style={[styles.header, { backgroundColor: backgroundColor }]}>
        <ThemedView style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/psn-logo.png')}
            style={styles.logo}
          />
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={[styles.appTitle, { color: textColor }]}>Pakistan Society of Neurology</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
            colors={[tintColor]}
          />
        }
      >
        {posts.length === 0 && !loading ? (
          <ThemedView style={styles.emptyState}>
            <ThemedView style={[styles.emptyIcon, { backgroundColor: tintColor + '20' }]}>
              <Ionicons name="newspaper-outline" size={48} color={tintColor} />
            </ThemedView>
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textSecondary }]}>
              No posts yet
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: textSecondary }]}>
              Be the first to share something with the community!
            </ThemedText>
          </ThemedView>
        ) : (
          posts.map((post) => {
            const profileImageUrl = getProfileImageUrl(post.author);
            return (
              <ThemedView key={post.id} style={[styles.postCard, { backgroundColor: cardBackground }]}>
                {/* Post Header */}
                <ThemedView style={styles.postHeader}>
                  <TouchableOpacity
                    style={styles.authorSection}
                    onPress={() => handleProfilePress(post.author)}
                  >
                    {profileImageUrl ? (
                      <Image
                        source={{ uri: profileImageUrl }}
                        style={styles.profileImage}
                        placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                        transition={200}
                      />
                    ) : (
                      <ThemedView style={[styles.profilePlaceholder, { backgroundColor: tintColor }]}>
                        <Ionicons name="person" size={24} color="white" />
                      </ThemedView>
                    )}

                    <ThemedView style={styles.authorInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.authorName}>
                        {post.author?.name || 'Unknown User'}
                      </ThemedText>
                      <ThemedText style={[styles.timeStamp, { color: textSecondary }]}>
                        {post.timestamp || formatTimeAgo(post.created_at || new Date().toISOString())}
                      </ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                </ThemedView>

                {/* Post Content */}
                <ThemedView style={styles.postContent}>
                  {post.title && post.title !== 'Post' && (
                    <ThemedText type="subtitle" style={styles.postTitle}>
                      {post.title}
                    </ThemedText>
                  )}
                  <ThemedText style={styles.postText}>
                    {post.content}
                  </ThemedText>

                  {post.image && (
                    <Image
                      source={{ uri: post.image }}
                      style={styles.postImage}
                      placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                      transition={300}
                    />
                  )}
                </ThemedView>

                {/* Post Actions */}
                <ThemedView style={[styles.postActions, { borderTopColor: borderColor }]}>
                  <TouchableOpacity
                    style={[styles.actionButton, post.is_liked && { backgroundColor: accentColor + '10' }]}
                    onPress={() => handleLike(post.id)}
                  >
                    <Ionicons
                      name={post.is_liked ? "heart" : "heart-outline"}
                      size={22}
                      color={post.is_liked ? accentColor : iconColor}
                    />
                    <ThemedText style={[styles.actionCount, { color: post.is_liked ? accentColor : textSecondary }]}>
                      {post.likes_count || 0}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleComment(post.id)}
                  >
                    <Ionicons name="chatbubble-outline" size={22} color={iconColor} />
                    <ThemedText style={[styles.actionCount, { color: textSecondary }]}>
                      {post.comments_count || 0}
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShare(post)}
                  >
                    <Ionicons name="share-outline" size={22} color={iconColor} />
                    <ThemedText style={[styles.actionText, { color: textSecondary }]}>
                      Share
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            );
          })
        )}
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsModalVisible}
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: backgroundColor }]}>
            {/* Handle Bar */}
            <ThemedView style={[styles.handleBar, { backgroundColor: borderColor }]} />

            {/* Modal Header */}
            <ThemedView style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>Comments</ThemedText>
              <TouchableOpacity
                onPress={() => setCommentsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={iconColor} />
              </TouchableOpacity>
            </ThemedView>

            {/* Comments List */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id || item._id || Math.random().toString()}
              style={styles.commentsList}
              ListEmptyComponent={
                loadingComments ? (
                  <ThemedView style={styles.loadingComments}>
                    <ActivityIndicator size="small" color={tintColor} />
                    <ThemedText style={[styles.loadingText, { color: textSecondary }]}>
                      Loading comments...
                    </ThemedText>
                  </ThemedView>
                ) : (
                  <ThemedView style={styles.noComments}>
                    <Ionicons name="chatbubble-outline" size={48} color={textSecondary} />
                    <ThemedText style={[styles.noCommentsText, { color: textSecondary }]}>
                      No comments yet. Be the first to comment!
                    </ThemedText>
                  </ThemedView>
                )
              }
              renderItem={({ item }) => (
                <ThemedView style={styles.commentItem}>
                  <ThemedView style={styles.commentHeader}>
                    <ThemedView style={styles.commentAuthorSection}>
                      {item.user?.profilePic ? (
                        <Image
                          source={{ uri: item.user.profilePic }}
                          style={styles.commentProfileImage}
                          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                          transition={200}
                        />
                      ) : (
                        <ThemedView style={[styles.commentProfilePlaceholder, { backgroundColor: tintColor }]}>
                          <Ionicons name="person" size={16} color="white" />
                        </ThemedView>
                      )}
                      <ThemedView style={styles.commentAuthorInfo}>
                        <ThemedText style={[styles.commentAuthor, { color: tintColor }]}>
                          {item.user?.name || 'Anonymous User'}
                        </ThemedText>
                        <ThemedText style={[styles.commentTime, { color: textSecondary }]}>
                          {item.timestamp || (item.created_at ? formatTimeAgo(item.created_at) : 'Just now')}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                  <ThemedText style={[styles.commentContent, { color: textColor }]}>
                    {item.content || 'No content'}
                  </ThemedText>
                </ThemedView>
              )}
            />

            {/* Comment Input */}
            <ThemedView style={[styles.commentInputContainer, { borderTopColor: borderColor }]}>
              <TextInput
                style={[styles.commentInput, { backgroundColor: backgroundSecondary, color: textColor }]}
                placeholder="Write a comment..."
                placeholderTextColor={textSecondary}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.postButton, { backgroundColor: tintColor }]}
                onPress={addComment}
                disabled={postingComment || !newComment.trim()}
              >
                {postingComment ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  timeStamp: {
    fontSize: 13,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 24,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: width - 32,
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionCount: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  // Comments Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 25,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  noComments: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  commentItem: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    marginVertical: 2,
  },
  commentHeader: {
    marginBottom: 10,
  },
  commentAuthorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  commentProfilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  postButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
