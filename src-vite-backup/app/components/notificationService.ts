export interface BrowserNotificationPayload {
  title: string;
  body: string;
  path: string;
  tag?: string;
  icon?: string;
}

export function browserNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!browserNotificationsSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

export function showBrowserNotification(payload: BrowserNotificationPayload) {
  if (!browserNotificationsSupported() || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(payload.title, {
    body: payload.body,
    tag: payload.tag,
    icon: payload.icon,
    data: {
      path: payload.path,
    },
  });

  notification.onclick = (event) => {
    event.preventDefault();
    if (typeof window !== "undefined" && window.focus) {
      window.focus();
    }

    if (typeof window !== "undefined") {
      window.location.href = payload.path;
    }

    notification.close();
  };
}
