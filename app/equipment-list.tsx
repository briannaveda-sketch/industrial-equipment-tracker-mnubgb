
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { storageService } from '@/utils/storage';
import { Equipment } from '@/types/equipment';

export default function EquipmentListScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadEquipment = useCallback(async () => {
    try {
      const data = await storageService.getAllEquipment();
      const activeEquipment = data.filter(e => !e.deleted);
      setEquipment(activeEquipment);
      setFilteredEquipment(activeEquipment);
    } catch (error) {
      console.error('Error loading equipment:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterEquipment = useCallback(() => {
    if (!searchQuery.trim()) {
      setFilteredEquipment(equipment);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = equipment.filter(e =>
      e.tag.toLowerCase().includes(query) ||
      e.plant.toLowerCase().includes(query) ||
      e.type.toLowerCase().includes(query) ||
      e.status.toLowerCase().includes(query)
    );
    setFilteredEquipment(filtered);
  }, [searchQuery, equipment]);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  useEffect(() => {
    filterEquipment();
  }, [filterEquipment]);

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

  const renderEquipmentItem = ({ item }: { item: Equipment }) => (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={() => router.push(`/equipment-detail?id=${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{item.tag}</Text>
          <Text style={styles.plant}>{item.plant}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{t(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <IconSymbol name="wrench.fill" size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>{t(item.type)}</Text>
        </View>
        {item.comments ? (
          <View style={styles.infoRow}>
            <IconSymbol name="text.bubble" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{item.comments}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          {t('updated')}: {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
        <IconSymbol name="chevron.right" size={16} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t('updateEquipmentStatus'),
          presentation: 'modal',
        }}
      />
      <View style={commonStyles.container}>
        <View style={styles.searchContainer}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('search')}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {filteredEquipment.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="tray" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>{t('noEquipment')}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEquipment}
            renderItem={renderEquipmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    margin: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  equipmentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagContainer: {
    flex: 1,
  },
  tag: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  plant: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
});
