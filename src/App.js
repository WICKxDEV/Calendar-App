import React from 'react';
import { 
  NavigationContainer, 
  DefaultTheme 
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MonthlyViewScreen from './screens/MonthlyViewScreen';
import AddEventScreen from './screens/AddEventScreen';
import DayViewScreen from './screens/DayViewScreen';
import EditEventScreen from './screens/EditEventScreen';
import EventDetailScreen from './screens/EventDetailScreen';

const Stack = createNativeStackNavigator();

// Custom theme to match gradient background
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        >
          <Stack.Screen 
            name="MonthlyView" 
            component={MonthlyViewScreenWithFab} 
          />
          <Stack.Screen 
            name="AddEvent" 
            component={AddEventScreen} 
            options={{ 
              presentation: 'modal',
              contentStyle: {
                backgroundColor: '#f8f9fa',
              }
            }} 
          />
          <Stack.Screen 
            name="DayView" 
            component={DayViewScreen} 
          />
          <Stack.Screen 
            name="EditEvent" 
            component={EditEventScreen} 
            options={{ 
              presentation: 'modal',
              contentStyle: {
                backgroundColor: '#f8f9fa',
              }
            }} 
          />
          <Stack.Screen 
            name="EventDetail" 
            component={EventDetailScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

// Wrapper component for MonthlyView with FAB
function MonthlyViewScreenWithFab({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <MonthlyViewScreen />
      </SafeAreaView>
      
      <TouchableOpacity 
        style={[
          styles.fab,
          { 
            right: 20 + insets.right,
            bottom: 20 + insets.bottom 
          }
        ]}
        onPress={() => navigation.navigate('AddEvent')}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6a11cb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});