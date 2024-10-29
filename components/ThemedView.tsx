import { StyleSheet, View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const insets = useSafeAreaInsets();

  const existingPaddingTop = style && typeof style === 'object' && 'paddingTop' in style
    ? style.paddingTop
    : undefined;

  return (
    <View 
      style={[
        styles.container,
        {
          paddingTop: existingPaddingTop ?? insets.top,
          backgroundColor,
        },
        style,
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
