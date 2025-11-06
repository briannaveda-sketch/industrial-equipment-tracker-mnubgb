
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@app_language';

const resources = {
  en: {
    translation: {
      // Home Screen
      home: 'Home',
      uploadNewEquipment: 'Upload New Equipment',
      updateEquipmentStatus: 'Update Equipment Status',
      statusSummary: 'Status Summary',
      available: 'Available',
      inOperation: 'In Operation',
      notAvailable: 'Not Available',
      inWorkshop: 'In Workshop',
      total: 'Total',
      
      // Equipment Form
      tag: 'TAG',
      plant: 'Plant',
      type: 'Type',
      status: 'Status',
      comments: 'Comments',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      
      // Equipment Types
      PUMP: 'Pump',
      MOTOR: 'Motor',
      FAN: 'Fan',
      'FAN COOLER': 'Fan Cooler',
      BLOWER: 'Blower',
      FURNACE: 'Furnace',
      'HEAT EXCHANGER': 'Heat Exchanger',
      'CONTROL VALVE': 'Control Valve',
      INSTRUMENT: 'Instrument',
      DRUM: 'Drum',
      TOWER: 'Tower',
      TANK: 'Tank',
      
      // Status
      AVAILABLE: 'Available',
      'IN OPERATION': 'In Operation',
      'NOT AVAILABLE': 'Not Available',
      'IN WORKSHOP': 'In Workshop',
      
      // Actions
      export: 'Export to Excel',
      search: 'Search',
      filter: 'Filter',
      notifications: 'Notifications',
      settings: 'Settings',
      
      // Deletion
      deleteEquipment: 'Delete Equipment',
      deletionReason: 'Reason for Deletion',
      'UPLOAD ERROR': 'Upload Error',
      'DEVICE DISASSEMBLED': 'Device Disassembled',
      OTHER: 'Other',
      provideDetails: 'Please provide details',
      
      // Messages
      equipmentAdded: 'Equipment added successfully',
      equipmentUpdated: 'Equipment updated successfully',
      equipmentDeleted: 'Equipment deleted successfully',
      exportSuccess: 'Data exported successfully',
      exportError: 'Error exporting data',
      noEquipment: 'No equipment found',
      
      // Notifications
      alertTitle: 'Equipment Alert',
      alertMessage: 'equipment has been in {{status}} status for more than 30 days',
      newUpdate: 'Equipment status updated',
      
      // Profile
      profile: 'Profile',
      language: 'Language',
      english: 'English',
      spanish: 'Spanish',
      logout: 'Logout',
      signIn: 'Sign In with Google',
      signedInAs: 'Signed in as',
      
      // Validation
      requiredField: 'This field is required',
      invalidTag: 'Invalid TAG format',
    },
  },
  es: {
    translation: {
      // Home Screen
      home: 'Inicio',
      uploadNewEquipment: 'Cargar Nuevo Equipo',
      updateEquipmentStatus: 'Actualizar Estado del Equipo',
      statusSummary: 'Resumen de Estado',
      available: 'Disponible',
      inOperation: 'En Operación',
      notAvailable: 'No Disponible',
      inWorkshop: 'En Taller',
      total: 'Total',
      
      // Equipment Form
      tag: 'TAG',
      plant: 'Planta',
      type: 'Tipo',
      status: 'Estado',
      comments: 'Comentarios',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      
      // Equipment Types
      PUMP: 'Bomba',
      MOTOR: 'Motor',
      FAN: 'Ventilador',
      'FAN COOLER': 'Ventilador Enfriador',
      BLOWER: 'Soplador',
      FURNACE: 'Horno',
      'HEAT EXCHANGER': 'Intercambiador de Calor',
      'CONTROL VALVE': 'Válvula de Control',
      INSTRUMENT: 'Instrumento',
      DRUM: 'Tambor',
      TOWER: 'Torre',
      TANK: 'Tanque',
      
      // Status
      AVAILABLE: 'Disponible',
      'IN OPERATION': 'En Operación',
      'NOT AVAILABLE': 'No Disponible',
      'IN WORKSHOP': 'En Taller',
      
      // Actions
      export: 'Exportar a Excel',
      search: 'Buscar',
      filter: 'Filtrar',
      notifications: 'Notificaciones',
      settings: 'Configuración',
      
      // Deletion
      deleteEquipment: 'Eliminar Equipo',
      deletionReason: 'Razón de Eliminación',
      'UPLOAD ERROR': 'Error de Carga',
      'DEVICE DISASSEMBLED': 'Dispositivo Desmontado',
      OTHER: 'Otro',
      provideDetails: 'Por favor proporcione detalles',
      
      // Messages
      equipmentAdded: 'Equipo agregado exitosamente',
      equipmentUpdated: 'Equipo actualizado exitosamente',
      equipmentDeleted: 'Equipo eliminado exitosamente',
      exportSuccess: 'Datos exportados exitosamente',
      exportError: 'Error al exportar datos',
      noEquipment: 'No se encontró equipo',
      
      // Notifications
      alertTitle: 'Alerta de Equipo',
      alertMessage: 'equipo ha estado en estado {{status}} por más de 30 días',
      newUpdate: 'Estado del equipo actualizado',
      
      // Profile
      profile: 'Perfil',
      language: 'Idioma',
      english: 'Inglés',
      spanish: 'Español',
      logout: 'Cerrar Sesión',
      signIn: 'Iniciar Sesión con Google',
      signedInAs: 'Sesión iniciada como',
      
      // Validation
      requiredField: 'Este campo es obligatorio',
      invalidTag: 'Formato de TAG inválido',
    },
  },
};

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  i18n.changeLanguage(language);
};

initI18n();

export default i18n;
