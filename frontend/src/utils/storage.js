import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  getCurrentUser: async () => {
    try {
      const user = await AsyncStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  setCurrentUser: async (user) => {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  },

  clearCurrentUser: async () => {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error clearing current user:', error);
    }
  },
};
