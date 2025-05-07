import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Text,
  LogBox
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LottieView from 'lottie-react-native';
import MonthlyViewScreen from './screens/MonthlyViewScreen';
import AddEventScreen from './screens/AddEventScreen';
import DayViewScreen from './screens/DayViewScreen';
import EditEventScreen from './screens/EditEventScreen';
import EventDetailScreen from './screens/EventDetailScreen';

// Ignore specific warnings if needed
LogBox.ignoreLogs(['Warning: ...']);

const Stack = createNativeStackNavigator();

// Custom theme
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load any resources like fonts, animations, etc.
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate loading
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.fullContainer} onLayout={onLayoutRootView}>
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
          <Stack.Screen name="MonthlyView" component={MonthlyViewScreenWithFab} />
          <Stack.Screen 
            name="AddEvent" 
            component={AddEventScreen} 
            options={{ 
              presentation: 'modal',
              contentStyle: { backgroundColor: '#f8f9fa' }
            }} 
          />
          <Stack.Screen name="DayView" component={DayViewScreen} />
          <Stack.Screen 
            name="EditEvent" 
            component={EditEventScreen} 
            options={{ 
              presentation: 'modal',
              contentStyle: { backgroundColor: '#f8f9fa' }
            }} 
          />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

// Loading Screen with compact Lottie logo
function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.logoContainer}>
        <LottieView
          source={require('../assets/animation/calendar-loading.json')}
          autoPlay
          loop
          style={loadingStyles.logoAnimation}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

// MonthlyView with FAB
function MonthlyViewScreenWithFab({ navigation }) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

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
  fullContainer: {
    flex: 1,
  },
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    width: 240,  // Container size for the logo
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAnimation: {
    width: '100%',  // Will fill the container
    height: '100%',
  },
});