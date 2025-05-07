import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, TouchableWithoutFeedback, Keyboard, Modal, Dimensions } from 'react-native';
import { loadEvents } from '../utils/storage';
import dayjs from 'dayjs';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

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

  // Fetch events whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const stored = await loadEvents();
        setEvents(stored);
        // Filter today's events
        const todayString = dayjs().format('YYYY-MM-DD');
        setTodayEvents(stored.filter(e => e.date === todayString));
      };
      fetchData();
    }, [])
  );

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
                    style={[styles.monthYearItem, tempSelectedMonth.month() === index && styles.selectedMonthYearItem]}
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
                    style={[styles.monthYearItem, tempSelectedMonth.year() === year && styles.selectedMonthYearItem]}
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
      <LinearGradient colors={['#f5f7fa', '#e4e8f0']} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.container}>
            {/* Month Header with improved styling */}
            <PanGestureHandler onGestureEvent={({ nativeEvent }) => {
              if (nativeEvent.translationX < -100) handleSwipe('left');
              else if (nativeEvent.translationX > 100) handleSwipe('right');
            }}>
              <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.monthHeader}>
                <TouchableOpacity 
                  style={styles.navButton} 
                  onPress={() => changeMonth(-1)}
                >
                  <MaterialIcons name="chevron-left" size={28} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.monthTitleContainer}
                  onPress={openMonthYearPicker}
                >
                  <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={20} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={() => changeMonth(1)}
                >
                  <MaterialIcons name="chevron-right" size={28} color="white" />
                </TouchableOpacity>
              </LinearGradient>
            </PanGestureHandler>
            
            {/* Search Input with improved styling */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Search events..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Week Days Header */}
            <View style={styles.weekDaysHeader}>
              {[
                { letter: 'S', full: 'Sun' },
                { letter: 'M', full: 'Mon' },
                { letter: 'T', full: 'Tue' },
                { letter: 'W', full: 'Wed' },
                { letter: 'T', full: 'Thu' },
                { letter: 'F', full: 'Fri' },
                { letter: 'S', full: 'Sat' }
              ].map((day, index) => (
                <Text key={`${day.full}-${index}`} style={styles.weekDayText}>
                  {day.letter}
                </Text>
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
                  <View style={styles.noResultsContainer}>
                    <MaterialIcons name="search-off" size={50} color="#ccc" />
                    <Text style={styles.noResultsText}>No events found</Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* Calendar Grid */}
                <View style={styles.grid}>
                  {days.map((day, index) => (
                    <View key={index} style={styles.dayWrapper}>
                      {renderDay(day)}
                    </View>
                  ))}
                </View>

                {/* Month's Events Summary */}
                <View style={styles.summaryCard}>
                  <Text style={styles.sectionTitle}>
                    Events in {currentMonth.format('MMMM YYYY')}
                  </Text>
                  <View style={styles.eventsCountContainer}>
                    <Text style={styles.eventsCount}>
                      {events.filter(e => dayjs(e.date).isSame(currentMonth, 'month')).length}
                    </Text>
                  </View>
                </View>

                {/* Today's Events Section */}
                <View style={styles.todaySection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Today's Events</Text>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateBadgeText}>{dayjs().format('MMM D')}</Text>
                    </View>
                  </View>
                  {todayEvents.length > 0 ? (
                    <FlatList
                      data={todayEvents}
                      renderItem={renderTodayEvent}
                      keyExtractor={(item) => item.id}
                    />
                  ) : (
                    <View style={styles.noEventsContainer}>
                      <MaterialIcons name="event-available" size={40} color
                      ="#ccc" />
                      <Text style={styles.noEventsText}>No events today</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          {renderMonthYearPicker()}
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </GestureHandlerRootView>
  );
};
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingBottom: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  navButton: {
    padding: 10,
  },
  monthTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: 'white',
    marginRight: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  weekDayText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#555',
    width: '14.2%',
    textAlign: 'center',
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  dayWrapper: { 
    width: '14.2%', 
    alignItems: 'center', 
    marginVertical: 4,
  },
  dayCell: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dayCellOtherMonth: {
    opacity: 0.4,
  },
  todayCell: {
    backgroundColor: '#6a11cb',
  },
  dayText: { 
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dayTextOtherMonth: {
    fontSize: 16,
    color: '#999',
  },
  todayText: {
    color: 'white',
  },
  eventDot: { 
    fontSize: 12, 
    color: '#6a11cb',
    position: 'absolute',
    bottom: -2,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  eventsCountContainer: {
    backgroundColor: '#6a11cb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  eventsCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  todaySection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 15,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dateBadgeText: {
    color: '#6a11cb',
    fontWeight: '600',
    fontSize: 14,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  eventTime: {
    marginRight: 12,
    color: '#6a11cb',
    fontWeight: '600',
    fontSize: 14,
    minWidth: 50,
  },
  eventTitle: {
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noEventsText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  searchResultsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
  },
  searchResultsList: {
    flex: 1,
  },
  searchItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchDate: {
    fontSize: 12,
    color: '#6a11cb',
    fontWeight: '500',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 3,
    color: '#333',
  },
  searchTime: {
    fontSize: 14,
    color: '#666',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYearPicker: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width - 40,
    padding: 20,
  },
  pickerHeader: {
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
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
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedMonthYearItem: {
    backgroundColor: '#6a11cb',
  },
  monthYearText: {
    fontSize: 16,
    color: '#555',
  },
  selectedMonthYearText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#6a11cb',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

// Update your renderDay function to include todayText style for today's date
const renderDay = (day) => {
  const dayString = day.format('YYYY-MM-DD');
  const dayEvents = displayedSearchQuery ? 
    displayedFilteredEvents.filter(e => e.date === dayString) : 
    events.filter(e => e.date === dayString);

  const isCurrentMonth = day.month() === currentMonth.month();
  const isToday = day.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  
  const dayTextStyle = [
    styles.dayText,
    !isCurrentMonth && styles.dayTextOtherMonth,
    isToday && styles.todayText
  ];
  
  const dayCellStyle = [
    styles.dayCell,
    !isCurrentMonth && styles.dayCellOtherMonth,
    isToday && styles.todayCell
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

export default MonthlyViewScreen;