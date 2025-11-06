
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { storageService } from '@/utils/storage';
import { notificationService } from '@/utils/notifications';
import { getDeviceInfo } from '@/utils/deviceInfo';
import { Equipment, PlantType, EquipmentType, EquipmentStatus, DeletionReason } from '@/types/equipment';

const PLANTS: PlantType[] = ['CD-1', 'CD-2', 'CD-3', 'CD-4', 'AV-2', 'AV-3', 'PG-1', 'SER', 'DESAL', 'BC-4', 'BC-5', 'OTHER'];
const EQUIPMENT_TYPES: EquipmentType[] = ['PUMP', 'MOTOR', 'FAN', 'FAN COOLER', 'BLOWER', 'FURNACE', 'HEAT EXCHANGER', 'CONTROL VALVE', 'INSTRUMENT', 'DRUM', 'TOWER', 'TANK'];
const STATUSES: EquipmentStatus[] = ['AVAILABLE', 'IN OPERATION', 'NOT AVAILABLE', 'IN WORKSHOP'];
const DELETION_REASONS: DeletionReason[] = ['UPLOAD ERROR', 'DEVICE DISASSEMBLED', 'OTHER'];

export default function EquipmentDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [tag, setTag] = useState('');
  const [plant, setPlant] = useState<PlantType>('CD-1');
  const [type, setType] = useState<EquipmentType>('PUMP');
  const [status, setStatus] = useState<EquipmentStatus>('AVAILABLE');
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState<DeletionReason>('UPLOAD ERROR');
  const [deletionDetails, setDeletionDetails] = useState('');

  const loadEquipment = useCallback(async () => {
    try {
      const allEquipment = await storageService.getAllEquipment();
      const found = allEquipment.find(e => e.id === id);
      if (found) {
        setEquipment(found);
        setTag(found.tag);
        setPlant(found.plant);
        setType(found.type);
        setStatus(found.status);
        setComments(found.comments);
      }
    } catch (error) {
      console.error('Error loading equipment:', error);
    }
  }, [id]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleSave = async () => {
    if (!tag.trim()) {
      Alert.alert(t('requiredField'), t('tag'));
      return;
    }

    setSaving(true);
    try {
      const deviceInfo = await getDeviceInfo();
      const updates: Partial<Equipment> = {
        tag: tag.trim(),
        plant,
        type,
        status,
        comments: comments.trim(),
      };

      await storageService.updateEquipment(id as string, updates);

      // Add change log
      await storageService.addChangeLog({
        id: Date.now().toString(),
        equipmentId: id as string,
        action: 'UPDATE',
        timestamp: Date.now(),
        changes: updates,
        deviceInfo: {
          deviceName: deviceInfo.deviceName,
          ipAddress: deviceInfo.ipAddress,
        },
      });

      // Send notification
      await notificationService.scheduleNotification(
        t('newUpdate'),
        `${tag} - ${t(status)}`,
      );

      Alert.alert(t('equipmentUpdated'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error updating equipment:', error);
      Alert.alert('Error', 'Failed to update equipment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deletionReason === 'OTHER' && !deletionDetails.trim()) {
      Alert.alert(t('requiredField'), t('provideDetails'));
      return;
    }

    try {
      const deviceInfo = await getDeviceInfo();
      await storageService.deleteEquipment(
        id as string,
        deletionReason,
        deletionReason === 'OTHER' ? deletionDetails : undefined
      );

      // Add change log
      await storageService.addChangeLog({
        id: Date.now().toString(),
        equipmentId: id as string,
        action: 'DELETE',
        timestamp: Date.now(),
        changes: { deletionReason, deletionDetails },
        deviceInfo: {
          deviceName: deviceInfo.deviceName,
          ipAddress: deviceInfo.ipAddress,
        },
      });

      setShowDeleteModal(false);
      Alert.alert(t('equipmentDeleted'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      Alert.alert('Error', 'Failed to delete equipment');
    }
  };

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

  if (!equipment) {
    return (
      <View style={commonStyles.container}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: equipment.tag,
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
                style={[styles.button, styles.deleteButton]}
                onPress={() => setShowDeleteModal(true)}
                disabled={saving}
              >
                <IconSymbol name="trash" size={20} color={colors.card} />
                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
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

        {/* Delete Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('deleteEquipment')}</Text>
              <Text style={styles.modalSubtitle}>{t('deletionReason')}</Text>

              <View style={styles.reasonContainer}>
                {DELETION_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonChip,
                      deletionReason === reason && { backgroundColor: colors.highlight },
                    ]}
                    onPress={() => setDeletionReason(reason)}
                  >
                    <Text style={[
                      styles.reasonText,
                      deletionReason === reason && { color: colors.card },
                    ]}>
                      {t(reason)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {deletionReason === 'OTHER' && (
                <TextInput
                  style={[commonStyles.input, styles.textArea]}
                  value={deletionDetails}
                  onChangeText={setDeletionDetails}
                  placeholder={t('provideDetails')}
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.modalCancelText}>{t('cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalDeleteButton]}
                  onPress={handleDelete}
                >
                  <Text style={styles.modalDeleteText}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

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
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: colors.highlight,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  reasonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.background,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalDeleteButton: {
    backgroundColor: colors.highlight,
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
});
