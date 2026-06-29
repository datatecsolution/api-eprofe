import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

const variantBg = {
  success: 'bg-green-100',
  danger: 'bg-red-100',
  warning: 'bg-amber-100',
  info: 'bg-accent-100',
  neutral: 'bg-surface-100',
};

const variantText = {
  success: 'text-green-700',
  danger: 'text-red-700',
  warning: 'text-amber-700',
  info: 'text-accent-700',
  neutral: 'text-surface-600',
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <View className={`${variantBg[variant]} px-3 py-1 rounded-full`}>
      <Text
        className={`text-xs ${variantText[variant]}`}
        style={{ fontFamily: 'Inter_600SemiBold' }}
      >
        {label}
      </Text>
    </View>
  );
}
