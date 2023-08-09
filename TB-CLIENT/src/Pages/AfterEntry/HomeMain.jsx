// In App.js in a new project

import react, { useContext } from 'react';
import {
  Alert,
  Image,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { userContext } from '../../context/UserContext';


import { TranslationContext } from '../../styles/Languages/Languages';

import { ThemeContext } from '../../styles/Themes/ThemeContext';

import DrawerComp from '../../navigators/DrawerComp';



import messaging from '@react-native-firebase/messaging';
import { getNotificationToken, notificationLister, requestUserPermission } from '../../comp/Notification';
import FAB from '../../FAB/FAB';
import SubButton from '../../FAB/SubButton';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

export default function HomeMain() {
  const { userLoggedIn, setUserLoggedIn, UpdateLoggedInUser, isDriver, setIsDriver } = useContext(userContext);
  const navigation = useNavigation();
  const { currentLanguage, setLanguage, GetDictByLangAndKey, LanguageWords } = useContext(TranslationContext);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new message arrived!', JSON.stringify(remoteMessage.notification.title + ' ' + remoteMessage.notification.body +" inapp"));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    requestUserPermission();
    notificationLister(navigation,LanguageWords().general);
    getNotificationToken(UpdateLoggedInUser);


  }, [])











  // console.log(userLoggedIn);

  const wordsKey = 'general';
  // const pageWords = GetDictByLangAndKey(wordsKey);


  const { setTheme, lightTheme, darkTheme ,theme } = useContext(ThemeContext);
  const isDarrkMode = useColorScheme() == 'dark'
  useEffect(() => {
    if (isDarrkMode) {
      setTheme(darkTheme)
    }
    else {
      setTheme(lightTheme)
    }

  }, [isDarrkMode])



  return (
    <View style={{ flex: 1, }}>
    {/* Set the zIndex of FAB to a lower value */}
    <View style={[styles.root]}>
      <FAB>
        <SubButton onPress={() => { setIsDriver(true)}} label="1" size={30} color={'white'} icon ={"wheel"}  backGroundColor={theme?.colors?.driver}/>
        <SubButton onPress={() => { setIsDriver(false)}} label="2"size={30} color={'white'} icon={"hand"}  backGroundColor={theme?.colors?.hitchhiker}/>

      </FAB>
    </View>
  </View>
  );
}



const styles = StyleSheet.create({
  root: {
   flex:1,
  },



});