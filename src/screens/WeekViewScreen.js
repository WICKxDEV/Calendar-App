import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const WeekViewScreen = ({ navigation }) => {
 
    const weekEvents = events.filter(event => isEventThisWeek(event.date));

    const renderEvent = ({ item }) => (
    <TouchableOpacity
    style={styles.eventItem}
    onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
    <Text style={styles.eventTime}>{item.time}</Text>
    <Text style={styles.eventTitle}>{item.title}</Text>
    </TouchableOpacity>
    );
    
    return (
    <View style={styles.container}>
    <Text style={styles.title}>This Week's Events</Text>
    <FlatList
    data={weekEvents}
    renderItem={renderEvent}
    keyExtractor={(item) => item.id}
    />
    </View>
    );
    };
    
    const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    eventItem: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 5
    },
    eventTime: { marginRight: 10, color: '#666' },
    eventTitle: { fontWeight: '500' },
    });
    
    export default WeekViewScreen;