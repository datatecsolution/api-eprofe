import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, secureTextEntry, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = secureTextEntry && !showPassword;

  return (
    <View className="mb-4">
      {label && (
        <Text
          className="text-sm text-surface-600 mb-1.5"
          style={{ fontFamily: 'Inter_500Medium' }}
        >
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center bg-surface-50 rounded-2xl px-4
          border-2 ${error ? 'border-danger' : 'border-surface-200'}
        `}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 py-4 text-base text-surface-800"
          style={{ fontFamily: 'Inter_400Regular' }}
          placeholderTextColor="#a8a29e"
          secureTextEntry={isSecure}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
            {showPassword ? (
              <EyeOff size={20} color="#a8a29e" />
            ) : (
              <Eye size={20} color="#a8a29e" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-xs text-danger mt-1 ml-1" style={{ fontFamily: 'Inter_400Regular' }}>
          {error}
        </Text>
      )}
    </View>
  );
}
