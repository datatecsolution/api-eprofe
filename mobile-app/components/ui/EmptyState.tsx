import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center px-8 py-12">
      <View className="bg-surface-100 h-18 w-18 rounded-full items-center justify-center mb-4">
        {icon}
      </View>
      <Text
        className="text-lg text-surface-700 text-center mb-2"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {title}
      </Text>
      {description && (
        <Text
          className="text-sm text-surface-400 text-center mb-6"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}
