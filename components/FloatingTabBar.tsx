
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
  containerWidth?: number;
  borderRadius?: number;
  bottomMargin?: number;
}

export default function FloatingTabBar({
  tabs,
  containerWidth = 200,
  borderRadius = 25,
  bottomMargin = 20,
}: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const indicatorPosition = useSharedValue(0);

  const handleTabPress = (route: string, index: number) => {
    indicatorPosition.value = withSpring(index);
    router.push(route as any);
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: indicatorPosition.value * (containerWidth / tabs.length),
        },
      ],
    };
  });

  const isActive = (route: string) => {
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={[styles.container, { marginBottom: bottomMargin }]}>
        <BlurView intensity={80} tint="light" style={[styles.tabBar, { borderRadius }]}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: containerWidth / tabs.length,
                borderRadius: borderRadius - 5,
              },
              animatedIndicatorStyle,
            ]}
          />
          {tabs.map((tab, index) => {
            const active = isActive(tab.route);
            return (
              <TouchableOpacity
                key={tab.name}
                style={styles.tab}
                onPress={() => handleTabPress(tab.route, index)}
              >
                <IconSymbol
                  name={tab.icon as any}
                  size={24}
                  color={active ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.label,
                    { color: active ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
    elevation: 8,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    height: '80%',
    backgroundColor: colors.accent,
    top: '10%',
    left: 8,
    opacity: 0.3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
