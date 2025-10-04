import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { storage } from '../utils/storage';
import { api } from '../utils/api';

export default function StatsScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await storage.getCurrentUser();
    if (!user) {
      navigation.replace('Login');
      return;
    }
    setCurrentUser(user);
    await loadStats(user);
    await loadUsers();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadStats = async (user) => {
    try {
      const data = await api.getStats(user.identifier);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      cleaning: '🧹',
      cooking: '🍳',
      shopping: '🛒',
      maintenance: '🔧',
      other: '📋',
    };
    return emojis[category] || '📋';
  };

  const getCategoryName = (category) => {
    const names = {
      cleaning: 'Ménage',
      cooking: 'Cuisine',
      shopping: 'Courses',
      maintenance: 'Bricolage',
      other: 'Autre',
    };
    return names[category] || 'Autre';
  };

  if (!currentUser || !stats) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vos Statistiques</Text>
        <Text style={styles.headerSubtitle}>{currentUser.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
        <View style={styles.statsGrid}>
          <View style={styles.bigStatCard}>
            <Text style={styles.bigStatValue}>{stats.user.totalPoints}</Text>
            <Text style={styles.bigStatLabel}>Points totaux</Text>
          </View>
          <View style={styles.bigStatCard}>
            <Text style={styles.bigStatValue}>{stats.totalTasks}</Text>
            <Text style={styles.bigStatLabel}>Tâches complétées</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>Niveau {stats.user.level}</Text>
            <Text style={styles.statLabel}>Niveau actuel</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{stats.user.streak} jours</Text>
            <Text style={styles.statLabel}>Série en cours</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statValue}>{stats.weeklyTasks}</Text>
            <Text style={styles.statLabel}>Cette semaine</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tâches par catégorie</Text>
        {stats.categoriesStats.length === 0 ? (
          <Text style={styles.emptyText}>Aucune tâche complétée</Text>
        ) : (
          stats.categoriesStats.map((cat) => (
            <View key={cat._id} style={styles.categoryRow}>
              <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat._id)}</Text>
              <Text style={styles.categoryName}>{getCategoryName(cat._id)}</Text>
              <View style={styles.categoryBar}>
                <View
                  style={[
                    styles.categoryBarFill,
                    { width: `${(cat.count / stats.totalTasks) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.categoryCount}>{cat.count}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classement</Text>
        {users
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((user, index) => (
            <View
              key={user._id}
              style={[
                styles.leaderboardRow,
                user.identifier === currentUser.identifier && styles.leaderboardRowCurrent,
              ]}
            >
              <Text style={styles.leaderboardRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </Text>
              <Text style={styles.leaderboardAvatar}>{user.avatar}</Text>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>
                  {user.name}
                  {user.identifier === currentUser.identifier && ' (vous)'}
                </Text>
                <Text style={styles.leaderboardLevel}>Niveau {user.level}</Text>
              </View>
              <View style={styles.leaderboardStats}>
                <Text style={styles.leaderboardPoints}>{user.totalPoints} pts</Text>
                <Text style={styles.leaderboardTasks}>{user.tasksCompleted} tâches</Text>
              </View>
            </View>
          ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges ({stats.badges.length})</Text>
        <Text style={styles.sectionSubtitle}>
          Continuez à accomplir des tâches pour débloquer plus de badges!
        </Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Prochain badge: {stats.user.tasksCompleted < 10 ? '⭐ Contributeur (10 tâches)' : stats.user.tasksCompleted < 50 ? '🏆 Expert (50 tâches)' : '👑 Légende (100 tâches)'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  bigStatCard: {
    flex: 1,
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  bigStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  bigStatLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    width: 80,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    width: 30,
    textAlign: 'right',
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  leaderboardRowCurrent: {
    backgroundColor: '#eef2ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  leaderboardRank: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  leaderboardLevel: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 2,
  },
  leaderboardStats: {
    alignItems: 'flex-end',
  },
  leaderboardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  leaderboardTasks: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  progressInfo: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },
});
