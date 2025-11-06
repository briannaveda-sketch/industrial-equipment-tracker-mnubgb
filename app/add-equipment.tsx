
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, commonStyles } from '@/styles/commonStyles';
import { storageService } from '@/utils/storage';
import { notificationService } from '@/utils/notifications';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { Equipment, PlantType, EquipmentType, EquipmentStatus } from '@/types/equipment';
import { Picker } from '@react-native-community/datetimepicker';

const PLANTS: PlantType[] = ['CD-1', 'CD-2', 'CD-3', 'CD-4', 'AV-2', 'AV-3', 'PG-1', 'SER', 'DESAL', 'BC-4', 'BC-5', 'OTHER'];
const EQUIPMENT_TYPES: EquipmentType[] = ['PUMP', 'MOTOR', 'FAN', 'FAN COOLER', 'BLOWER', 'FURNACE', 'HEAT EXCHANGER', 'CONTROL VALVE', 'INSTRUMENT', 'DRUM', 'TOWER', 'TANK'];
const STATUSES: EquipmentStatus[] = ['AVAILABLE', 'IN OPERATION', 'NOT AVAILABLE', 'IN WORKSHOP'];

export default function AddEquipmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tag, setTag] = useState('');
  const [plant, setPlant] = useState<PlantType>('CD-1');
  const [type, setType] = useState<EquipmentType>('PUMP');
  const [status, setStatus] = useState<EquipmentStatus>('AVAILABLE');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tag.trim()) {
      Alert.alert(t('requiredField'), t('tag'));
      return;
    }

    setSaving(true);
    try {
      const deviceInfo = await getDeviceInfo();
      const newEquipment: Equipment = {
        id: Date.now().toString(),
        tag: tag.trim(),
        plant,
        type,
        status,
        comments: comments.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storageService.addEquipment(newEquipment);

      // Add change log
      await storageService.addChangeLog({
        id: Date.now().toString(),
        equipmentId: newEquipment.id,
        action: 'CREATE',
        timestamp: Date.now(),
        changes: newEquipment,
        deviceInfo: {
          deviceName: deviceInfo.deviceName,
          ipAddress: deviceInfo.ipAddress,
        },
      });

      // Send notification
      await notificationService.scheduleNotification(
        t('equipmentAdded'),
        `${tag} - ${t(type)} (${plant})`,
      );

      Alert.alert(t('equipmentAdded'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving equipment:', error);
      Alert.alert('Error', 'Failed to save equipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t('uploadNewEquipment'),
          presentation: 'modal',
        }}
      />
      <View style={commonStyles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('tag')} *</Text>
              <TextInput
                style={commonStyles.input}
                value={tag}
                onChangeText={setTag}
                placeholder="e.g., P-101"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('plant')} *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {PLANTS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.chip,
                        plant === p && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setPlant(p)}
                    >
                      <Text style={[
                        styles.chipText,
                        plant === p && { color: colors.card },
                      ]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('type')} *</Text>
              <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {EQUIPMENT_TYPES.map((et) => (
                    <TouchableOpacity
                      key={et}
                      style={[
                        styles.chip,
                        type === et && { backgroundColor: colors.secondary },
                      ]}
                      onPress={() => setType(et)}
                    >
                      <Text style={[
                        styles.chipText,
                        type === et && { color: colors.card },
                      ]}>
                        {t(et)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('status')} *</Text>
              <View style={styles.statusContainer}>
                {STATUSES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusChip,
                      status === s && { 
                        backgroundColor: getStatusColor(s),
                        borderColor: getStatusColor(s),
                      },
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text style={[
                      styles.statusChipText,
                      status === s && { color: colors.card },
                    ]}>
                      {t(s)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('comments')}</Text>
              <TextInput
                style={[commonStyles.input, styles.textArea]}
                value={comments}
                onChangeText={setComments}
                placeholder={t('comments')}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.back()}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : t('save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'AVAILABLE':
      return colors.success;
    case 'IN OPERATION':
      return colors.primary;
    case 'NOT AVAILABLE':
      return colors.highlight;
    case 'IN WORKSHOP':
      return colors.warning;
    default:
      return colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  form: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  pickerContainer: {
    marginTop: 4,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
