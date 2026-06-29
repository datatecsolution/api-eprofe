import React from 'react';
import { View, Text } from 'react-native';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

const sizeStyles = {
  sm: 'h-10 w-10',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-22 w-22',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
};

const colors = [
  'bg-primary-100',
  'bg-accent-100',
  'bg-amber-100',
  'bg-rose-100',
  'bg-violet-100',
  'bg-cyan-100',
];

const textColors = [
  'text-primary-700',
  'text-accent-700',
  'text-amber-700',
  'text-rose-700',
  'text-violet-700',
  'text-cyan-700',
];

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

export default function Avatar({ name, size = 'md' }: AvatarProps) {
  const idx = getColorIndex(name);

  return (
    <View className={`${sizeStyles[size]} ${colors[idx]} rounded-full items-center justify-center`}>
      <Text
        className={`${textSizes[size]} ${textColors[idx]}`}
        style={{ fontFamily: 'Inter_700Bold' }}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}
