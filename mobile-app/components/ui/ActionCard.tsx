import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export default function ActionCard({ title, subtitle, icon, onPress, disabled = false }: ActionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={`
        bg-white rounded-2xl p-5 shadow-card
        ${disabled ? 'opacity-40' : ''}
      `}
    >
      <View className="bg-primary-50 h-14 w-14 rounded-2xl items-center justify-center mb-3">
        {icon}
      </View>
      <Text
        className="text-base text-surface-800"
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-sm text-surface-400 mt-0.5"
          style={{ fontFamily: 'Inter_400Regular' }}
        >
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}
