
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Equipment, ChangeLog } from '../types/equipment';

const EQUIPMENT_KEY = '@equipment_data';
const CHANGELOG_KEY = '@changelog_data';
const USER_KEY = '@user_data';

export const storageService = {
  // Equipment operations
  async getAllEquipment(): Promise<Equipment[]> {
    try {
      const data = await AsyncStorage.getItem(EQUIPMENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting equipment:', error);
      return [];
    }
  },

  async saveEquipment(equipment: Equipment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
    } catch (error) {
      console.error('Error saving equipment:', error);
      throw error;
    }
  },

  async addEquipment(equipment: Equipment): Promise<void> {
    try {
      const allEquipment = await this.getAllEquipment();
      allEquipment.push(equipment);
      await this.saveEquipment(allEquipment);
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  },

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<void> {
    try {
      const allEquipment = await this.getAllEquipment();
      const index = allEquipment.findIndex(e => e.id === id);
      if (index !== -1) {
        allEquipment[index] = { ...allEquipment[index], ...updates, updatedAt: Date.now() };
        await this.saveEquipment(allEquipment);
      }
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },

  async deleteEquipment(id: string, reason: string, details?: string): Promise<void> {
    try {
      const allEquipment = await this.getAllEquipment();
      const index = allEquipment.findIndex(e => e.id === id);
      if (index !== -1) {
        allEquipment[index] = {
          ...allEquipment[index],
          deleted: true,
          deletionReason: reason as any,
          deletionDetails: details,
          updatedAt: Date.now(),
        };
        await this.saveEquipment(allEquipment);
      }
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Change log operations
  async getAllChangeLogs(): Promise<ChangeLog[]> {
    try {
      const data = await AsyncStorage.getItem(CHANGELOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting change logs:', error);
      return [];
    }
  },

  async addChangeLog(log: ChangeLog): Promise<void> {
    try {
      const allLogs = await this.getAllChangeLogs();
      allLogs.push(log);
      await AsyncStorage.setItem(CHANGELOG_KEY, JSON.stringify(allLogs));
    } catch (error) {
      console.error('Error adding change log:', error);
      throw error;
    }
  },

  // User operations
  async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  async getUser(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing user:', error);
      throw error;
    }
  },
};
