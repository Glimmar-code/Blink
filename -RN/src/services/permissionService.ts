import { Platform, Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export type PermissionKey =
  | 'notifications'
  | 'camera'
  | 'photos'
  | 'mediaLibrary';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'never_ask_again';

export interface PermissionResult {
  key: PermissionKey;
  status: PermissionStatus;
  canAskAgain: boolean;
}

const FRIENDLY_NAME: Record<PermissionKey, string> = {
  notifications: 'Notifications',
  camera: 'Camera',
  photos: 'Photo Library',
  mediaLibrary: 'Media Library',
};

const USAGE_DESCRIPTION: Record<PermissionKey, string> = {
  notifications:
    'Get notified about new messages, likes, comments, and your daily reward.',
  camera: 'Take photos and videos to share with the community.',
  photos: 'Pick images from your gallery to upload to posts.',
  mediaLibrary: 'Save photos and videos you create in Blink to your gallery.',
};

export async function checkPermission(key: PermissionKey): Promise<PermissionResult> {
  switch (key) {
    case 'notifications': {
      const settings = await Notifications.getPermissionsAsync();
      return mapExpoPermission(settings, 'notifications');
    }
    case 'camera': {
      const status = await Camera.getCameraPermissionsAsync();
      return mapExpoPermission(status, 'camera');
    }
    case 'photos': {
      const status = await ImagePicker.getMediaLibraryPermissionsAsync();
      return mapExpoPermission(status, 'photos');
    }
    case 'mediaLibrary': {
      const status = await MediaLibrary.getPermissionsAsync();
      return mapExpoPermission(status, 'mediaLibrary');
    }
  }
}

function mapExpoPermission(
  result: { status: string; canAskAgain?: boolean; ios?. { status: number } },
  key: PermissionKey
): PermissionResult {
  let status: PermissionStatus = 'undetermined';
  if (result.status === 'granted') status = 'granted';
  else if (result.status === 'denied') status = 'denied';
  else status = 'undetermined';

  return {
    key,
    status,
    canAskAgain: result.canAskAgain ?? status !== 'denied',
  };
}

export async function requestPermission(key: PermissionKey): Promise<PermissionResult> {
  switch (key) {
    case 'notifications': {
      const result = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowAnnouncements: true,
        },
      });
      return mapExpoPermission(result, 'notifications');
    }
    case 'camera': {
      const result = await Camera.requestCameraPermissionsAsync();
      return mapExpoPermission(result, 'camera');
    }
    case 'photos': {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return mapExpoPermission(result, 'photos');
    }
    case 'mediaLibrary': {
      const result = await MediaLibrary.requestPermissionsAsync();
      return mapExpoPermission(result, 'mediaLibrary');
    }
  }
}

export interface RequestAllOptions {
  /** Skip a permission if it's already granted. Default: true. */
  skipGranted?: boolean;
  /** Show the "Why we need this" explanation before each system dialog. Default: true. */
  showExplanation?: boolean;
  /** Order in which to request permissions. */
  order?: PermissionKey[];
}

const DEFAULT_ORDER: PermissionKey[] = [
  'notifications',
  'photos',
  'camera',
  'mediaLibrary',
];

export async function requestAllPermissions(
  options: RequestAllOptions = {}
): Promise<PermissionResult[]> {
  const {
    skipGranted = true,
    showExplanation = true,
    order = DEFAULT_ORDER,
  } = options;

  const results: PermissionResult[] = [];

  for (const key of order) {
    const current = await checkPermission(key);

    if (skipGranted && current.status === 'granted') {
      results.push(current);
      continue;
    }

    if (showExplanation && current.status !== 'granted') {
      const proceed = await new Promise<boolean>((resolve) => {
        Alert.alert(
          `${FRIENDLY_NAME[key]} Access`,
          USAGE_DESCRIPTION[key],
          [
            { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Continue', onPress: () => resolve(true) },
          ],
          { cancelable: false }
        );
      });
      if (!proceed) {
        results.push(current);
        continue;
      }
    }

    const next = await requestPermission(key);
    results.push(next);
  }

  return results;
}

export async function openSystemSettings() {
  try {
    await Linking.openSettings();
  } catch (e) {
    Alert.alert(
      'Open Settings',
      'Please open Settings → Blink to manage permissions manually.'
    );
  }
}

export function friendlyName(key: PermissionKey) {
  return FRIENDLY_NAME[key];
}

export function usageDescription(key: PermissionKey) {
  return USAGE_DESCRIPTION[key];
}

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
