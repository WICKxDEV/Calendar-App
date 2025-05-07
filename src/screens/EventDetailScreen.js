import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { loadEvents } from '../utils/storage';  // Assume this function loads stored events

const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;  // Get eventId from params
  const [event, setEvent] = useState(null);  // Store event details
  const [loading, setLoading] = useState(true);  // Loading state for async operation

  useEffect(() => {
    // Fetch event details using eventId
    const fetchEventDetails = async () => {
      try {
        const storedEvents = await loadEvents();  // Load events from storage
        const selectedEvent = storedEvents.find(event => event.id === eventId);  // Find the event by eventId
        setEvent(selectedEvent);  // Set the event details in state
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);  // Stop loading after fetching
      }
    };

    fetchEventDetails();  // Fetch event details on component mount
  }, [eventId]);  // Re-run when eventId changes

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );  // Show loading spinner while fetching
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.noEventText}>No event found with ID: {eventId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.eventCard}>
        <Text style={styles.header}>Event Details</Text>
        <Text style={styles.eventName}>{event.title}</Text>
        <Text style={styles.eventDate}>Date: {event.date}</Text>
        <Text style={styles.eventTime}>Time: {event.time || 'All day'}</Text>
        {event.description && <Text style={styles.eventDescription}>Description: {event.description}</Text>}

        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => navigation.navigate('EditEvent', { event })} 
        >
          <Text style={styles.editButtonText}>Edit Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 20,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  eventDate: {
    fontSize: 16,
    marginBottom: 12,
    color: '#555',
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 12,
    color: '#777',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  noEventText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EventDetailScreen;
