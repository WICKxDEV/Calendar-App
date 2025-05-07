import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { storeEvents, loadEvents } from '../utils/storage';

const AddEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = async () => {
    const newEvent = {
      id: Date.now(),
      title,
      date: date.toISOString().split('T')[0], // Store as 'YYYY-MM-DD'
    };

    const existing = await loadEvents();
    const updated = [...existing, newEvent];
    await storeEvents(updated);
    navigation.goBack(); // Return to calendar view
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
      <Button title={date.toDateString()} onPress={() => setShowDatePicker(true)} />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="Save Event" onPress={handleSave} disabled={!title.trim()} />
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

export default AddEventScreen;
