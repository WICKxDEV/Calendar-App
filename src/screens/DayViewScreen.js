import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { loadEvents, storeEvents } from '../utils/storage';
import dayjs from 'dayjs';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const DayViewScreen = ({ route, navigation }) => {
  const { selectedDate } = route.params;
  const [events, setEvents] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEvents = async () => {
    const stored = await loadEvents();
    const filteredEvents = stored.filter(event => event.date === selectedDate);
    setEvents(filteredEvents.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
  };

  const confirmDelete = (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => handleDelete(eventId), style: 'destructive' }
      ]
    );
  };

  const handleDelete = async (eventId) => {
    try {
      const stored = await loadEvents();
      const updatedEvents = stored.filter(event => event.id !== eventId);
      await storeEvents(updatedEvents);
      setEvents(updatedEvents.filter(event => event.date === selectedDate));
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  const handleEdit = (event) => {
    navigation.navigate('EditEvent', { event });
  };

  const renderRightActions = (event) => {
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity 
          style={[styles.swipeButton, styles.editButton]} 
          onPress={() => handleEdit(event)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.swipeButton, styles.deleteButton]} 
          onPress={() => confirmDelete(event.id)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEvent = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      friction={2}
      rightThreshold={40}
    >
      <View style={styles.eventItem}>
        <View style={styles.timeIndicator} />
        <View style={styles.eventContent}>
          <Text style={styles.eventTime}>{item.time || 'All day'}</Text>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          <Text style={styles.header}>
            {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
          </Text>
          
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-available" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No events scheduled</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('AddEvent', { initialDate: selectedDate })}
                activeOpacity={0.8}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text style={styles.addButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={events}
              renderItem={renderEvent}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 24,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  timeIndicator: {
    width: 4,
    backgroundColor: '#4a90e2',
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  eventTime: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 8,
    fontWeight: '500',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  swipeActions: {
    flexDirection: 'row',
    width: 160,
    height: '100%',
  },
  swipeButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4a90e2',
  },
  deleteButton: {
    backgroundColor: '#ff453a',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DayViewScreen;