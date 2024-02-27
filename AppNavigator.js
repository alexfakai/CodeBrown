import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons,FontAwesome } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';


import FirstPage from './FirstPage';
import SignIn from './SignIn';
import SignUp from './SignUp';
import forgotpassword from './forgotpassword';
import Dashboard from './Dashboard';
import ContactsScreen from './ContactsScreen';
import ChatScreen from './ChatScreen';
import LocationHistoryScreen from './LocationHistoryScreen';
import TakeOrderScreen from './TakeOrderScreen';
import UserProfileScreen from './UserProfileScreen';  
import EditProfileScreen from './EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


//User role for 
function AuthenticatedTabs({ role,userId }) {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Contacts') iconName = 'contacts';
          else if (route.name === 'TakeOrder') iconName = 'shopping-cart';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Log') iconName = 'location-pin';
          // Return the icon component
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato', // Moved here from tabBarOptions
        tabBarInactiveTintColor: 'gray', // Moved here from tabBarOptions
        tabBarStyle: [{ display: 'flex' }, null], // Custom style if needed
      })}>
        
      {/* Define the screens as Tab Screens */}
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="TakeOrder" component={TakeOrderScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
      {role === 'manager' && <Tab.Screen name="Log" component={LocationHistoryScreen}initialParams={{ userId: userId }} />}
    </Tab.Navigator>
  );
}


function AppNavigator({ isAuthenticated }) {
  const [role, setRole] = useState('');
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);

    const locationData = {
      userId: userId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, 'locations'), locationData);
      console.log('Location data recorded');
    } catch (error) {
      console.error('Error recording location data: ', error);
    }
  };
  

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const docRef = doc(db, 'USERS', user.email);  
        const docSnap = await getDoc(docRef);

        setRole(docSnap.data().role);

        if (Doc.exists()) {
          const Data = Doc.data();
          setRole(Data.role); // Assuming the role is stored under a field named 'role'
        } else {
          console.error("No such user document!");
          console.log(role);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserRole();
    }
  }, [isAuthenticated]);
  


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirstPage">
        {isAuthenticated ? (
          <>
            <Stack.Screen name="AuthenticatedTabs" options={{ headerShown: false }}>
              {() => <AuthenticatedTabs role={role} userId={userId} />}
            </Stack.Screen>
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="LocationHistoryScreen" component={LocationHistoryScreen} />
            <Stack.Screen name="TakeOrderScreen" component={TakeOrderScreen} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          </>
        ) : (
          <>
            {/* Apply gestureEnabled: false to these screens */}
            <Stack.Screen name="FirstPage" component={FirstPage} options={{ gestureEnabled: false }}/>
            <Stack.Screen name="SignUp" component={SignUp} options={{ gestureEnabled: false }}/>
            <Stack.Screen name="SignIn" component={SignIn} options={{ gestureEnabled: false }}/>
            <Stack.Screen name="forgotpassword" component={forgotpassword} options={{ gestureEnabled: false }}/>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppNavigator.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default AppNavigator;


