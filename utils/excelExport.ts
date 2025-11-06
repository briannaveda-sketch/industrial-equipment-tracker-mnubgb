
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Equipment } from '../types/equipment';

export const exportToExcel = async (equipment: Equipment[], t: any): Promise<void> => {
  try {
    // Group equipment by plant
    const groupedByPlant: { [key: string]: Equipment[] } = {};
    
    equipment.forEach(item => {
      if (!item.deleted) {
        if (!groupedByPlant[item.plant]) {
          groupedByPlant[item.plant] = [];
        }
        groupedByPlant[item.plant].push(item);
      }
    });

    // Create CSV content
    let csvContent = '';
    
    Object.keys(groupedByPlant).sort().forEach(plant => {
      csvContent += `\n${plant}\n`;
      csvContent += 'TAG,Type,Status,Comments,Created,Updated\n';
      
      groupedByPlant[plant].forEach(item => {
        const createdDate = new Date(item.createdAt).toLocaleDateString();
        const updatedDate = new Date(item.updatedAt).toLocaleDateString();
        csvContent += `"${item.tag}","${t(item.type)}","${t(item.status)}","${item.comments.replace(/"/g, '""')}","${createdDate}","${updatedDate}"\n`;
      });
      
      csvContent += '\n';
    });

    // Save to file
    const fileName = `equipment_export_${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Equipment Data',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};
