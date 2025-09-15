import React from 'react';
import { ThemedView } from '@/components/themed-view';

// This is a placeholder component that should never be rendered
// since we use href: null in the tab configuration
export default function CentralFabPlaceholder() {
  return <ThemedView style={{ flex: 1 }} />;
}