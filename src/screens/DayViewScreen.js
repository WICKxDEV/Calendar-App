import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { loadEvents, storeEvents } from '../utils/storage';

const DayViewScreen = ({ route, navigation }) => {
  const { selectedDate } = route.params;
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const stored = await loadEvents();
      const filteredEvents = stored.filter(event => event.date === selectedDate);
      setEvents(filteredEvents);
    };
    fetchData();
  }, [selectedDate]);

  const handleDelete = async (eventId) => {
    const stored = await loadEvents();
    const updatedEvents = stored.filter(event => event.id !== eventId);
    await storeEvents(updatedEvents);
    setEvents(updatedEvents);
  };

  const handleEdit = (event) => {
    navigation.navigate('EditEvent', { event });
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventTitle}>{item.title}</Text>
      <Text style={styles.eventDate}>{item.date}</Text>
      <TouchableOpacity onPress={() => handleEdit(item)}>
        <Text style={styles.editButton}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteButton}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{selectedDate}</Text>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  eventItem: { marginBottom: 15, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 },
  eventTitle: { fontSize: 18, fontWeight: 'bold' },
  eventDate: { fontSize: 14, color: 'gray' },
  editButton: { color: 'blue', marginTop: 5 },
  deleteButton: { color: 'red', marginTop: 5 },
});

export default DayViewScreen;
