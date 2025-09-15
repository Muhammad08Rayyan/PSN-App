import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/utils/api-config';
import axios from 'axios';
import { router } from 'expo-router';

const { height: screenHeight } = Dimensions.get('window');

interface Member {
  id: string;
  name: string;
  email: string;
  specialty: string;
  location: string;
  hospital: string;
  memberSince: string;
  profile_image?: string;
  is_verified: boolean;
  phone?: string;
  registration_number?: string;
  bio?: string;
}

export default function MembersScreen() {
  const { getAuthHeaders, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const cardBackground = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const accent = useThemeColor({}, 'accent');
  const primary = useThemeColor({}, 'primary');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');


  const loadMembers = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPage(1);
      setHasMoreData(true);
    }

    try {
      console.log('Loading doctors from API:', `${API_BASE_URL}/doctors?page=${pageNum}&limit=20`);
      const response = await axios.get(`${API_BASE_URL}/doctors?page=${pageNum}&limit=20`, {
        headers: getAuthHeaders(),
      });

      console.log('Doctors API response:', response.data);

      // Check if we have doctors data in various possible formats
      const doctorsData = response.data?.doctors || response.data?.data || response.data;
      const hasMore = response.data?.hasMore !== false && doctorsData?.length === 20;

      if (Array.isArray(doctorsData) && doctorsData.length > 0) {
        console.log('Successfully loaded doctors data:', doctorsData.length, 'doctors');

        // Transform the data if needed to match our interface
        const transformedMembers = doctorsData.map(doctor => ({
          ...doctor,
          id: doctor._id || doctor.id,
          memberSince: doctor.memberSince || doctor.joinedYear || new Date(doctor.createdAt).getFullYear().toString() || 'N/A',
          hospital: doctor.hospital || doctor.institution || doctor.workplace || 'Not specified',
        }));

        if (isLoadMore) {
          setMembers(prev => [...prev, ...transformedMembers]);
          setFilteredMembers(prev => [...prev, ...transformedMembers]);
        } else {
          setMembers(transformedMembers);
          setFilteredMembers(transformedMembers);
        }

        setHasMoreData(hasMore);
        if (isLoadMore) {
          setPage(pageNum);
        }
      } else {
        if (!isLoadMore) {
          console.log('No doctors data returned from API');
          setMembers([]);
          setFilteredMembers([]);
        }
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Error details:', errorMessage);

      if (!isLoadMore) {
        setMembers([]);
        setFilteredMembers([]);
      }
      setHasMoreData(false);
    } finally {
      // Always set loading states to false in finally block
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers(1, false);
    setRefreshing(false);
  };

  const loadMoreMembers = async () => {
    if (!loadingMore && hasMoreData && !searchQuery.trim()) {
      await loadMembers(page + 1, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={primary} />
        <ThemedText style={styles.loadingFooterText}>Loading more members...</ThemedText>
      </View>
    );
  };

  const searchMembers = async (query: string) => {
    if (!query.trim()) {
      // Reset to current loaded members when search is cleared
      setFilteredMembers(members);
      setLoading(false); // Ensure loading state is cleared
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/doctors/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders(),
      });

      const searchResults = response.data?.doctors || [];
      setFilteredMembers(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to local filter if API fails
      const filtered = members.filter(member =>
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.specialty.toLowerCase().includes(query.toLowerCase()) ||
        member.location.toLowerCase().includes(query.toLowerCase()) ||
        member.hospital.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMembers(filtered);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMembers();
  }, []);

  // Ensure filteredMembers is updated when members change
  useEffect(() => {
    if (members.length > 0 && !searchQuery.trim()) {
      setFilteredMembers(members);
    }
  }, [members]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchMembers(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleContactMember = (member: Member) => {
    // Navigate to chat page with member info
    router.push({
      pathname: '/chat',
      params: {
        memberId: member.id,
        memberName: member.name,
        memberImage: member.profile_image || '',
      },
    });
  };



  const renderMemberCard = ({ item }: { item: Member }) => (
    <ThemedView style={[styles.memberCard, {
      backgroundColor: backgroundColor,
      shadowColor: textColor,
    }]}>
      {/* Header with avatar and basic info */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          {item.profile_image ? (
            <Image
              source={{ uri: item.profile_image }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: primary }]}>
              <ThemedText style={styles.avatarText}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </ThemedText>
            </View>
          )}
          {(item.is_verified || item.isVerified) && (
            <View style={[styles.verifiedBadge, { backgroundColor: primary }]}>
              <IconSymbol name="checkmark" size={12} color="white" />
            </View>
          )}
        </View>

        <View style={styles.memberDetails}>
          <ThemedText type="defaultSemiBold" style={styles.memberName}>
            {item.name}
          </ThemedText>
          <View style={styles.specialtyContainer}>
            <View style={[styles.specialtyBadge, { backgroundColor: accent }]}>
              <ThemedText style={styles.specialtyText}>{item.specialty}</ThemedText>
            </View>
          </View>
        </View>

        {item.id !== user?.id && item.id !== user?._id && (
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleContactMember(item)}
            activeOpacity={0.8}
          >
            <IconSymbol name="message" size={18} color={primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Location and hospital info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <IconSymbol name="building.2.fill" size={14} color={textSecondary} />
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {item.hospital}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <IconSymbol name="location.fill" size={14} color={textSecondary} />
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {item.location}{item.registration_number ? ` • Reg: ${item.registration_number}` : ''}
          </ThemedText>
        </View>
        {item.designation && (
          <View style={styles.infoRow}>
            <IconSymbol name="person.crop.circle.fill" size={14} color={textSecondary} />
            <ThemedText style={styles.infoText}>
              {item.designation}
            </ThemedText>
          </View>
        )}
      </View>

    </ThemedView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: accent }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText type="title" style={styles.headerTitle}>Members Directory</ThemedText>
            <ThemedText style={styles.headerSubtitle}>Connect with fellow neurologists</ThemedText>
          </View>
        </View>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: '#F5F5F5' }]}>
          <IconSymbol name="magnifyingglass" size={20} color={textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search"
            placeholderTextColor={textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingContent}>
              <View style={[styles.loadingSpinner, { borderTopColor: primary }]}>
                <ActivityIndicator size="large" color={primary} />
              </View>
              <ThemedText style={styles.loadingTitle}>Loading Members</ThemedText>
            </View>
          </View>
        ) : filteredMembers.length === 0 && !loading && searchQuery ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="person.2.fill" size={60} color={textSecondary} />
            <ThemedText style={styles.emptyTitle}>
              No members found
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              Try adjusting your search criteria
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={filteredMembers}
            renderItem={renderMemberCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={primary}
                colors={[primary]}
              />
            }
            onEndReached={loadMoreMembers}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>


      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Math.max(20, screenHeight * 0.02),
    paddingBottom: Math.max(15, screenHeight * 0.015),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Math.min(28, screenHeight * 0.035),
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Math.min(16, screenHeight * 0.02),
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: Math.max(15, screenHeight * 0.015),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Math.max(12, screenHeight * 0.012),
  },
  searchInput: {
    flex: 1,
    fontSize: Math.min(16, screenHeight * 0.02),
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  memberCard: {
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 0,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specialtyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Math.max(60, screenHeight * 0.08),
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Math.max(60, screenHeight * 0.08),
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingFooterText: {
    marginTop: 8,
    fontSize: 14,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
});