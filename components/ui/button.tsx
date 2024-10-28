import React from 'react';
import { StyleSheet, Pressable, View, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { Typography } from './typography';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  icon, 
  onPress, 
  style 
}) => {
  const buttonStyles = [
    styles.button,
    variant === 'outline' && styles.outlineButton,
    style
  ];

  const textStyle: StyleProp<TextStyle> = variant === 'outline' 
    ? { ...styles.text, color: '#374151' }
    : styles.text;

  return (
    <Pressable 
      onPress={onPress} 
      style={buttonStyles}
    >
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Typography 
          variant="p" 
          style={textStyle}
        >
          {children}
        </Typography>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});
