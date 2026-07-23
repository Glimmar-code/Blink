import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';

export type PermissionKey = 'notifications' | 'camera' | 'photos' | 'mediaLibrary';
export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface PermissionResult {
  key: PermissionKey;
  status: PermissionStatus;
}

export async function checkPermission(key: PermissionKey): Promise<PermissionResult> {
  if (Platform.OS === 'web') return { key, status: 'granted' };
  let status: PermissionStatus = 'undetermined';

  try {
    switch (key) {
      case 'notifications': {
        const { status: s } = await Notifications.getPermissionsAsync();
        status = s === 'granted' ? 'granted' : s === 'undetermined' ? 'undetermined' : 'denied';
        break;
      }
      case 'camera': {
        const { status: s } = await Camera.getCameraPermissionsAsync();
        status = s === 'granted' ? 'granted' : s === 'undetermined' ? 'undetermined' : 'denied';
        break;
      }
      case 'photos': {
        const { status: s } = await ImagePicker.getMediaLibraryPermissionsAsync();
        status = s === 'granted' ? 'granted' : s === 'undetermined' ? 'undetermined' : 'denied';
        break;
      }
      case 'mediaLibrary': {
        const { status: s } = await MediaLibrary.getPermissionsAsync();
        status = s === 'granted' ? 'granted' : s === 'undetermined' ? 'undetermined' : 'denied';
        break;
      }
    }
  } catch (err) {
    console.error(`[permissions] check ${key} error:`, err);
  }

  return { key, status };
}

interface RequestOptions {
  order?: PermissionKey[];
  showExplanation?: boolean;
  skipGranted?: boolean;
}

export async function requestAllPermissions(options: RequestOptions = {}): Promise<PermissionResult[]> {
  const {
    order = ['notifications', 'camera', 'photos', 'mediaLibrary'],
    skipGranted = true,
  } = options;

  if (Platform.OS === 'web') {
    return order.map((key) => ({ key, status: 'granted' as PermissionStatus }));
  }

  const results: PermissionResult[] = [];

  for (const key of order) {
    if (skipGranted) {
      const current = await checkPermission(key);
      if (current.status === 'granted') {
        results.push(current);
        continue;
      }
    }

    let status: PermissionStatus = 'undetermined';
    try {
      switch (key) {
        case 'notifications': {
          const { status: s } = await Notifications.requestPermissionsAsync();
          status = s === 'granted' ? 'granted' : 'denied';
          break;
        }
        case 'camera': {
          const { status: s } = await Camera.requestCameraPermissionsAsync();
          status = s === 'granted' ? 'granted' : 'denied';
          break;
        }
        case 'photos': {
          const { status: s } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          status = s === 'granted' ? 'granted' : 'denied';
          break;
        }
        case 'mediaLibrary': {
          const { status: s } = await MediaLibrary.requestPermissionsAsync();
          status = s === 'granted' ? 'granted' : 'denied';
          break;
        }
      }
    } catch (err) {
      console.error(`[permissions] request ${key} error:`, err);
      status = 'denied';
    }

    results.push({ key, status });
  }

  return results;
}

export function openSystemSettings(): void {
  if (Platform.OS === 'web') return;
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}
