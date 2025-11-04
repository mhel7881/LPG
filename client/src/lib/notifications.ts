// Web Push Notifications utility

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const showNotification = (title: string, options?: NotificationOptions): Notification | null => {
  if (Notification.permission !== "granted") {
    console.warn("Notification permission not granted");
    return null;
  }

  return new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...options,
  });
};

export const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push messaging is not supported");
    return null;
  }

  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Request notification permission
      const permission = await requestNotificationPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 
          "BEl62iUYgUivxIkv69yViEuiBIa40HI6DLldtRhJBA-B2AH2xGlJDJdFAZnSyIwEqE9_8v2U2FqFxN9_1gMWKs"
        )
      });
      
      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
    }

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
    return null;
  }
};

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const unsubscribeFromNotifications = async (): Promise<boolean> => {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        return await subscription.unsubscribe();
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to unsubscribe from push notifications:", error);
    return false;
  }
};
