import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { loadEvents, storeEvents } from '../utils/storage';
import dayjs from 'dayjs';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons'; // Importing FontAwesome icons

const DayViewScreen = ({ route, navigation }) => {
  const { selectedDate } = route.params;
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEvents();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchEvents = async () => {
    const stored = await loadEvents();
    const filteredEvents = stored.filter(event => event.date === selectedDate);
    setEvents(filteredEvents);
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
        >
          <FontAwesome name="pencil" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.swipeButton, styles.deleteButton]} 
          onPress={() => confirmDelete(event.id)}
        >
          <FontAwesome name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEvent = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.eventItem}>
        <View style={styles.eventContent}>
          <Text style={styles.eventTime}>{item.time || 'All day'}</Text>
          <Text style={styles.eventTitle}>{item.title}</Text>
          {item.description && <Text style={styles.eventDescription}>{item.description}</Text>}
        </View>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.header}>{dayjs(selectedDate).format('dddd, MMMM D, YYYY')}</Text>
        
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events scheduled for this day</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEvent', { initialDate: selectedDate })}
            >
              <Text style={styles.addButtonText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEvent}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventContent: {
    flexDirection: 'column',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  eventTime: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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
    padding: 12,
  },
  editButton: {
    backgroundColor: '#4a90e2',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  swipeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DayViewScreen;
