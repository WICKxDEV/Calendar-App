import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Platform,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { loadEvents, storeEvents } from '../utils/storage';

const EditEventScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [date, setDate] = useState(new Date(event.date));
  const [time, setTime] = useState(event.time || '');
  const insets = useSafeAreaInsets();

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your event');
      return;
    }

    const updatedEvent = {
      ...event,
      title,
      description,
      date: date.toISOString().split('T')[0],
      time,
    };

    try {
      const stored = await loadEvents();
      const updated = stored.map(e => e.id === event.id ? updatedEvent : e);
      await storeEvents(updated);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save event');
    }
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
    try {
      const stored = await loadEvents();
      const updated = stored.filter(e => e.id !== event.id);
      await storeEvents(updated);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event');
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingLeft: insets.left + 20,
          paddingRight: insets.right + 20
        }
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        
        <Text style={styles.label}>Title*</Text>
        <TextInput 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle} 
          placeholder="Enter event title"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Enter event description"
          placeholderTextColor="#999"
          textAlignVertical="top"
        />

        <Text style={styles.label}>Date</Text>
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, selectedDate) => setDate(selectedDate || date)}
            style={styles.datePicker}
          />
        </View>

        <Text style={styles.label}>Time</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM (e.g. 14:30)"
          placeholderTextColor="#999"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <MaterialIcons name="save" size={20} color="white" />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={confirmDelete}
            activeOpacity={0.8}
          >
            <MaterialIcons name="delete-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f4f4f9',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  datePicker: {
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
  },
  deleteButton: {
    backgroundColor: '#ff453a',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default EditEventScreen;