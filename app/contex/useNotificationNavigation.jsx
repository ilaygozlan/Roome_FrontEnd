// contex/useNotificationNavigation.jsx
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export default function useNotificationNavigation(pendingNotificationRef, isAuthenticated) {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const recipientId = response.notification.request.content.data?.recipientId;
      console.log("🔔 Notification clicked! recipientId:", recipientId, "isAuthenticated:", isAuthenticated);

      if (!recipientId) return;

      if (isAuthenticated) {
        console.log("🔀 Navigating to ChatRoom with:", recipientId);
        router.push({
          pathname: "ChatRoom",
          params: { recipientId },
        });
      } else if (pendingNotificationRef) {
        console.log("💾 Saving recipientId for later:", recipientId);
        pendingNotificationRef.current = recipientId;
      }
    });

    return () => subscription.remove();
  }, [router, isAuthenticated, pendingNotificationRef]);
}
