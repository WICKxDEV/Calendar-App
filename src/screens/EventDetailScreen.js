import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EventDetailScreen = ({ route }) => {
  const { eventId } = route.params;
  const event = events.find(e => e.id === eventId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.description}>{event.description}</Text>
      <Text style={styles.notes}>{event.notes}</Text>
      <Text style={styles.date}>{event.date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  description: { fontSize: 16, marginTop: 10 },
  notes: { fontSize: 16, marginTop: 10, fontStyle: 'italic' },
  date: { fontSize: 16, marginTop: 20, color: 'gray' },
});

export default EventDetailScreen;
