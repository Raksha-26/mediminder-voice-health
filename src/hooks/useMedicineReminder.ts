import { useState, useEffect, useCallback } from 'react';
import { Medicine } from '@/types';
import { useNotificationSystem } from './useNotificationSystem';

interface ReminderConfig {
  medicine: Medicine;
  patientId: string;
  caretakerContact?: string;
  soundEnabled: boolean;
  imageUrl?: string;
}

interface ActiveReminder {
  id: string;
  medicineId: string;
  scheduledTime: Date;
  confirmationWindowEnd: Date;
  isActive: boolean;
  audioContext?: AudioContext;
}

export const useMedicineReminder = () => {
  const [activeReminders, setActiveReminders] = useState<Map<string, ActiveReminder>>(new Map());
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const { scheduleReminder, confirmMedicine, sendNotification } = useNotificationSystem();

  // Request audio permission on mount
  useEffect(() => {
    const requestAudioPermission = async () => {
      try {
        // Request microphone permission to enable sound in silent mode
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioPermission(true);
      } catch (error) {
        console.log('Audio permission denied:', error);
        setAudioPermission(false);
      }
    };

    requestAudioPermission();
  }, []);

  const createAlarmSound = useCallback(() => {
    // Create a loud, attention-grabbing sound using Web Audio API
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create alternating high-low tone pattern
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.5);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 1);
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 1.5);

    gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

    oscillator.type = 'square';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2);

    return audioContext;
  }, []);

  const playAlarmSound = useCallback(async () => {
    if (!audioPermission) return;

    try {
      // Multiple sound patterns to ensure attention
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createAlarmSound();
        }, i * 3000); // Play every 3 seconds, 3 times
      }

      // Also try to play a system notification sound
      if ('Notification' in window && Notification.permission === 'granted') {
        sendNotification(
          '🔔 Medicine Reminder',
          'Time to take your medicine!',
          {
            requireInteraction: true,
            silent: false, // Force sound even in silent mode
            tag: 'medicine-alarm'
          }
        );
      }
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  }, [audioPermission, createAlarmSound, sendNotification]);

  const scheduleAlarm = useCallback((config: ReminderConfig) => {
    const { medicine, patientId, caretakerContact, soundEnabled } = config;

    medicine.timing.forEach((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const confirmationWindowEnd = new Date(scheduledTime.getTime() + 10 * 60 * 1000); // 10 minutes
      const reminderId = `${medicine.id}-${time}`;

      const reminder: ActiveReminder = {
        id: reminderId,
        medicineId: medicine.id,
        scheduledTime,
        confirmationWindowEnd,
        isActive: false
      };

      // Schedule the alarm
      const timeUntilAlarm = scheduledTime.getTime() - now.getTime();
      
      if (timeUntilAlarm > 0) {
        setTimeout(() => {
          // Activate reminder
          setActiveReminders(prev => {
            const updated = new Map(prev);
            updated.set(reminderId, { ...reminder, isActive: true });
            return updated;
          });

          // Play alarm sound
          if (soundEnabled) {
            playAlarmSound();
          }

          // Schedule caretaker notification if not confirmed within 10 minutes
          setTimeout(() => {
            setActiveReminders(prev => {
              const current = prev.get(reminderId);
              if (current?.isActive) {
                // Medicine not confirmed, notify caretaker
                if (caretakerContact) {
                  sendNotification(
                    '⚠️ Missed Medicine Alert',
                    `Patient missed ${medicine.name} at ${time}. Please check on them.`,
                    {
                      requireInteraction: true,
                      tag: `caretaker-${reminderId}`
                    }
                  );
                }
                
                // Deactivate reminder
                const updated = new Map(prev);
                updated.delete(reminderId);
                return updated;
              }
              return prev;
            });
          }, 10 * 60 * 1000); // 10 minutes

        }, timeUntilAlarm);
      }

      setActiveReminders(prev => new Map(prev.set(reminderId, reminder)));
    });
  }, [playAlarmSound, sendNotification]);

  const confirmMedicineIntake = useCallback((medicineId: string, time: string) => {
    const reminderId = `${medicineId}-${time}`;
    
    setActiveReminders(prev => {
      const updated = new Map(prev);
      updated.delete(reminderId);
      return updated;
    });

    // Confirm in notification system
    confirmMedicine(medicineId);
  }, [confirmMedicine]);

  const getActiveReminders = useCallback(() => {
    return Array.from(activeReminders.values()).filter(reminder => reminder.isActive);
  }, [activeReminders]);

  return {
    scheduleAlarm,
    confirmMedicineIntake,
    getActiveReminders,
    audioPermission,
    playAlarmSound
  };
};