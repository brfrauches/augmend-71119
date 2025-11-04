
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "reminder" | "achievement" | "tip" | "alert";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  priority: "high" | "medium" | "low";
  isRead: boolean;
}

export const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Time for Mindfulness",
      message: "It's been a while since your last meditation session. Take a moment to center yourself.",
      time: "Just now",
      type: "reminder",
      priority: "medium",
      isRead: false
    },
    {
      id: 2,
      title: "Achievement Unlocked!",
      message: "You've completed 5 breathing exercises this week. Keep up the great work!",
      time: "1 hour ago",
      type: "achievement",
      priority: "high",
      isRead: false
    },
    {
      id: 3,
      title: "Daily Wellness Tip",
      message: "Try the 5-4-3-2-1 grounding technique when feeling overwhelmed.",
      time: "2 hours ago",
      type: "tip",
      priority: "low",
      isRead: false
    }
  ]);
  const [preferences, setPreferences] = useState({
    reminderFrequency: "medium",
    notificationTypes: ["reminder", "achievement", "tip", "alert"],
    quietHours: { start: "22:00", end: "07:00" }
  });
  
  const { toast } = useToast();

  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "reminder":
        return "⏰";
      case "achievement":
        return "🏆";
      case "tip":
        return "💡";
      case "alert":
        return "⚠️";
      default:
        return "📫";
    }
  };

  useEffect(() => {
    // Check for new unread notifications and show toast
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0];
      toast({
        title: latestNotification.title,
        description: latestNotification.message,
      });
    }
  }, [notifications, toast]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-teal-600 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.filter(n => !n.isRead).length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-teal-500 rounded-full">
            {notifications.filter(n => !n.isRead).length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-25 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Notifications
                  </h3>
                  <button
                    onClick={() => console.log("Open settings")}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification Preferences */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="border-b border-gray-100 bg-gray-50"
              >
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reminder Frequency</span>
                      <select
                        value={preferences.reminderFrequency}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          reminderFrequency: e.target.value as "low" | "medium" | "high"
                        })}
                        className="text-sm border rounded-md px-2 py-1"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quiet Hours</span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          value={preferences.quietHours.start}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, start: e.target.value }
                          })}
                          className="text-sm border rounded-md px-2 py-1"
                        />
                        <span className="text-sm text-gray-600">to</span>
                        <input
                          type="time"
                          value={preferences.quietHours.end}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            quietHours: { ...preferences.quietHours, end: e.target.value }
                          })}
                          className="text-sm border rounded-md px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? "bg-teal-50" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start">
                      <span className="text-2xl mr-3">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">{notification.time}</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notification.priority === "high" 
                              ? "bg-red-100 text-red-800"
                              : notification.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              {notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
