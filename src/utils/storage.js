import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeEvents = async (events) => {
  try {
    const jsonValue = JSON.stringify(events);
    await AsyncStorage.setItem('@events', jsonValue);
  } catch (e) {
    console.error('Error saving events:', e);
  }
};

export const loadEvents = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@events');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error loading events:', e);
    return [];
  }
};
