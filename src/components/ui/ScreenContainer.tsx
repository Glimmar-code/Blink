import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type RefreshControlProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from '../../lib/cn';

interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  noPadding?: boolean;
  keyboard?: boolean;
  statusBarStyle?: 'light' | 'dark';
}

export function ScreenContainer({
  children,
  className,
  scroll = false,
  refreshControl,
  edges = ['top', 'bottom'],
  noPadding = false,
  keyboard = false,
}: ScreenContainerProps) {
  const Container = keyboard ? KeyboardAvoidingView : View;

  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-background', className)}>
      <Container
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={refreshControl}
            className={cn(!noPadding && 'px-4')}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View className={cn('flex-1', !noPadding && 'px-4')}>{children}</View>
        )}
      </Container>
    </SafeAreaView>
  );
}

interface HeaderProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function ScreenHeader({ title, subtitle, left, right, className }: HeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between py-3 border-b border-border bg-background',
        className
      )}
    >
      <View className="flex-row items-center gap-3 flex-1">
        {left}
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right && <View className="flex-row items-center gap-2">{right}</View>}
    </View>
  );
}
