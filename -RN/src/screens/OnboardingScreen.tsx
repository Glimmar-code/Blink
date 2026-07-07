import { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, Pressable, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/ui/Button';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Connect on Campus',
    description:
      'Blink is the social hub for university students. Find your people, share your story, and stay in the loop.',
    emoji: '🎓',
  },
  {
    title: 'Share Your Moments',
    description:
      'Post photos, videos, and updates. React to friends with likes, comments, and shares.',
    emoji: '✨',
  },
  {
    title: 'Climb the Leaderboard',
    description:
      'Earn XP, unlock rewards, and see who is the most active on your campus every week.',
    emoji: '🏆',
  },
  {
    title: 'Stay in the Loop',
    description:
      'Get real-time push notifications for messages, likes, comments, and your daily login reward.',
    emoji: '🔔',
  },
];

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  return (
    <ScreenContainer noPadding>
      <View className="flex-1">
        <View className="flex-row justify-end p-4">
          <Pressable onPress={handleSkip}>
            <Text className="text-sm text-muted-foreground font-medium">Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center justify-center px-8">
              <Text className="text-7xl mb-8">{item.emoji}</Text>
              <Text className="text-2xl font-bold text-foreground text-center mb-3">
                {item.title}
              </Text>
              <Text className="text-base text-muted-foreground text-center">
                {item.description}
              </Text>
            </View>
          )}
        />

        <View className="items-center mb-6">
          <View className="flex-row gap-2">
            {slides.map((_, i) => (
              <View
                key={i}
                className={
                  i === index
                    ? 'h-2 w-6 rounded-full bg-primary-500'
                    : 'h-2 w-2 rounded-full bg-muted-foreground/30'
                }
              />
            ))}
          </View>
        </View>

        <View className="px-6 pb-6">
          <Button
            title={index === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            size="lg"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
