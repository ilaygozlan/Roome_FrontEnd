import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export default function useNotificationNavigation(pendingNotificationRef, isAuthenticated) {
  const router = useRouter();

  // האזנה ללחיצה על ההתראה
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const recipientId = response.notification.request.content.data?.recipientId;

      console.log("🔔 Notification clicked! recipientId:", recipientId, "isAuthenticated:", isAuthenticated);

      if (!recipientId || recipientId === "undefined" || recipientId === "null" || recipientId === "") {
        console.warn("❌ recipientId missing or invalid, not navigating.");
        return;
      }

      if (isAuthenticated && router?.push) {
        // הניווט ברגע שהמשתמש כבר מאומת
        console.log("🔀 Navigating to /chat/" + recipientId);
        setTimeout(() => {
          router.push(`/chat/${recipientId}`);
        }, 100); // הוספת דיליי קטן שיכולה למנוע race
      } else if (pendingNotificationRef?.current !== undefined) {
        console.log("💾 Saving recipientId for later:", recipientId);
        pendingNotificationRef.current = recipientId;
      }
    });

    return () => subscription.remove();
  }, [router, isAuthenticated, pendingNotificationRef]);

  // לאחר שהמשתמש מחובר, נבדוק אם הייתה התראה שמחכה
  useEffect(() => {
    if (isAuthenticated && pendingNotificationRef?.current) {
      const savedRecipientId = pendingNotificationRef.current;
      console.log("🚀 Authenticated after notification. Navigating to saved ChatRoom:", savedRecipientId);
      pendingNotificationRef.current = null;

      setTimeout(() => {
        router.push(`/chat/${savedRecipientId}`);
      }, 100);
    }
  }, [isAuthenticated]);
}
