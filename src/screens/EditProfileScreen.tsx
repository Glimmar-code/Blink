import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [university, setUniversity] = useState(profile?.university ?? '');
  const [department, setDepartment] = useState(profile?.department ?? '');
  const [level, setLevel] = useState(profile?.level ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const ok = await updateProfile({
      full_name: fullName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      university: university.trim(),
      department: department.trim(),
      level: level.trim(),
    });
    setSaving(false);

    if (!ok) {
      Alert.alert('Profile not saved', 'Please try again.');
      return;
    }
    await refreshProfile?.();
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center border-b border-border px-4 py-3">
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} className="p-1">
          <ArrowLeft size={22} color="#0f172a" />
        </Pressable>
        <Text className="ml-3 text-lg font-bold text-foreground">Edit profile</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-5" keyboardShouldPersistTaps="handled">
        <Input label="Full name" value={fullName} onChangeText={setFullName} />
        <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline />
        <Input label="University" value={university} onChangeText={setUniversity} />
        <Input label="Department" value={department} onChangeText={setDepartment} />
        <Input label="Level" value={level} onChangeText={setLevel} />
        <Button title="Save changes" onPress={save} loading={saving} className="mt-2" />
      </ScrollView>
    </View>
  );
}
