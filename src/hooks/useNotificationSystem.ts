import { useState, useEffect, useCallback } from 'react';

interface NotificationConfig {
  medicineId: string;
  patientId: string;
  scheduledTime: string;
  caretakerContact?: string;
  reminderIntervals: number[]; // in minutes
}

interface NotificationState {
  pendingReminders: Map<string, number>;
  escalatedAlerts: Set<string>;
}

export const useNotificationSystem = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    pendingReminders: new Map(),
    escalatedAlerts: new Set()
  });

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'mediminder',
        requireInteraction: true,
        ...options
      });

      // Auto-close after 10 seconds if not interacted
      setTimeout(() => {
        notification.close();
      }, 10000);

      return notification;
    }
  }, []);

  const scheduleReminder = useCallback((config: NotificationConfig) => {
    const { medicineId, scheduledTime, reminderIntervals } = config;
    const scheduleTime = new Date(scheduledTime);
    const now = new Date();

    // Schedule initial reminder
    const initialDelay = scheduleTime.getTime() - now.getTime();
    
    if (initialDelay > 0) {
      setTimeout(() => {
        sendNotification(
          'Medicine Reminder',
          'Time to take your medicine!',
          { tag: medicineId }
        );
        
        // Start escalation process
        let reminderCount = 0;
        setNotificationState(prev => ({
          ...prev,
          pendingReminders: new Map(prev.pendingReminders).set(medicineId, reminderCount)
        }));

        // Schedule follow-up reminders
        reminderIntervals.forEach((interval, index) => {
          setTimeout(() => {
            // Check if medicine was confirmed
            const currentState = notificationState.pendingReminders.get(medicineId);
            if (currentState !== undefined) {
              reminderCount++;
              
              if (index === reminderIntervals.length - 1) {
                // Final escalation to caretaker
                escalateToCaretaker(config);
              } else {
                sendNotification(
                  'Missed Medicine Alert',
                  `Please confirm your medicine intake - Reminder ${reminderCount + 1}`,
                  { tag: `${medicineId}-reminder-${reminderCount}` }
                );
              }
            }
          }, interval * 60 * 1000);
        });
      }, initialDelay);
    }
  }, [sendNotification, notificationState.pendingReminders]);

  const escalateToCaretaker = useCallback((config: NotificationConfig) => {
    const { medicineId, caretakerContact } = config;
    
    setNotificationState(prev => ({
      ...prev,
      escalatedAlerts: new Set(prev.escalatedAlerts).add(medicineId)
    }));

    // Send notification to caretaker (in real app, this would be SMS/email)
    sendNotification(
      'Patient Alert - MediMinder',
      'Patient has missed medicine intake. Please check on them.',
      { 
        tag: `caretaker-${medicineId}`,
        requireInteraction: true
      }
    );

    // Simulate SMS/Email to caretaker
    console.log(`SMS sent to caretaker ${caretakerContact}: Patient missed medicine at ${config.scheduledTime}`);
  }, [sendNotification]);

  const confirmMedicine = useCallback((medicineId: string) => {
    setNotificationState(prev => ({
      pendingReminders: new Map(prev.pendingReminders).set(medicineId, -1), // Mark as confirmed
      escalatedAlerts: new Set([...prev.escalatedAlerts].filter(id => id !== medicineId))
    }));
  }, []);

  const clearReminder = useCallback((medicineId: string) => {
    setNotificationState(prev => {
      const newReminders = new Map(prev.pendingReminders);
      newReminders.delete(medicineId);
      return {
        ...prev,
        pendingReminders: newReminders
      };
    });
  }, []);

  // Initialize notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  return {
    scheduleReminder,
    confirmMedicine,
    clearReminder,
    sendNotification,
    requestNotificationPermission,
    notificationState
  };
};