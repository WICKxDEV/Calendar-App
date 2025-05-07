import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MonthlyViewScreen from './screens/MonthlyViewScreen';
import AddEventScreen from './screens/AddEventScreen';
import DayViewScreen from './screens/DayViewScreen';
import EditEventScreen from './screens/EditEventScreen';
import EventDetailScreen from './screens/EventDetailScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MonthlyView" component={MonthlyViewScreen} options={{ title: 'Calendar' }} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add Event' }} />
        <Stack.Screen name="DayView" component={DayViewScreen} options={{ title: 'Day View' }} />
        <Stack.Screen name="EditEvent" component={EditEventScreen} options={{ title: 'Edit Event' }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
