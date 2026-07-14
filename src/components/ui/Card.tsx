import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/cn';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  );
}

interface CardHeaderProps extends ViewProps {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <View
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

interface CardTitleProps extends ViewProps {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <View
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps extends ViewProps {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <View className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

interface CardContentProps extends ViewProps {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <View className={cn('p-6 pt-0', className)} {...props} />;
}

interface CardFooterProps extends ViewProps {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <View
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}
