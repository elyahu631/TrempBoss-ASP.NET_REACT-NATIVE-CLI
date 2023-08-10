import { View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, ScrollView, TextInput, ActivityIndicator, Animated, Alert } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Button, Text } from 'react-native-paper'
// import BottomTabNavigator from '../../navigators/BottomTabNavigator';
import { rideContext } from '../../context/RidesContext';
import { userContext } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SwipeableComp from '../../comp/SwipeableComp';
import FlexDirectionStyle from '../../styles/FlexDirection';
import { title } from '../../styleElements/StylesElements';

export default function Home(props) {
  const flexDirection = FlexDirectionStyle();

  const { userLoggedIn, getUserById, isDriver, setIsDriver } = useContext(userContext);
  const [isLoading, setIsLoading] = useState(true); // New state variable
  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('');
  const navigation = useNavigation(); // Access the navigation prop
  const { trempsByFilters, joinRide } = useContext(rideContext);

  useEffect(() => {
    getRides()
  }, [isDriver])










  const getRides = async () => {
    setIsLoading(true); // Set isLoading to true before starting the request

    const result = await trempsByFilters(userLoggedIn.token, {
      creator_id: userLoggedIn?.user?.user_id,
      tremp_time: new Date(),
      tremp_type: isDriver ? 'hitchhiker' : 'driver',
    });
    if (typeof result === 'number') {
      setRides([]);
    } else {
      setRides(result.data)
      // sortRidesByDate(result)

    }
    setIsLoading(false); // Set isLoading to false after the request completes
  };

  useEffect(() => {
    getRides();
  }, []);

  const handleFilterChange = (text) => {
    setFilter(text);
  };

  const filterRides = () => {
    if (filter === '') {
      return rides;
    }

    const filteredRides = rides.filter(
      (ride) =>
        ride?.from_route.toLowerCase().includes(filter.toLowerCase()) ||
        ride?.to_route.toLowerCase().includes(filter.toLowerCase())
    );

    return filteredRides;
  };

  const sendJoinRequest = async (tremp_id, user_id) => {

    const joinRideRequest = await joinRide(tremp_id, user_id, userLoggedIn.token)

    if (joinRideRequest?.status) {

      getRides();
    }
    else {
      Alert.alert('הודעה', "נכשל בשליחת בקשה ,נסה שנית מאוחר יותר")

    }

  }


  const handleRequestJoin = (tremp_id) => {
    Alert.alert(
      'Join ride',
      'Are you sure you want to request to join the ride?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            try {
              sendJoinRequest(tremp_id, userLoggedIn.user.user_id)
            } catch (error) {
              Alert.alert('error sending join request ', error);

            }
            Alert.alert('Request sent!');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleInfo = (ride) => {
    // console.log(ride);
    navigation.navigate('rideDetails', { ride: ride , LanguageWords:props.LanguageWords})
  };


  const rideComps = () => {
    const filteredRides = filterRides();
    if (Object.keys(filteredRides).length === 0) {
      return <Text style={{ color: props.Theme.colors.text.primary, textAlign: 'center' }}>No rides found</Text>
    }
    return filteredRides.map((ride, index) => (
      // sendJoinRequest(tremp_id, userLoggedIn.user._id)

      <SwipeableComp key={index} ride={ride} handleRightPress={handleInfo} handleLeftPress={handleRequestJoin} rightIcon={{ name: "info-circle", background: 'blue' }} leftIcon={{ name: "plus-circle", background: 'green' }} Theme={props.Theme} LanguageWords={props.LanguageWords.general} CurrentLanguage={props.CurrentLanguage} />

    ));
  };

  const styles = createStyles(
    props.Theme,
    flexDirection,
    title(isDriver, props.Theme)

  );
  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 60 }}>
        <View>
          {isDriver ? <Text style={styles?.title}>{props?.LanguageWords?.addRide?.rideRequests}</Text> :
            <Text style={styles?.title}>{props?.LanguageWords.addRide.rideOffers}</Text>
          }


        </View>
        <View style={styles.header}>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <TextInput
              placeholderTextColor={props.Theme.colors.input.placeholder}
              style={styles.input}
              placeholder={props?.GeneralWords?.searchPlaceholder}
              onChangeText={handleFilterChange}
            />
            <TouchableOpacity style={{ position: 'absolute', padding: 8, right: flexDirection?.textAlign == "right" ? 0 : null, left: flexDirection?.textAlign == "left" ? 0 : null }} onPress={getRides}>
              <Icon name="refresh" size={30} color={props.Theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* <View style={{ flex: 1, alignItems: 'center'}}>
            <TouchableOpacity onPress={getRides}>
              <Icon name="refresh" size={30} color={props.Theme.colors.text.secondary} />
            </TouchableOpacity>
          </View> */}

        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={isDriver ? props.Theme?.colors?.driver : props.Theme?.colors?.hitchhiker} />
        ) : (
          <View style={styles.outCardContainer}>{rideComps()}</View>
        )}
        <View style={{ marginBottom: 50 }} />


      </ScrollView>
    </View>
  );
}


const createStyles = (theme, flexDirection, title) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      textAlign: 'right',
      paddingHorizontal: 15
    },
    outCardContainer: {
      marginTop: 15,
      display: 'flex',
      gap: 10,

    },
    card: {
      alignItems: 'center',
      borderRadius: 8,
      padding: 10,
      elevation: 1,
    },
    text: {
      color: theme.colors.text.primary,
      textAlign: flexDirection.textAlign,
    },
    input: {
      borderWidth: 1,
      borderColor: theme?.colors?.input?.border,
      padding: 10,
      textAlign: flexDirection.textAlign
    },
    title: title,
    header: {
      flexDirection: flexDirection.flexDirection, alignItems: 'center',
    }


  });
