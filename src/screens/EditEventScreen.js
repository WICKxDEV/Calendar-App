import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { loadEvents, storeEvents } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [date, setDate] = useState(new Date(event.date));
  const [time, setTime] = useState(event.time || '');

  const handleSave = async () => {
    const updatedEvent = {
      ...event,
      title,
      description,
      date: date.toISOString().split('T')[0],
      time,
    };

    const stored = await loadEvents();
    const updated = stored.map(e => e.id === event.id ? updatedEvent : e);
    await storeEvents(updated);
    navigation.goBack();
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDelete, style: 'destructive' }
      ]
    );
  };

  const handleDelete = async () => {
    const stored = await loadEvents();
    const updated = stored.filter(e => e.id !== event.id);
    await storeEvents(updated);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Event title" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Event description"
        />

        <Text style={styles.label}>Date</Text>
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => setDate(selectedDate || date)}
        />

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 14:30"
          value={time}
          onChangeText={setTime}
        />

        <View style={styles.buttonGroup}>
          <Button title="Save Changes" onPress={handleSave} disabled={!title.trim()} />
          <View style={styles.spacing} />
          <Button title="Delete Event" onPress={confirmDelete} color="red" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f4f4f9',
    padding: 20,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    color: '#333',
  },
  buttonGroup: {
    marginTop: 20,
  },
  spacing: {
    height: 10,
  },
});

export default EditEventScreen;
