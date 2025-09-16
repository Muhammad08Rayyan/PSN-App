import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import CustomSplashScreen from '@/components/splash-screen';

export default function IndexScreen() {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated]);

  return <CustomSplashScreen />;
}

