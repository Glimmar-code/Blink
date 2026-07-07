import { Pressable, Text, ActivityIndicator, View, ViewStyle } from 'react-native';
import { cn } from '../../lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-500 active:bg-primary-600',
  secondary: 'bg-muted active:bg-slate-200',
  outline: 'bg-transparent border border-border active:bg-muted',
  ghost: 'bg-transparent active:bg-muted',
  destructive: 'bg-destructive active:bg-red-600',
};

const variantTextClasses: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 rounded-md',
  md: 'h-11 px-4 rounded-lg',
  lg: 'h-13 px-6 rounded-xl',
};

const sizeTextClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base font-semibold',
};

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  textClassName,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={style}
      className={cn(
        'flex-row items-center justify-center gap-2',
        sizeClasses[size],
        variantClasses[variant],
        isDisabled && 'opacity-50',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'destructive' ? 'white' : '#0f172a'}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={cn(
              'font-semibold',
              sizeTextClasses[size],
              variantTextClasses[variant],
              textClassName
            )}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
