

import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Dimensions } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { userContext } from '../../context/UserContext';
import { rideContext } from '../../context/RidesContext';
import noPhoto from '../../asserts/images/noPhoto.png';
import { formatDateTime, formatHourTime, formatAddressWithoutCountry } from '../../comp/FormatFunctions';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const imageSize = width * 0.2;

export default function Requests({ route }) {
  const navigation = useNavigation();

  // usersRideRequests, tremp_id, creator_id,
  const { Ride, Theme, LanguageWords, CurrentLanguage, } = route.params;
  const { tremp_id, create_date, from_route, to_route, seats_amount, tremp_time, tremp_type } = Ride;
  const [isInAction, setIsInAction] = useState(false);

  const styles = createStyles(
    Theme.colors.primary,
    Theme.colors.secondary,
    Theme.colors.text,
    Theme.colors.background,

  );
  console.log("222222222222222222222");
  console.log(LanguageWords);

  const { UpdateApproveStatus, GetUsersRequests, DeleteRide } = useContext(rideContext);
  const [requests, setRequests] = useState(usersRideRequests);
  const [usersRideRequests, setUsersRideRequests] = useState(null);
  const GetUsersRequestsToJoin = async () => {
    const result = await GetUsersRequests(tremp_id,userLoggedIn?.token);

    if (result?.status) {

      setRequests(result.data)
    }

  }

  useEffect(() => {
    GetUsersRequestsToJoin();
  }, [Ride]);
  console.log(route);
  const { userLoggedIn, UpdateLoggedInUser, UpdateLoggedInUserImage } = useContext(userContext);
  const handleRightPress = async (userRequest, index) => {
    const bodyInfo = { tremp_id: tremp_id, creator_id: userLoggedIn?.user?.user_id, user_id: userRequest?.user_id, approval: "approved" };

    let result = await UpdateApproveStatus(bodyInfo, userLoggedIn.token);

    if (result?.status) {
      setRequests((prevRequests) =>
        prevRequests.map((perUserRequest) =>
          perUserRequest.user_id === userRequest?.user_id ? { ...userRequest, is_confirmed: "approved" } : perUserRequest
        )
      );
    }
  };

  const handleLeftPress = async (userRequest, index) => {
    const bodyInfo = { tremp_id: tremp_id, creator_id: userLoggedIn?.user?.user_id, user_id: userRequest?.user_id, approval: "denied" };
    let result = await UpdateApproveStatus(bodyInfo, userLoggedIn.token);
    if (result?.status) {
      setRequests((prevRequests) =>
        prevRequests.map((perUserRequest) =>
          perUserRequest.user_id === userRequest?.user_id ? { ...userRequest, is_confirmed: "denied" } : perUserRequest
        )
      );
    }
  };

  const handleImagePress = (data) => {
    console.log("handleImagePress");
    console.log(data);
  }

  const handleDeleteRide = async (rideInfo) => {

    if (isInAction) {
      return;
    }
    setIsInAction(true);
    const deleteJson = { tremp_id: rideInfo.tremp_id, user_id: userLoggedIn.user.user_id }
    try {
      let result = await DeleteRide(deleteJson, userLoggedIn.token)
      if (result?.status) {
        navigation.goBack()
      }

    } catch (error) {
      console.log(error);

    }
    finally {
      setIsInAction(false);

    }
    Alert.alert(userMessage);

  }
  const renderedRequests = requests?.map((userRequest, index) => (
    <Card style={[userRequest?.is_confirmed == 'approved' ? styles.requestApproved : userRequest?.is_confirmed == 'denied' ? styles.requestDenied : styles.requestPending, styles.requestCard]} title="Ride Details" key={index} >
      <Card.Content style={styles.requestCardContent}>
        {/* <Text style={{ color: 'white' }}>{JSON.stringify(userRequest) || 0}</Text> */}
        <View style={[{ justifyContent: 'space-between' }]}>

          <Text style={styles.cardText}>{userRequest?.is_confirmed} </Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>

            <Button mode="contained" onPress={() => handleRightPress(userRequest, index)} buttonColor='green' style={styles.requestButton}>
              {LanguageWords?.requests?.accept}
            </Button>

            <Button mode="contained" onPress={() => handleLeftPress(userRequest, index)} buttonColor={Theme.colors.secondary} style={styles.requestButton}>
              {LanguageWords?.requests?.deny}

            </Button>

          </View>
        </View>
        <View style={[, { alignItems: 'center' }]}>
          <View >

            <Text style={styles.cardText}>{userRequest?.first_name || "first name"} {userRequest?.last_name || "last name"} </Text>
          </View>

          <TouchableOpacity onPress={() => handleImagePress(userRequest)} style={styles.imageContainer}>
            <Image source={userRequest?.image_URL ? { uri: userRequest.image_URL } : noPhoto} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>

          <View style={[, { alignItems: 'center' }]}>
            <Text style={styles.cardText}>{userRequest?.gender == "M" ? "Male" : userRequest?.gender == "F" ? "Female" : "Gender"} </Text>


          </View>
        </View>
      </Card.Content>

    </Card >

  ));
  return (



    <View style={styles.container}>
      <Card style={styles.rideCard} title="Ride Details">
        {/* <Text style={{color:'red' , backgroundColor:'yellow'}}>{JSON.stringify(requests)}</Text> */}

        <Card.Content >

          <Text style={[styles.cardText, { textAlign: 'center', marginBottom: 5 }]}>My Tremp</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 5 }}>

            <View style={{ flex: 1 }}>

              <Text style={[styles.cardText, styles.underline,]}>{LanguageWords?.general?.rideTime}</Text>
              <Text style={styles.cardText}>
                {formatDateTime(tremp_time)}
              </Text>
              <Text style={styles.cardText}>
                {formatHourTime(tremp_time)}
              </Text>
            </View>
            <View style={{ flex: 3, flexWrap: 'wrap', overflow: 'hidden' }}>
              <Text style={[styles.cardText, styles.underline,]}>{LanguageWords?.general?.route} </Text>
              <Text style={styles.cardText}>{formatAddressWithoutCountry(from_route)} </Text>
              <Text style={styles.cardText}>{formatAddressWithoutCountry(to_route)} </Text>
            </View>
            <View style={{ justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
              <Text style={styles.cardText}>{LanguageWords?.general?.seats} {seats_amount} </Text>
              <TouchableOpacity onPress={(data) => handleDeleteRide(Ride)} style={styles.deleteButton}>
                <Text style={styles.cardText}>מחק</Text>
              </TouchableOpacity>
            </View>
            {/* <Text style={styles.cardText}>{tremp_type} </Text> */}
          </View>
        </Card.Content>

      </Card>
      <ScrollView style={{ marginBottom: 120 }}>
        {/* <Text style={styles.cardTextColor}>{LanguageWords.profile}</Text> */}
        {renderedRequests}
      </ScrollView>
    </View>
  );
}

const createStyles = (primary, secondary, text, background) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
      padding: 16,
    },
    rideCard: {
      backgroundColor: background,
      borderWidth: 2,
      borderColor: text.primary
    },
    requestCard: {
      backgroundColor: background,
      borderWidth: 2,
      marginVertical: 5
    },
    requestDenied: {
      borderColor: 'red',
    },
    requestApproved: {
      borderColor: 'green',
    },
    requestPending: {
      borderColor: text.secondary,
    },

    requestCardContent: {
      flexDirection: 'row', justifyContent: 'space-between'

    },
    cardText: {
      color: text.primary
    },
    textColor: {
      color: text.primary,
      textAlign: 'center',
      marginVertical: 8,
    },
    editText: {
      color: primary,
      textAlign: 'center',
      marginVertical: 8,
    },
    input: {
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1.2,
      shadowColor: '#000',
      marginBottom: 16,
      borderColor: 'gray',
      borderWidth: 2,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginVertical: 10,
      backgroundColor: background,
      color: 'red',
      textColor: 'red',
    },
    imageContainer: {
      alignSelf: 'center',
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
      borderWidth: 2,
      borderColor: text.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 16,
    },
    image: {
      width: imageSize,
      height: imageSize,
      borderRadius: imageSize / 2,
    },
    underline: {
      textDecorationLine: 'underline'
    },


  });
