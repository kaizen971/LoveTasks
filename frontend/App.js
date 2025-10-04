import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import TasksScreen from './src/screens/TasksScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import StatsScreen from './src/screens/StatsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { storage } from './src/utils/storage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#6366f1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Tâches"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>✓</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={FeedbackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>💌</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const user = await storage.getCurrentUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>💑</Text>
        <Text style={styles.loadingText}>LoveTasks</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
});
