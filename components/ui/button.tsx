import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import Animated, { FadeIn } from 'react-native-reanimated';

interface ButtonProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'lg' | 'sm';
  children: React.ReactNode;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ 
  variant = 'default', 
  size = 'default',
  children, 
  onPress,
  icon,
  style
}: ButtonProps) {
  return (
    <AnimatedPressable
      entering={FadeIn}
      style={[
        styles.base,
        variant === 'outline' ? styles.outline : styles.default,
        size === 'lg' ? styles.lg : size === 'sm' ? styles.sm : styles.default,
        style
      ]}
      onPress={onPress}>
      {icon && <Animated.View style={styles.icon}>{icon}</Animated.View>}
      <ThemedText 
        style={[
          styles.text,
          variant === 'outline' ? styles.outlineText : styles.defaultText
        ]}>
        {children}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  default: {
    backgroundColor: '#000',
    padding: 16,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  sm: {
    padding: 12,
  },
  lg: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  defaultText: {
    color: '#FFF',
  },
  outlineText: {
    color: '#374151',
  },
  icon: {
    opacity: 0.8,
  }
});
