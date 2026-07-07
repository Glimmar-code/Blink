import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '../../lib/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  containerClassName,
  rightIcon,
  leftIcon,
  className,
  ...props
}: InputProps) {
  return (
    <View className={cn('w-full', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>
      )}
      <View
        className={cn(
          'flex-row items-center border rounded-lg bg-white px-3 h-11',
          error ? 'border-destructive' : 'border-border',
          props.editable === false && 'opacity-60'
        )}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={cn('flex-1 text-base text-foreground', className)}
          placeholderTextColor="#94a3b8"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
    </View>
  );
}
