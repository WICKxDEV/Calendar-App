import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { loadEvents } from '../utils/storage';
import dayjs from 'dayjs';

const MonthlyViewScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  useEffect(() => {
    const fetchData = async () => {
      const stored = await loadEvents();
      setEvents(stored);
    };
    fetchData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('AddEvent')}>
          <Text style={{ marginRight: 10, fontSize: 18, color: 'blue' }}>＋</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

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
    const dayEvents = events.filter(e => e.date === day.format('YYYY-MM-DD'));
    return (
      <TouchableOpacity style={styles.dayCell}>
        <Text style={styles.dayText}>{day.date()}</Text>
        {dayEvents.length > 0 && (
          <Text style={styles.eventDot}>• {dayEvents.length}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
      <View style={styles.grid}>
        {days.map((day, index) => (
          <View key={index} style={styles.dayWrapper}>
            {renderDay(day)}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  monthText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayWrapper: { width: '14.2%', alignItems: 'center', marginVertical: 5 },
  dayCell: { alignItems: 'center', padding: 5 },
  dayText: { fontSize: 16 },
  eventDot: { fontSize: 12, color: 'blue' },
});

export default MonthlyViewScreen;
