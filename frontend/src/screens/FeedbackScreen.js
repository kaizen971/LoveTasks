import React, { useState, useEffect } from 'react';
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
import { storage } from '../utils/storage';
import { api } from '../utils/api';

const FEEDBACK_TYPES = [
  { type: 'appreciation', emoji: '💖', label: 'Appréciation' },
  { type: 'encouragement', emoji: '💪', label: 'Encouragement' },
  { type: 'celebration', emoji: '🎉', label: 'Célébration' },
  { type: 'reminder', emoji: '⏰', label: 'Rappel' },
];

export default function FeedbackScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    type: 'appreciation',
    message: '',
  });

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
    await loadFeedbacks(user);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadFeedbacks = async (user) => {
    try {
      const data = await api.getFeedback(user.identifier);
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    }
  };

  const sendFeedback = async () => {
    if (!currentUser || !newFeedback.message.trim()) {
      Alert.alert('Erreur', 'Le message est requis');
      return;
    }

    const partnerId = currentUser.identifier === 'person1' ? 'person2' : 'person1';
    const feedbackType = FEEDBACK_TYPES.find(f => f.type === newFeedback.type);

    try {
      await api.createFeedback({
        fromUser: currentUser.identifier,
        toUser: partnerId,
        type: newFeedback.type,
        message: newFeedback.message.trim(),
        emoji: feedbackType.emoji,
      });

      setModalVisible(false);
      setNewFeedback({ type: 'appreciation', message: '' });
      Alert.alert('Succès', 'Message envoyé');
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const markAsRead = async (feedbackId) => {
    try {
      await api.markFeedbackAsRead(feedbackId);
      loadFeedbacks(currentUser);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getTypeEmoji = (type) => {
    const feedbackType = FEEDBACK_TYPES.find(f => f.type === type);
    return feedbackType ? feedbackType.emoji : '💬';
  };

  const getTypeLabel = (type) => {
    const feedbackType = FEEDBACK_TYPES.find(f => f.type === type);
    return feedbackType ? feedbackType.label : 'Message';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'À l\'instant';
    if (diffInMins < 60) return `Il y a ${diffInMins} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.feedbackList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {feedbacks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>💌</Text>
            <Text style={styles.emptyStateText}>Aucun message pour le moment</Text>
            <Text style={styles.emptyStateSubtext}>
              Envoyez un message d'encouragement à votre partenaire!
            </Text>
          </View>
        ) : (
          feedbacks.map((feedback) => (
            <TouchableOpacity
              key={feedback._id}
              style={[
                styles.feedbackCard,
                !feedback.read && styles.feedbackCardUnread,
              ]}
              onPress={() => !feedback.read && markAsRead(feedback._id)}
            >
              <View style={styles.feedbackHeader}>
                <Text style={styles.feedbackEmoji}>{feedback.emoji || getTypeEmoji(feedback.type)}</Text>
                <View style={styles.feedbackInfo}>
                  <Text style={styles.feedbackType}>{getTypeLabel(feedback.type)}</Text>
                  <Text style={styles.feedbackDate}>{formatDate(feedback.createdAt)}</Text>
                </View>
                {!feedback.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.feedbackMessage}>{feedback.message}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.sendButtonText}>💌 Envoyer un message</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Envoyer un message</Text>

            <Text style={styles.label}>Type de message:</Text>
            <View style={styles.typeButtons}>
              {FEEDBACK_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.typeButton,
                    newFeedback.type === type.type && styles.typeButtonActive,
                  ]}
                  onPress={() => setNewFeedback({ ...newFeedback, type: type.type })}
                >
                  <Text style={styles.typeButtonEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.typeButtonText,
                    newFeedback.type === type.type && styles.typeButtonTextActive,
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Message:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Écrivez votre message..."
              value={newFeedback.message}
              onChangeText={(text) => setNewFeedback({ ...newFeedback, message: text })}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={sendFeedback}
              >
                <Text style={styles.createButtonText}>Envoyer</Text>
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
  feedbackList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  feedbackCard: {
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
  feedbackCardUnread: {
    backgroundColor: '#eef2ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  feedbackEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  feedbackInfo: {
    flex: 1,
  },
  feedbackType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  feedbackMessage: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
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
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    width: '47%',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  typeButtonEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
