
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return true;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async scheduleNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  async checkOverdueEquipment(equipment: any[]): Promise<void> {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    const overdueEquipment = equipment.filter(e => 
      !e.deleted &&
      (e.status === 'NOT AVAILABLE' || e.status === 'IN WORKSHOP') &&
      e.updatedAt < thirtyDaysAgo
    );

    if (overdueEquipment.length > 0) {
      await this.scheduleNotification(
        'Equipment Alert',
        `${overdueEquipment.length} equipment item(s) have been in critical status for over 30 days`,
        { overdueCount: overdueEquipment.length }
      );
    }
  },
};
