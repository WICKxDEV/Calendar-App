import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, TouchableWithoutFeedback, Keyboard, Modal } from 'react-native';
import { loadEvents } from '../utils/storage';
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
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(dayjs());
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

  const changeMonth = (monthOffset) => {
    setCurrentMonth(currentMonth.add(monthOffset, 'month'));
  };

  const openMonthYearPicker = () => {
    setTempSelectedMonth(currentMonth);
    setShowMonthYearPicker(true);
  };

  const confirmMonthYearSelection = () => {
    setCurrentMonth(tempSelectedMonth);
    setShowMonthYearPicker(false);
  };

  const renderDay = (day) => {
    const dayString = day.format('YYYY-MM-DD');
    const dayEvents = displayedSearchQuery ? 
      displayedFilteredEvents.filter(e => e.date === dayString) : 
      events.filter(e => e.date === dayString);

    const isCurrentMonth = day.month() === currentMonth.month();
    const dayTextStyle = isCurrentMonth ? styles.dayText : styles.dayTextOtherMonth;
    const dayCellStyle = [
      styles.dayCell,
      day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') && styles.todayCell,
      !isCurrentMonth && styles.dayCellOtherMonth
    ];

    return (
      <TouchableOpacity 
        style={dayCellStyle}
        onPress={() => navigation.navigate('DayView', { selectedDate: dayString })}
      >
        <Text style={dayTextStyle}>{day.date()}</Text>
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

  const renderMonthYearPicker = () => {
    const months = Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMMM'));
    const currentYear = tempSelectedMonth.year();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
      <Modal
        transparent={true}
        visible={showMonthYearPicker}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.monthYearPicker}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Month and Year</Text>
            </View>
            
            <View style={styles.pickerContainer}>
              <View style={styles.monthPicker}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthYearItem,
                      tempSelectedMonth.month() === index && styles.selectedMonthYearItem
                    ]}
                    onPress={() => setTempSelectedMonth(tempSelectedMonth.month(index))}
                  >
                    <Text style={tempSelectedMonth.month() === index ? styles.selectedMonthYearText : styles.monthYearText}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.yearPicker}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.monthYearItem,
                      tempSelectedMonth.year() === year && styles.selectedMonthYearItem
                    ]}
                    onPress={() => setTempSelectedMonth(tempSelectedMonth.year(year))}
                  >
                    <Text style={tempSelectedMonth.year() === year ? styles.selectedMonthYearText : styles.monthYearText}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.pickerButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowMonthYearPicker(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmMonthYearSelection}
              >
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Text style={styles.navArrow}>{'<'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={openMonthYearPicker}>
                <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Text style={styles.navArrow}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </PanGestureHandler>
          
          <TextInput 
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.weekDaysHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

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

              {/* Month's Events Summary */}
              <View style={styles.monthEventsSummary}>
                <Text style={styles.sectionTitle}>
                  Events in {currentMonth.format('MMMM YYYY')}:{' '}
                  <Text style={styles.eventsCount}>
                    {events.filter(e => dayjs(e.date).isSame(currentMonth, 'month')).length}
                  </Text>
                </Text>
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

          {renderMonthYearPicker()}
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
    marginBottom: 15,
  },
  navArrow: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    color: '#007bff',
  },
  monthText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center',
    color: '#007bff',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#666',
    width: '14.2%',
    textAlign: 'center',
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
    padding: 5,
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  todayCell: {
    backgroundColor: '#e6f7ff',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center'
  },
  dayText: { 
    fontSize: 16 
  },
  dayTextOtherMonth: {
    fontSize: 16,
    color: '#999',
  },
  eventDot: { 
    fontSize: 12, 
    color: 'blue',
    position: 'absolute',
    bottom: -2,
  },
  monthEventsSummary: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
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
  eventsCount: {
    color: '#007bff',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearPicker: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  pickerHeader: {
    marginBottom: 15,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthPicker: {
    flex: 1,
    marginRight: 10,
  },
  yearPicker: {
    flex: 1,
    marginLeft: 10,
  },
  monthYearItem: {
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedMonthYearItem: {
    backgroundColor: '#007bff',
  },
  monthYearText: {
    fontSize: 16,
  },
  selectedMonthYearText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MonthlyViewScreen;