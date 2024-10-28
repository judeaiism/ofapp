import { Text, TextStyle, StyleSheet, StyleProp } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'small';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export function Typography({ 
  variant = 'p', 
  children, 
  style 
}: TypographyProps) {
  const colorScheme = useColorScheme();
  const color = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <Text style={[styles[variant], { color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1,
    marginVertical: 8,
  },
  h2: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginVertical: 6,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    marginVertical: 4,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    marginVertical: 4,
  },
  p: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});
