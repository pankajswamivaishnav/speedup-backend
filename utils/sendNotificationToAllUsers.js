const NotificationSubscription = require("../config/models/NotificationSubscription");
const webpush = require("../controller/notification/pushConfig");

/**
 * Send push notification to all subscribed users
 * @param {Object} notificationPayload - The notification payload to send
 * @param {string} notificationPayload.title - Notification title
 * @param {string} notificationPayload.body - Notification body
 * @param {string} [notificationPayload.icon] - Notification icon URL
 * @param {string} [notificationPayload.url] - URL to open when notification is clicked
 */
const sendNotificationToAllUsers = async (notificationPayload) => {
  try {
    // Get all notification subscriptions
    const subscriptions = await NotificationSubscription.find({});

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No notification subscriptions found");
      return;
    }

    // Prepare the notification payload
    const payload = JSON.stringify({
      title: notificationPayload.title,
      body: notificationPayload.body,
      icon: notificationPayload.icon || "/icon-192x192.png",
      url: notificationPayload.url || "/",
    });

    // Send notification to all subscribers
    const promises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription.subscription, payload);
        console.log(`Notification sent to user: ${subscription.userId}`);
      } catch (error) {
        console.error(
          `Error sending notification to user ${subscription.userId}:`,
          error.message
        );
        // If subscription is invalid, you might want to remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await NotificationSubscription.findByIdAndDelete(subscription._id);
          console.log(
            `Removed invalid subscription for user: ${subscription.userId}`
          );
        }
      }
    });

    await Promise.allSettled(promises);
    console.log(`Notifications sent to ${subscriptions.length} users`);
  } catch (error) {
    console.error("Error in sendNotificationToAllUsers:", error);
    throw error;
  }
};

module.exports = sendNotificationToAllUsers;
