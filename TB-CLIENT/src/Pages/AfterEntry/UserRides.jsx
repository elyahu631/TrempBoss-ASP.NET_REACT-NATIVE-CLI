import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Button, Alert } from 'react-native'
import React, { useContext, useEffect, useState, useCallback } from 'react'
import { Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome';

// import BottomTabNavigator from '../../navigators/BottomTabNavigator';
import { rideContext } from '../../context/RidesContext';
import { userContext } from '../../context/UserContext';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import SwipeableComp from '../../comp/SwipeableComp';
import FilterModal from './FilterModal';
import { title } from '../../styleElements/StylesElements';
export default function UserRides(props) {
  const { userLoggedIn, getUserById, isDriver, setIsDriver } = useContext(userContext);
  const [isLoading, setIsLoading] = useState(false); // New state variable
  const [isInAction, setIsInAction] = useState(false); // New state variable

  // const [showDriverRides, setshowDriverRides] = useState(props.type);


  const [rides, setRides] = useState([]);
  const [filter, setFilter] = useState('');
  const navigation = useNavigation(); // Access the navigation prop
  const { trempsByFilters, joinRide, userRides, DeleteRide } = useContext(rideContext);



  const [modalVisible, setModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    allApproved: false,
    noBidders: false,
    approved: false,
    waitingForApproval: false,
    noOffers: false,
    awaitingConfirmation: false,
  });


  const styles = createStyles(
    props.Theme,
    props.LanguageWords.align,
    title(isDriver, props.Theme)

  );
  const handleApplyFilter = (options) => {
    setModalVisible(false);
    setFilterOptions(options);
  };



  useEffect(() => {
    const onFocus = async () => {
      await getRides();
      filterRides();
    };

    navigation.addListener('focus', onFocus);

    return () => {
      navigation.removeListener('focus', onFocus);
    };
  }, [isDriver]); // Added isDriver as a dependency

  useEffect(() => {
    getRides();
    filterRides();

  }, [filterOptions, isDriver]);

  const getRides = async () => {
    console.log(userLoggedIn.user.user_id);
    console.log(isDriver);
    if (isLoading) return;
    setIsLoading(true);

    const fetchOptions = {
      user_id: userLoggedIn.user.user_id,
      tremp_type: isDriver ? 'driver' : 'hitchhiker',
    };

    try {
      const resultDriver = await userRides(userLoggedIn.token, fetchOptions);
      setRides(resultDriver.data);

    } catch (error) {
      setRides([]);
    }
    finally {
      setIsLoading(false);
    }
  };











  const handleFilterChange = (text) => {
    setFilter(text);
  };

  const filterRides = () => {
    if (filter === '' && !filterOptions) {
      return rides;
    }
    let filteredRides = []
    if (!filterOptions?.allApproved && !filterOptions?.approved && !filterOptions?.noBidders && !filterOptions?.waitingForApproval && !filterOptions?.noOffers && !filterOptions?.awaitingConfirmation) {
      filteredRides = rides.filter(
        (ride) =>

        (ride.from_route.toLowerCase().includes(filter.toLowerCase()) ||
          ride.to_route.toLowerCase().includes(filter.toLowerCase()))

      );
    }
    else {
      filteredRides = rides.filter(
        (ride) =>

          (ride.from_route.toLowerCase().includes(filter.toLowerCase()) ||
            ride.to_route.toLowerCase().includes(filter.toLowerCase()))
          &&
          ((filterOptions?.allApproved && ride?.approvalStatus == "all approved") ||
            (filterOptions?.approved && ride?.approvalStatus == "approved") ||
            (filterOptions?.noBidders && ride?.approvalStatus == "no bidders") ||
            (filterOptions?.waitingForApproval && ride?.approvalStatus == "waiting for approval from driver") ||
            (filterOptions?.noOffers && ride?.approvalStatus == "no offers") ||
            (filterOptions?.awaitingConfirmation && ride?.approvalStatus == "awaiting confirmation from you")


          )
      );

    }

    return filteredRides;
  };

  const handleRightPress = (ride) => {

    navigation.navigate('Requests', {
      Ride: ride,
      Theme: props.Theme,
      LanguageWords: props.LanguageWords,
      CurrentLanguage: props.CurrentLanguage

    });

    // Alert.alert('Right clicked')
  }
  const handleLeftPress = async (e) => {
    if (isInAction) {
      return;
    }
    setIsInAction(true);
    let userMessage = ""
    const deleteJson = { tremp_id: e, user_id: userLoggedIn.user.user_id }
    try {
      const result = await DeleteRide(deleteJson, userLoggedIn.token)
      console.log("resultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresult");
      console.log(result);

      userMessage = result?.status ? "בוצע בהצלחה" : "1שגיאה במחיקה ,נסה שנית מאוחר יותר"

    } catch (error) {
      userMessage = "שגיאה במחיקה ,נסה שנית מאוחר יותר"

    }
    finally {

      setIsInAction(false);
    }
    Alert.alert(userMessage)

    getRides();

    // Alert.alert(JSON.stringify(result))
  }
  const handleFilterOptionRemove = (key) => {
    setFilterOptions((prevOptions) => ({
      ...prevOptions,
      [key]: false,
    }));
  };

  const rideComps = () => {
    if (!rides || rides?.length === 0) {
      return null;
    }

    const filteredRides = filterRides();
    const trueFilterOptions = Object.entries(filterOptions).filter(([, value]) => value === true);
    return (
      <>

        {trueFilterOptions.length > 0 && (
          <View style={styles.filterOptionsContainer}>
            {trueFilterOptions.map(([key, value]) => (
              <View key={key} style={styles.filterOption}>
                <Text style={styles.filterOptionText}>
                  {/* {props.LanguageWords[key]} */}
                  {key}
                </Text>
                <TouchableOpacity
                  onPress={() => handleFilterOptionRemove(key)}
                  style={styles.filterOptionRemoveButton}
                >
                  <Text style={styles.filterOptionRemoveButtonText}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.cardContainer}>
          {filteredRides.map((ride, index) => (
            <SwipeableComp
              userRides={true}
              key={index}
              ride={ride}
              handleRightPress={handleRightPress}
              handleLeftPress={handleLeftPress}
              rightIcon={{ name: "info-circle", background: 'blue' }}
              leftIcon={{ name: "trash", background: 'red' }}
              Theme={props.Theme}
              LanguageWords={props.LanguageWords.general}
              CurrentLanguage={props.CurrentLanguage}
              trempTypeRequest={isDriver ? 'driver' : 'hitchhiker'}
            />
          ))}
        </View>
      </>
    );
  };



  return (
    <View style={styles.container}>
      <ScrollView style={{ marginBottom: 60, marginHorizontal: 15, }}>
        <View style={{ justifyContent: 'center' }}>

          <View style={styles.pickerContainer}>
            <Text style={styles.title}>{props.PageWords["userRides"]}</Text>

          </View>
          <TouchableOpacity style={{ position: 'absolute', right: 25 }}>
            <Icon
              name="filter"
              size={30}
              color={props.Theme?.colors?.text?.secondary || 'blue'}
              onPress={() => setModalVisible(true)}
            />

            {/* Render the FilterModal */}
            <FilterModal
              Theme={props.Theme}
              visible={modalVisible}
              onApplyFilter={handleApplyFilter}
              onClose={() => setModalVisible(false)}
              FilterOptions={filterOptions}
              IsDriver={isDriver}
            />
          </TouchableOpacity>
        </View>

        <TextInput
          placeholderTextColor={props.Theme.colors.input.placeholder}
          style={styles.input}
          placeholder={props?.GeneralWords?.searchPlaceholder}
          onChangeText={handleFilterChange}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color={isDriver ? props.Theme?.colors?.driver : props.Theme?.colors?.hitchhiker} />
        ) : (
          <View style={styles.cardContainer}>{rideComps()}</View>
        )}
        <View style={{ marginBottom: 50 }} />
      </ScrollView>
    </View>
  );
}

const createStyles = (theme, align, title) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme?.colors?.background,

    },
    cardContainer: {
      gap: 10,
      marginTop: 10
    },

    text: {
      color: theme?.colors?.text?.primary,
      textAlign: align,
    },
    input: {
      borderWidth: 1,
      borderColor: theme?.colors?.input?.border,
      padding: 10,
    },

    pickerContainer: {
      margin: 10,
      flex: 1
    },
    title: title,


    filterOptionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginVertical: 5,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme?.colors?.primary,

      margin: 4,
    },
    filterOptionText: {
      color: theme?.colors?.text.primary,
      marginRight: 5,
    },
    filterOptionRemoveButton: {
      backgroundColor: theme?.colors?.text.secondary,
      borderRadius: 10,
      paddingHorizontal: 5,
    },
    filterOptionRemoveButtonText: {
      color: theme?.colors?.background,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });
