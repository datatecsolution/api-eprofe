import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export default function Card({ children, onPress, className = '' }: CardProps) {
  const baseStyle = `bg-white rounded-2xl p-4 shadow-card ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={baseStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={baseStyle}>{children}</View>;
}
