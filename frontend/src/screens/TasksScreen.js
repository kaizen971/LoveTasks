import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { api } from '../utils/api';
import { storage } from '../utils/storage';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: 'both',
    points: 1,
    category: 'other',
    recurring: 'weekly',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await storage.getCurrentUser();
    setCurrentUser(user);
    await loadTasks();
    await loadUsers();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Erreur', 'Impossible de charger les tâches');
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

  const createTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Erreur', 'Le titre est requis');
      return;
    }

    try {
      await api.createTask(newTask);
      setModalVisible(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: 'both',
        points: 1,
        category: 'other',
        recurring: 'weekly',
      });
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Erreur', 'Impossible de créer la tâche');
    }
  };

  const toggleTaskCompletion = async (task) => {
    if (!currentUser) return;

    const completedBy = task.completed ? null : currentUser.identifier;
    try {
      await api.updateTask(task._id, {
        completed: !task.completed,
        completedBy: completedBy,
      });
      loadTasks();
      loadUsers();

      // Send encouragement feedback to partner
      if (!task.completed) {
        const partnerId = currentUser.identifier === 'person1' ? 'person2' : 'person1';
        await api.createFeedback({
          fromUser: currentUser.identifier,
          toUser: partnerId,
          taskId: task._id,
          type: 'celebration',
          message: `${currentUser.name} a complété: ${task.title}`,
          emoji: '🎉',
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la tâche');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la tâche');
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

  return (
    <View style={styles.container}>
      {/* Leaderboard */}
      <View style={styles.leaderboard}>
        {users.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <Text style={styles.userAvatar}>{user.avatar}</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userLevel}>Niveau {user.level}</Text>
            <Text style={styles.userPoints}>{user.totalPoints} pts</Text>
            {user.streak > 0 && (
              <Text style={styles.userStreak}>🔥 {user.streak} jours</Text>
            )}
          </View>
        ))}
      </View>

      {/* Tasks List */}
      <ScrollView
        style={styles.tasksList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            style={[
              styles.taskCard,
              task.completed && styles.taskCardCompleted,
            ]}
            onPress={() => toggleTaskCompletion(task)}
            onLongPress={() => {
              Alert.alert(
                'Supprimer la tâche',
                'Voulez-vous supprimer cette tâche ?',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', onPress: () => deleteTask(task._id), style: 'destructive' },
                ]
              );
            }}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskEmoji}>{getCategoryEmoji(task.category)}</Text>
              <View style={styles.taskInfo}>
                <Text style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleCompleted,
                ]}>
                  {task.title}
                </Text>
                {task.description ? (
                  <Text style={styles.taskDescription}>{task.description}</Text>
                ) : null}
              </View>
              <Text style={styles.taskPoints}>+{task.points}</Text>
            </View>
            <View style={styles.taskFooter}>
              <Text style={styles.taskMeta}>
                {task.recurring !== 'none' && `🔄 ${task.recurring}`}
                {task.assignedTo !== 'both' && ` • Assigné à ${task.assignedTo}`}
              </Text>
              {task.completed && (
                <Text style={styles.completedBadge}>✓ Complété</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Nouvelle tâche</Text>
      </TouchableOpacity>

      {/* Modal for creating new task */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle tâche</Text>

            <TextInput
              style={styles.input}
              placeholder="Titre de la tâche"
              value={newTask.title}
              onChangeText={(text) => setNewTask({ ...newTask, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optionnel)"
              value={newTask.description}
              onChangeText={(text) => setNewTask({ ...newTask, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Catégorie:</Text>
            <View style={styles.buttonGroup}>
              {['cleaning', 'cooking', 'shopping', 'maintenance', 'other'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.optionButton,
                    newTask.category === cat && styles.optionButtonActive,
                  ]}
                  onPress={() => setNewTask({ ...newTask, category: cat })}
                >
                  <Text style={styles.optionButtonText}>
                    {getCategoryEmoji(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Points:</Text>
            <View style={styles.buttonGroup}>
              {[1, 2, 3, 5].map((pts) => (
                <TouchableOpacity
                  key={pts}
                  style={[
                    styles.optionButton,
                    newTask.points === pts && styles.optionButtonActive,
                  ]}
                  onPress={() => setNewTask({ ...newTask, points: pts })}
                >
                  <Text style={styles.optionButtonText}>{pts}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={createTask}
              >
                <Text style={styles.createButtonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  leaderboard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userCard: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  userAvatar: {
    fontSize: 32,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  userLevel: {
    fontSize: 11,
    color: '#6366f1',
    marginTop: 2,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 4,
  },
  userStreak: {
    fontSize: 10,
    color: '#f59e0b',
    marginTop: 2,
  },
  tasksList: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: '#f0fdf4',
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  taskPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  completedBadge: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  optionButtonText: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#6366f1',
    marginLeft: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
