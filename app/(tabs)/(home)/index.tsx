
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { storageService } from '@/utils/storage';
import { notificationService } from '@/utils/notifications';
import { Equipment, StatusSummary, PlantType } from '@/types/equipment';
import { exportToExcel } from '@/utils/excelExport';

const PLANTS: PlantType[] = ['CD-1', 'CD-2', 'CD-3', 'CD-4', 'AV-2', 'AV-3', 'PG-1', 'SER', 'DESAL', 'BC-4', 'BC-5', 'OTHER'];

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [summaries, setSummaries] = useState<StatusSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateSummaries = useCallback((data: Equipment[]) => {
    const summaryMap: { [key: string]: StatusSummary } = {};

    PLANTS.forEach(plant => {
      summaryMap[plant] = {
        plant,
        available: 0,
        inOperation: 0,
        notAvailable: 0,
        inWorkshop: 0,
        total: 0,
      };
    });

    data.forEach(item => {
      const summary = summaryMap[item.plant];
      if (summary) {
        summary.total++;
        switch (item.status) {
          case 'AVAILABLE':
            summary.available++;
            break;
          case 'IN OPERATION':
            summary.inOperation++;
            break;
          case 'NOT AVAILABLE':
            summary.notAvailable++;
            break;
          case 'IN WORKSHOP':
            summary.inWorkshop++;
            break;
        }
      }
    });

    const summariesArray = Object.values(summaryMap).filter(s => s.total > 0);
    setSummaries(summariesArray);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await storageService.getAllEquipment();
      const activeEquipment = data.filter(e => !e.deleted);
      setEquipment(activeEquipment);
      calculateSummaries(activeEquipment);
      
      // Check for overdue equipment
      await notificationService.checkOverdueEquipment(activeEquipment);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [calculateSummaries]);

  const requestNotificationPermissions = useCallback(async () => {
    await notificationService.requestPermissions();
  }, []);

  useEffect(() => {
    loadData();
    requestNotificationPermissions();
  }, [loadData, requestNotificationPermissions]);

  const handleExport = async () => {
    try {
      const allEquipment = await storageService.getAllEquipment();
      await exportToExcel(allEquipment, t);
      Alert.alert(t('exportSuccess'), '');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(t('exportError'), '');
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

  return (
    <>
      <Stack.Screen
        options={{
          title: t('home'),
          headerRight: () => (
            <TouchableOpacity onPress={handleExport} style={styles.headerButton}>
              <IconSymbol name="arrow.down.doc" size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[commonStyles.container, styles.container]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/add-equipment')}
            >
              <IconSymbol name="plus.circle.fill" size={32} color={colors.card} />
              <Text style={styles.actionButtonText}>{t('uploadNewEquipment')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
              onPress={() => router.push('/equipment-list')}
            >
              <IconSymbol name="pencil.circle.fill" size={32} color={colors.card} />
              <Text style={styles.actionButtonText}>{t('updateEquipmentStatus')}</Text>
            </TouchableOpacity>
          </View>

          {/* Status Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>{t('statusSummary')}</Text>
            
            {summaries.length === 0 ? (
              <View style={commonStyles.card}>
                <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                  {t('noEquipment')}
                </Text>
              </View>
            ) : (
              summaries.map((summary) => (
                <View key={summary.plant} style={commonStyles.card}>
                  <Text style={styles.plantName}>{summary.plant}</Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                      <Text style={styles.summaryLabel}>{t('available')}</Text>
                      <Text style={styles.summaryValue}>{summary.available}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
                      <Text style={styles.summaryLabel}>{t('inOperation')}</Text>
                      <Text style={styles.summaryValue}>{summary.inOperation}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <View style={[styles.statusDot, { backgroundColor: colors.highlight }]} />
                      <Text style={styles.summaryLabel}>{t('notAvailable')}</Text>
                      <Text style={styles.summaryValue}>{summary.notAvailable}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
                      <Text style={styles.summaryLabel}>{t('inWorkshop')}</Text>
                      <Text style={styles.summaryValue}>{summary.inWorkshop}</Text>
                    </View>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('total')}</Text>
                    <Text style={styles.totalValue}>{summary.total}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? 0 : 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 100 : 120,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 4,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  summarySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
});
