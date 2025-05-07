import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { loadEvents, saveEvent } from '../utils/storage';
import dayjs from 'dayjs';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'; // For swipe gestures
import { useNavigation } from '@react-navigation/native';

const MonthlyViewScreen = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [todayEvents, setTodayEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const stored = await loadEvents();
      setEvents(stored);
      // Filter today's events
      const todayString = dayjs().format('YYYY-MM-DD');
      setTodayEvents(stored.filter(e => e.date === todayString));
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFilteredEvents(events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [searchQuery, events]);

  const generateDaysInMonth = () => {
    const start = currentMonth.startOf('month').startOf('week');
    const end = currentMonth.endOf('month').endOf('week');
    const days = [];

    let day = start;
    while (day.isBefore(end)) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  };

  const days = generateDaysInMonth();

  const handleSwipe = (direction) => {
    if (direction === 'left') {
      setCurrentMonth(currentMonth.add(1, 'month'));
    } else if (direction === 'right') {
      setCurrentMonth(currentMonth.subtract(1, 'month'));
    }
  };

  const renderDay = (day) => {
    const dayString = day.format('YYYY-MM-DD');
    const dayEvents = filteredEvents.filter(e => e.date === dayString);

    return (
      <TouchableOpacity 
        style={[
          styles.dayCell,
          day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') && styles.todayCell
        ]}
        onPress={() => navigation.navigate('DayView', { selectedDate: dayString })}
      >
        <Text style={styles.dayText}>{day.date()}</Text>
        {dayEvents.length > 0 && (
          <Text style={styles.eventDot}>• {dayEvents.length}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderTodayEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Text style={styles.eventTime}>{item.time}</Text>
      <Text style={styles.eventTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleAddEvent = () => {
    // Implement logic to add event, like showing a modal or navigating to another screen
    navigation.navigate('AddEvent');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
            if (nativeEvent.translationX < -100) handleSwipe('left');  // Swipe left
            else if (nativeEvent.translationX > 100) handleSwipe('right');  // Swipe right
          }}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
              <TouchableOpacity onPress={handleAddEvent} style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </PanGestureHandler>
          
          <TextInput 
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.grid}>
            {days.map((day, index) => (
              <View key={index} style={styles.dayWrapper}>
                {renderDay(day)}
              </View>
            ))}
          </View>

          {/* Today's Events Section */}
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today's Events</Text>
            {todayEvents.length > 0 ? (
              <FlatList
                data={todayEvents}
                renderItem={renderTodayEvent}
                keyExtractor={(item) => item.id}
              />
            ) : (
              <Text style={styles.noEventsText}>No events for today</Text>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 10,
    flex: 1 
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center', 
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: 20 
  },
  dayWrapper: { 
    width: '14.2%', 
    alignItems: 'center', 
    marginVertical: 5 
  },
  dayCell: { 
    alignItems: 'center', 
    padding: 5 
  },
  todayCell: {
    backgroundColor: '#e6f7ff',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center'
  },
  dayText: { 
    fontSize: 16 
  },
  eventDot: { 
    fontSize: 12, 
    color: 'blue' 
  },
  todaySection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
    flex: 1
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  eventItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 5
  },
  eventTime: {
    marginRight: 10,
    color: '#666'
  },
  eventTitle: {
    fontWeight: '500'
  },
  noEventsText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 10
  }
});

export default MonthlyViewScreen;
