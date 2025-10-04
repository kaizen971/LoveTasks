import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { storage } from '../utils/storage';
import { api } from '../utils/api';

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogin = async () => {
    if (!selectedUser) {
      Alert.alert('Erreur', 'Veuillez sélectionner un utilisateur');
      return;
    }

    try {
      const users = await api.getUsers();
      let user = users.find(u => u.identifier === selectedUser);

      if (!user) {
        // Create user if not exists
        const userName = name.trim() || (selectedUser === 'person1' ? 'Person 1' : 'Person 2');
        user = await api.createUser({
          name: userName,
          identifier: selectedUser,
        });
      } else if (name.trim() && name.trim() !== user.name) {
        // Update name if changed
        user = await api.updateUser(selectedUser, { name: name.trim() });
      }

      await storage.setCurrentUser(user);
      navigation.replace('Main');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erreur', 'Impossible de se connecter');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>💑</Text>
        <Text style={styles.title}>LoveTasks</Text>
        <Text style={styles.subtitle}>Tâches ménagères partagées</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Votre nom</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre nom"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Je suis...</Text>
          <View style={styles.userButtons}>
            <TouchableOpacity
              style={[
                styles.userButton,
                selectedUser === 'person1' && styles.userButtonActive,
              ]}
              onPress={() => setSelectedUser('person1')}
            >
              <Text style={styles.userButtonEmoji}>👤</Text>
              <Text style={[
                styles.userButtonText,
                selectedUser === 'person1' && styles.userButtonTextActive,
              ]}>
                Personne 1
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userButton,
                selectedUser === 'person2' && styles.userButtonActive,
              ]}
              onPress={() => setSelectedUser('person2')}
            >
              <Text style={styles.userButtonEmoji}>👤</Text>
              <Text style={[
                styles.userButtonText,
                selectedUser === 'person2' && styles.userButtonTextActive,
              ]}>
                Personne 2
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              !selectedUser && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!selectedUser}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366f1',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 48,
  },
  form: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  userButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  userButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  userButtonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  userButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  userButtonTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
