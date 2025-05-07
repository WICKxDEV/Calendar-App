import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { loadEvents } from '../utils/storage';  // Assume this function loads stored events

const EventDetailScreen = ({ route }) => {
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
    return <ActivityIndicator size="large" color="#0000ff" />;  // Show loading spinner while fetching
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>No event found with ID: {eventId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Event Details</Text>
      <Text style={styles.eventName}>Name: {event.title}</Text>
      <Text style={styles.eventDate}>Date: {event.date}</Text>
      <Text style={styles.eventTime}>Time: {event.time || 'All day'}</Text>
      {event.description && <Text style={styles.eventDescription}>Description: {event.description}</Text>}
      {/* Add other event details as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventName: {
    fontSize: 18,
    marginBottom: 10,
  },
  eventDate: {
    fontSize: 16,
    marginBottom: 10,
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 10,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});

export default EventDetailScreen;
