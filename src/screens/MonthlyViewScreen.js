import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadEvents } from '../utils/storage';
import dayjs from 'dayjs';

const MonthlyViewScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [todayEvents, setTodayEvents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const stored = await loadEvents();
        setEvents(stored);
        const todayString = dayjs().format('YYYY-MM-DD');
        setTodayEvents(stored.filter(e => e.date === todayString));
      };
      fetchData();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('AddEvent')}>
            <Text style={{ marginRight: 10, fontSize: 18, color: 'blue' }}>＋</Text>
          </TouchableOpacity>
        )
      });
    }, [navigation])
  );

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

  const renderDay = (day) => {
    const dayString = day.format('YYYY-MM-DD');
    const dayEvents = events.filter(e => e.date === dayString);

    return (
      <TouchableOpacity 
        style={[
          styles.dayCell,
          dayString === dayjs().format('YYYY-MM-DD') && styles.todayCell
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
      <Text style={styles.eventTime}>{item.time || ''}</Text>
      <Text style={styles.eventTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleMonthChange = (direction) => {
    setCurrentMonth(prev =>
      direction === 'prev' ? prev.subtract(1, 'month') : prev.add(1, 'month')
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleMonthChange('prev')}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
        <TouchableOpacity onPress={() => handleMonthChange('next')}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayWrapper}>
            {renderDay(day)}
          </View>
        ))}
      </View>

      <View style={styles.todaySection}>
        <Text style={styles.sectionTitle}>Today's Events</Text>
        {todayEvents.length > 0 ? (
          <FlatList
            data={todayEvents}
            renderItem={renderTodayEvent}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <Text style={styles.noEventsText}>No events for today</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  navArrow: {
    fontSize: 24,
    paddingHorizontal: 10,
    color: 'blue'
  },
  monthText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
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
