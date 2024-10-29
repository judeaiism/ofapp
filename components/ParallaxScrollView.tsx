import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate
} from 'react-native-reanimated';

interface ParallaxScrollViewProps {
  children: React.ReactNode;
  headerImage: React.ReactNode;
  headerBackgroundColor: {
    light: string;
    dark: string;
  };
  style?: ViewStyle;
}

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  style
}: ParallaxScrollViewProps) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-300, 0, 300],
      [-150, 0, 150]
    );

    return {
      transform: [{ translateY }],
      opacity: interpolate(
        scrollY.value,
        [-100, 0, 100],
        [1, 1, 0.5]
      ),
    };
  });

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={[styles.container, style]}>
      <Animated.View style={[styles.headerContainer]}>
        <Animated.View style={[styles.header, headerStyle]}>
          {headerImage}
        </Animated.View>
      </Animated.View>
      {children}
    </Animated.ScrollView>
  );
}

const HEADER_HEIGHT = 300;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    marginBottom: 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
});