
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export const getDeviceInfo = async () => {
  const deviceName = Device.deviceName || 'Unknown Device';
  
  // Get IP address (simplified - in production you'd use a proper library)
  let ipAddress = 'Unknown';
  try {
    // This is a placeholder - actual IP detection would require additional setup
    ipAddress = Platform.OS === 'web' ? 'Web Browser' : 'Mobile Device';
  } catch (error) {
    console.error('Error getting IP address:', error);
  }

  return {
    deviceName,
    ipAddress,
    platform: Platform.OS,
    osVersion: Device.osVersion || 'Unknown',
  };
};
