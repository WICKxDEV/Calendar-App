import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { loadEvents, storeEvents } from '../utils/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [title, setTitle] = useState(event.title);
  const [date, setDate] = useState(new Date(event.date));

  const handleSave = async () => {
    const updatedEvent = {
      ...event,
      title,
      date: date.toISOString().split('T')[0], // Store as 'YYYY-MM-DD'
    };

    const stored = await loadEvents();
    const updated = stored.map(e => e.id === event.id ? updatedEvent : e);
    await storeEvents(updated);
    navigation.goBack(); // Return to previous screen
  };

  const handleDelete = async () => {
    const stored = await loadEvents();
    const updated = stored.filter(e => e.id !== event.id);
    await storeEvents(updated);
    navigation.goBack(); // Return to previous screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Event Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Doctor Appointment"
      />

      <Text style={styles.label}>Event Date</Text>
      <DateTimePicker
        value={date}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => setDate(selectedDate || date)}
      />

      <View style={{ marginTop: 30 }}>
        <Button title="Save Changes" onPress={handleSave} disabled={!title.trim()} />
        <Button title="Delete Event" onPress={handleDelete} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginTop: 20, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginTop: 10,
  },
});

export default EditEventScreen;
