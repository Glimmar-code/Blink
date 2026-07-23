import { useState } from 'react';
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import type { RootStackParamList } from '../types/auth';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export function AuthScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn, signUp, signInWithGoogle, loading, authError, isNewUser } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    try {
      const ok =
        mode === 'signin'
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password);
      if (ok) {
        if (mode === 'signup' && isNewUser) {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Permissions');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer noPadding keyboard>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-8">
          <View className="h-20 w-20 rounded-2xl bg-primary-500 items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">B</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground">Welcome to Blink</Text>
          <Text className="text-sm text-muted-foreground mt-2 text-center">
            {mode === 'signin'
              ? 'Sign in to connect with your campus community'
              : 'Create an account to get started'}
          </Text>
        </View>

        <View className="gap-3">
          <Input
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            leftIcon={<Mail size={18} color="#64748b" />}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            leftIcon={<Lock size={18} color="#64748b" />}
            rightIcon={
              <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                {showPassword ? (
                  <EyeOff size={18} color="#64748b" />
                ) : (
                  <Eye size={18} color="#64748b" />
                )}
              </Pressable>
            }
          />

          {authError && (
            <View className="bg-destructive/10 border border-destructive rounded-lg p-3">
              <Text className="text-sm text-destructive">{authError}</Text>
            </View>
          )}

          <Button
            title={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={handleSubmit}
            loading={submitting || loading}
            size="lg"
            className="mt-2"
          />

          <View className="flex-row items-center my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-3 text-xs text-muted-foreground">OR</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            onPress={handleGoogle}
            loading={submitting}
            size="lg"
          />

          <Pressable
            onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="mt-4 self-center"
          >
            <Text className="text-sm text-muted-foreground">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <Text className="text-primary-600 font-semibold">
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
