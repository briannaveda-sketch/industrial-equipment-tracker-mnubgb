
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { storageService } from '@/utils/storage';
import { changeLanguage } from '@/utils/i18n';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storageService.getUser();
    setUser(userData);
  };

  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
  };

  const handleSignOut = async () => {
    Alert.alert(
      t('logout'),
      'Are you sure you want to sign out?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await storageService.clearUser();
            setUser(null);
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color={colors.primary} />
          </View>
          {user ? (
            <>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email || ''}</Text>
            </>
          ) : (
            <Text style={styles.signInPrompt}>{t('signIn')}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'en' && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleLanguageChange('en')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'en' && { color: colors.card },
              ]}>
                {t('english')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                i18n.language === 'es' && { backgroundColor: colors.primary },
              ]}
              onPress={() => handleLanguageChange('es')}
            >
              <Text style={[
                styles.languageText,
                i18n.language === 'es' && { color: colors.card },
              ]}>
                {t('spanish')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={commonStyles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01</Text>
            </View>
          </View>
        </View>

        {user && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <IconSymbol name="arrow.right.square" size={20} color={colors.highlight} />
            <Text style={styles.signOutText}>{t('logout')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signInPrompt: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.highlight,
    marginTop: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.highlight,
  },
});
