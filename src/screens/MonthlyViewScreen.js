import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { loadEvents, saveEvent } from '../utils/storage';
import dayjs from 'dayjs';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { debounce } from 'lodash';

const MonthlyViewScreen = () => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [todayEvents, setTodayEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [displayedSearchQuery, setDisplayedSearchQuery] = useState('');
  const [displayedFilteredEvents, setDisplayedFilteredEvents] = useState([]);
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

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      setDisplayedSearchQuery(query);
      if (query === '') {
        setDisplayedFilteredEvents([]);
      } else {
        const filtered = events.filter(e => 
          e.title.toLowerCase().includes(query.toLowerCase())
        );
        setDisplayedFilteredEvents(filtered);
      }
    }, 300),
    [events]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

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
    const dayEvents = displayedSearchQuery ? 
      displayedFilteredEvents.filter(e => e.date === dayString) : 
      events.filter(e => e.date === dayString);

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

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Text style={styles.searchDate}>{dayjs(item.date).format('MMM D, YYYY')}</Text>
      <Text style={styles.searchTitle}>{item.title}</Text>
      <Text style={styles.searchTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  const handleAddEvent = () => {
    navigation.navigate('AddEvent');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
            if (nativeEvent.translationX < -100) handleSwipe('left');
            else if (nativeEvent.translationX > 100) handleSwipe('right');
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

          {displayedSearchQuery ? (
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                Search results for "{displayedSearchQuery}"
              </Text>
              {displayedFilteredEvents.length > 0 ? (
                <FlatList
                  data={displayedFilteredEvents}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  style={styles.searchResultsList}
                />
              ) : (
                <Text style={styles.noResultsText}>No events found</Text>
              )}
            </View>
          ) : (
            <>
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
            </>
          )}
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
  },
  searchResultsContainer: {
    flex: 1,
    paddingTop: 10
  },
  searchResultsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  searchResultsList: {
    flex: 1
  },
  searchItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  searchDate: {
    fontSize: 12,
    color: '#999'
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 3
  },
  searchTime: {
    fontSize: 14,
    color: '#666'
  },
  noResultsText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16
  }
});

export default MonthlyViewScreen;