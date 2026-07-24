import { View, Text, Image } from 'react-native';
import { cn } from '../../lib/cn';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: { box: 'h-6 w-6', text: 'text-[10px]' },
  sm: { box: 'h-8 w-8', text: 'text-xs' },
  md: { box: 'h-10 w-10', text: 'text-sm' },
  lg: { box: 'h-14 w-14', text: 'text-lg' },
  xl: { box: 'h-24 w-24', text: 'text-3xl' },
};

function getInitials(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ uri, name, size = 'md', className }: AvatarProps) {
  const { box, text } = sizeMap[size];
  return (
    <View
      className={cn(
        box,
        'rounded-full bg-primary-100 items-center justify-center overflow-hidden',
        className
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          className={cn(box, 'rounded-full')}
          resizeMode="cover"
        />
      ) : (
        <Text className={cn(text, 'font-bold text-primary-700')}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}
