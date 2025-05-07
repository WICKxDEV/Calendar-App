import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
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
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Date</Text>
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
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
        <View style={{ height: 10 }} />
        <Button title="Delete Event" onPress={confirmDelete} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginTop: 8,
  },
  buttonGroup: {
    marginTop: 30,
  }
});

export default EditEventScreen;
