import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { storage } from '../utils/storage';
import { api } from '../utils/api';

const AVATAR_OPTIONS = ['👤', '😊', '😎', '🤓', '😇', '🥳', '🤠', '👨', '👩', '🧑', '👨‍💻', '👩‍💻'];

export default function ProfileScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = await storage.getCurrentUser();
    if (!user) {
      navigation.replace('Login');
      return;
    }

    setCurrentUser(user);
    setName(user.name);
    setSelectedAvatar(user.avatar || '👤');

    try {
      const statsData = await api.getStats(user.identifier);
      setStats(statsData);
      setBadges(statsData.user.badges || []);

      const badgesData = await api.getBadges();
      setAllBadges(badgesData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !name.trim()) {
      Alert.alert('Erreur', 'Le nom est requis');
      return;
    }

    try {
      const updatedUser = await api.updateUser(currentUser.identifier, {
        name: name.trim(),
        avatar: selectedAvatar,
      });

      await storage.setCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          onPress: async () => {
            await storage.clearCurrentUser();
            navigation.replace('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getBadgeInfo = (badgeCode) => {
    return allBadges.find(b => b.code === badgeCode);
  };

  if (!currentUser || !stats) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.currentAvatar}>{selectedAvatar}</Text>
        <Text style={styles.headerTitle}>{name}</Text>
        <Text style={styles.headerSubtitle}>Niveau {stats.user.level}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Tâches complétées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.user.totalPoints}</Text>
            <Text style={styles.statLabel}>Points totaux</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.user.streak}</Text>
            <Text style={styles.statLabel}>Jours consécutifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.weeklyTasks}</Text>
            <Text style={styles.statLabel}>Cette semaine</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges débloqués ({badges.length})</Text>
        <View style={styles.badgesContainer}>
          {allBadges.map((badge) => {
            const unlocked = badges.includes(badge.code);
            return (
              <View
                key={badge.code}
                style={[styles.badge, !unlocked && styles.badgeLocked]}
              >
                <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                <Text style={styles.badgeName}>{badge.name}</Text>
                {unlocked && <Text style={styles.badgeUnlocked}>✓</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Modifier le profil</Text>

        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Votre nom"
        />

        <Text style={styles.label}>Avatar</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_OPTIONS.map((avatar) => (
            <TouchableOpacity
              key={avatar}
              style={[
                styles.avatarOption,
                selectedAvatar === avatar && styles.avatarOptionActive,
              ]}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Text style={styles.avatarOptionText}>{avatar}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 32,
    alignItems: 'center',
  },
  currentAvatar: {
    fontSize: 80,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: '30%',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#059669',
  },
  badgeLocked: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 10,
    color: '#1f2937',
    textAlign: 'center',
  },
  badgeUnlocked: {
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  avatarOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  avatarOptionText: {
    fontSize: 28,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
