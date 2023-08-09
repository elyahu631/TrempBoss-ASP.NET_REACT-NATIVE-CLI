
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import { useContext, useEffect, useState } from 'react';

import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View, Switch, TouchableWithoutFeedback, Image, Animated, Alert } from 'react-native';
import { GoogleMapsApiKey } from '@env';

import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Home from '../Pages/AfterEntry/Home';
import { userContext } from '../context/UserContext';
import AddDriveOrRequest from '../Pages/AfterEntry/AddDriveOrRequest';
import { TranslationContext } from '../styles/Languages/Languages';
import { ThemeContext } from '../styles/Themes/ThemeContext';
import Profile from '../Pages/AfterEntry/Profile';
import Settings from '../Pages/AfterEntry/Settings';
import { useColorScheme } from 'react-native';
import FlexDirectionStyle from '../styles/FlexDirection';
import RideDetails from '../Pages/AfterEntry/RideDetails';

import Icon from 'react-native-vector-icons/FontAwesome';
import UserRides from '../Pages/AfterEntry/UserRides';
import Requests from '../Pages/AfterEntry/Requests';
import MapPicker from '../comp/MapPicker';
import noPhoto from '../asserts/images/noPhoto.png';
import ApprovedRides from '../Pages/AfterEntry/ApprovedRides';
import ApprovedRideDetails from '../Pages/AfterEntry/ApprovedRideDetails';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Drawer = createDrawerNavigator();

function hasObjectWithKey(arr, key) {
  return arr.some(obj => obj.hasOwnProperty(key));
}


export default function DrawerComp(props) {
  const navigation = useNavigation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  useEffect(() => {
    navigation.addListener('state', () => {

      try {
        if (!navigation.getState()) {
          return;
        }
        const navigationState = navigation?.getState();
        const currentRouteIndex = navigationState?.index;
        const currentScreenName = navigationState?.routeNames[currentRouteIndex];
        setCurrentScreen(currentScreenName)
        const isOpen = hasObjectWithKey(navigationState.history, 'status');
        props.toggleFab(!isOpen)
        setIsDrawerOpen(isOpen);
      } catch (error) {
        setIsDrawerOpen(false)

      }
    });
  }, [navigation]);

  const flexDirection = FlexDirectionStyle();

  const isDarrkMode = useColorScheme() == 'dark'


  const { currentLanguage, GetDictByLangAndKey, LanguageWords } = useContext(TranslationContext);
  const { theme } = useContext(ThemeContext);
  const languageWords = LanguageWords();
  const { setIsLoggedIn, userLoggedIn, isDriver } = useContext(userContext);
  const styles = createStyles(theme, isDarrkMode, flexDirection, isDrawerOpen)
  const wordsKey = 'drawer';
  const pageWords = GetDictByLangAndKey(wordsKey);
  const generalWords = GetDictByLangAndKey('general');
  const [currentScreen, setCurrentScreen] = useState(generalWords['home'])







  const coins = () => {
    return <Text style={styles.topButtons}
    >{generalWords['coins'] || "coins"}</Text>
  }
  const drawerToggle = () => {
    return <View style={styles.drawerToggleContainer} >


      <DrawerToggleButton tintColor={isDarrkMode ? "white" : "black"} />
    </View>
  }


  const CustomDrawerContent = (props) => {
    return (<View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'gray', marginVertical: 20 }}>
          <TouchableOpacity onPress={() => navigation.navigate(pageWords['profile'])}>           
            <Image
              source={
                userLoggedIn?.user?.image_URL ? { uri: userLoggedIn?.user?.image_URL } : noPhoto
              }
              style={styles.image}
            />
          </TouchableOpacity>
          <View>
            {(userLoggedIn?.user?.first_name && userLoggedIn?.user?.last_name) ?
              <Text style={{ color: theme.colors.text.primary }}>{userLoggedIn?.user?.first_name + " " + userLoggedIn?.user?.last_name}
              </Text> :
              <TouchableOpacity onPress={() => { navigation.navigate(pageWords['profile']) }} >
                <Text style={{ color: theme.colors.text.primary }}>{pageWords['addName']}</Text>
              </TouchableOpacity>}
            <Text style={{ color: theme.colors.text.primary }}>{userLoggedIn?.user?.email}</Text>
          </View>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity onPress={async() => {await AsyncStorage.removeItem('RememberMeInfo'); setIsLoggedIn(false) ;  }} style={{ position: 'absolute', padding: 15, bottom: 20, right: 0, left: 0, backgroundColor: 'gray' }}>
        <Text >{generalWords['logout']}</Text>
      </TouchableOpacity>
    </View>
    )
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}  >
        {/* Overlay */}
        <View style={styles.overlay} >

          {/* <View style={{ flex: 1, alignItems: "center" }}>
            <DrawerToggleButton tintColor={isDarrkMode ? "white" : "black"} />
          </View> */}
          <View style={[, { flex: 1 }]}>


            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => { navigation.navigate(generalWords['home']); setCurrentScreen(generalWords['home']) }}
            >
              <Icon name="home" size={30} color={currentScreen == generalWords['home'] ? theme.colors.text.primary : "#6e6d69"} />
              {currentScreen == generalWords['home'] && <Text style={{ color: theme.colors.text.primary }}>{generalWords['home']}</Text>}

            </TouchableOpacity>

          </View>

          <View style={[, { flex: 1 }, styles.animatedView]}>
            <TouchableOpacity
              style={[styles.iconContainer]}
              onPress={() => {
                navigation.navigate(generalWords['addRide']);
                setCurrentScreen(generalWords['addRide']);
              }}
            >
              <Icon name="plus" size={30} color={currentScreen === generalWords['addRide'] ? theme.colors.text.primary : "#6e6d69"} />
              {currentScreen === generalWords['addRide'] && (
                <Text style={{ color: theme.colors.text.primary }}>
                  {isDriver ? generalWords['addRide'] : generalWords['addTremp']}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>


            <TouchableOpacity

              style={styles.iconContainer}
              onPress={() => { navigation.navigate(generalWords['settings']); }}
            >

              <Icon name="gear" size={30} color={currentScreen == generalWords['settings'] ? theme.colors.text.primary : "#6e6d69"} />

              {currentScreen == generalWords['settings'] && <Text style={{ color: theme.colors.text.primary }}>{generalWords['settings']} </Text>}

            </TouchableOpacity>
          </View>

        </View>
        <View style={styles.drawerContainer}>

          <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            backBehavior='history'
            screenOptions={{

              drawerInactiveTintColor: isDarrkMode ? 'gray' : 'black',
              drawerActiveTintColor:  isDriver?theme?.colors?.driver : theme?.colors?.hitchhiker ,
              // drawerActiveBackgroundColor:isDarrkMode?'black':'white',
              drawerPosition: flexDirection.isLangaugeRTL ? 'right' : 'left',
              drawerStyle:
                styles.drawerStyles,


              headerTintColor: theme.colors.text.primary,
              headerStyle: {
                backgroundColor: theme.colors.header,
              },
              headerTitleAlign: "center",
              headerTitle: generalWords['title'],
              headerLeft: () => (

                flexDirection.isLangaugeRTL ? drawerToggle() : null//coins()

              ),
              headerRight: () => (
                flexDirection.isLangaugeRTL ? null : drawerToggle()
              ),
            }}
          >
            <Drawer.Screen name={generalWords['home']} initialParams={{ page: 'home' }}
              options={{
              }}
            >
              {() => <Home CurrentLanguage={currentLanguage} Theme={theme} LanguageWords={languageWords} GeneralWords={generalWords}  />}
            </Drawer.Screen>


            <Drawer.Screen name={pageWords['userRides']} initialParams={{ page: 'userRides' }}
              options={{
              }}
            >
              {() => <UserRides PageWords={pageWords} type={isDriver ? 1 : 2} CurrentLanguage={currentLanguage} Theme={theme} LanguageWords={languageWords} GeneralWords={generalWords} />}
            </Drawer.Screen>


            <Drawer.Screen name={pageWords['approvedRides']} initialParams={{ page: 'approvedRides' }}
              options={{
              }}
            >
              {() => <ApprovedRides PageWords={pageWords} type={isDriver ? 1 : 2} CurrentLanguage={currentLanguage} Theme={theme} LanguageWords={languageWords} GeneralWords={generalWords} />}
            </Drawer.Screen>

            <Drawer.Screen name={generalWords['addRide'] || 'addRide'}
              initialParams={{ page: 'addRide' }}
            >
              {() => <AddDriveOrRequest CurrentLanguage={currentLanguage} GoogleMapsApiKey={GoogleMapsApiKey} Theme={theme} GeneralWords={generalWords} PageWords={languageWords.addRide} />}
            </Drawer.Screen>

            <Drawer.Screen name={'approvedRideDetails'}
              options={{ drawerItemStyle: { display: 'none' } }} initialParams={{ page: 'approvedRideDetails' }}
              component={ApprovedRideDetails}
            >
            </Drawer.Screen>

            <Drawer.Screen name={pageWords['profile']} initialParams={{ page: 'profile' }}
              options={{ drawerItemStyle: { display: 'none' } }}
            >
              {() => <Profile Theme={theme} LanguageWords={generalWords} isDriver={isDriver}/>}
            </Drawer.Screen>


            <Drawer.Screen name={'rideDetails'}
              options={{ drawerItemStyle: { display: 'none' } }}
              component={RideDetails}

            >
            </Drawer.Screen>

            <Drawer.Screen name={'Requests'}
              options={{ drawerItemStyle: { display: 'none' } }}
              component={Requests}

            >
            </Drawer.Screen>

            <Drawer.Screen name={generalWords['settings']}  initialParams={{ page: 'settings' }}

            >
              {() => <Settings Theme={theme} GeneralWords={generalWords} PageWords={languageWords.settings}  CurrentLanguage={currentLanguage} isDriver={isDriver}/>}
            </Drawer.Screen>


          </Drawer.Navigator>
        </View>
        <View>
          {/* ... */}

        </View>
      </View >
    </SafeAreaProvider >

  );
}



const createStyles = (theme, darkMode, directionStyle, isDrawerOpen) => StyleSheet.create({

  overlay: {
    backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: directionStyle.flexDirection,
    // justifyContent: 'space-around',
    height: 60,
    alignItems: 'center',
    zIndex: isDrawerOpen ? -1 : 3,


  },
  animatedView: {
    // backgroundColor: darkMode ? 'rgba(0, 0, 0)',

  },
  iconContainer: {
    alignItems: 'center',

  },
  drawerContainer: {
    flex: 1,

  },

  topButtons: {
    marginHorizontal: 20,
    color: theme?.colors?.text.primary,
  }



  ,
  drawerToggleContainer: {
    alignItems: 'center',
  },

  eachOption: {
    borderColor: 'rgba(0, 0, 0, 0.3)'
    , borderWidth: 1,
    padding: 10,
    paddingVertical: 15,
    backgroundColor: theme?.colors?.header,

  },

  drawerButton: {
    margin: 0, // Set margin to 0
    padding: 0, // Set padding to 0
    // Additional style properties as needed
  },
  eachOptionText: {
    alignSelf: 'center', overflow: 'scroll', color: theme?.colors?.text.primary,
  },
  activeScreen: {
    // tintColor: 'green'
  },
  drawerStyles: {
    backgroundColor: theme?.colors?.header,

  },
  circle: {
    width: 40, // Adjust the width and height to your preference
    height: 40,
    borderRadius: 9000,
    borderWidth: 2,
    borderColor: theme?.colors?.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});