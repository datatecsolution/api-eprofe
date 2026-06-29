import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-600 shadow-button',
  secondary: 'bg-surface-100',
  outline: 'bg-transparent border-2 border-surface-200',
  ghost: 'bg-transparent',
  danger: 'bg-danger',
};

const variantTextStyles = {
  primary: 'text-white font-semibold',
  secondary: 'text-surface-700 font-medium',
  outline: 'text-surface-700 font-medium',
  ghost: 'text-primary-600 font-medium',
  danger: 'text-white font-semibold',
};

const sizeStyles = {
  sm: 'py-2.5 px-4',
  md: 'py-3.5 px-6',
  lg: 'py-4.5 px-8',
};

const sizeTextStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`
        flex-row items-center justify-center rounded-2xl
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#16a34a'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`${variantTextStyles[variant]} ${sizeTextStyles[size]}`}
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
